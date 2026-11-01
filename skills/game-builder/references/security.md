# Security: the game must be safe to play and to host

Read this for any game with more than one player, any online service, any save or account data, and before a public release.
Players run your code and your host's code. A game that can be crashed, frozen, spoofed or used to reach someone's machine is not finished.

## Contents
1. Threat model: decide it with the user
2. Authority and validation
3. Admission: the door
4. Parsing and limits
5. Anti-cheat basics
6. Privacy
7. Secrets
8. Testing: a hostile client
9. Online services
10. What a hostile client can still do
11. Checks

## 1. Threat model: decide it with the user
"Cheating: accepted" is fine for a private game among friends and wrong for a public or paid one. At intake ask: who can join (friends, anyone with a code, a public list)? Is anything permanent or ranked (achievements, unlocks, leaderboards, accounts)? Write the answer in `GAME_VISION.md` and `DECISIONS.md`.
- Default stance for anything public: **the host (or server) is the authority, clients send intents, everything is validated.**
- Mods and fun cheats can be a room option the host turns on, but anything that touches permanent, online-facing data (achievements, unlocks, stats others see) is blocked at all times. Status in the source project: **planned**.
- Do the security audit as its own pass (a reviewer who only attacks), after the networking is stable and before release.

## 2. Authority and validation
- The host owns anything that affects more than one player: score, timers, round state, shared objects, who holds what.
- Clients send requests ("grab 7"), never results ("I hold 7").
- Validate every intent: sender identity (from the engine, never from an argument), state (alive, allowed now), range, rate and cooldown, ownership, **line of sight from the avatar's eye** (never the client's own ray; a distance check alone lets a client take things through glass), and size of the payload.
- A detached or debug camera is never an interaction origin: grab, throw, eat and line of sight start at the avatar.
- Replicate decisions made by authority (a fall direction, a hit result) instead of letting each peer decide.
- Ignore, do not crash on, an intent that arrives for something that no longer exists.

## 3. Admission: the door
Build admission *before* any game state is allocated for a stranger. A peer at the door gets no object spawns, no synchronisation, no game RPCs.
- Use the engine's pre-connection authentication hook (Godot: `SceneMultiplayer` `auth_callback`, `send_auth`, `complete_auth`) so ENet and any relay peer take the same path. Put an `auth_timeout` as a backstop.
- Steps: HELLO (protocol version, name) -> password challenge if the room has one -> the host's accept or reject if "ask to join" is on -> WELCOME. Each step has its own timeout (example: hello 10 s, password 90 s, host answer 60 s; the timeouts and size cap in `assets/templates/net_enet.gd` are shorter and are the ones to start from).
- **Passwords are never sent, stored or listed in clear.** The host keeps SHA-256(random salt + password). Each attempt gets a fresh random nonce; the joiner answers HMAC-SHA256(key, nonce); the host compares in constant time.
- **Room codes do not encode the host's IP** or any personal data. Use random codes resolved through a lobby or relay service; a direct address code, if offered on a LAN, is not secret and must be labelled so.
- Per-identity limits (identity = remote address or the online service's user id), checked when the connection arrives, before it says anything. Starting values from one project: 5 wrong passwords then 60 s lock; a rejection then 30 s, a third rejection for the room's lifetime; more than 8 attempts a minute then 60 s; at most 6 strangers at the door at once; at most 2 places per identity.
- Defaults for new rooms: private, no password, ask-to-join on, sensible max players. Nothing from one room's settings carries to the next.
- Host actions: kick, ban for the session, close the room. A rejected or kicked peer cannot rename itself or reset its stats afterwards.
- Late joiners during a run wait at the door until the room is back in the lobby, or are refused with a clear message; decide and log.

## 4. Parsing and limits
- **Bound every string and array length before you read it.** In Godot, RPC arguments are decoded before your function runs, so a size check inside an RPC is too late. The only place to see raw bytes first is the authentication hook, so put anything free-form (hello, name, password response) there and reject oversized packets unread.
- Set a maximum packet size for the transport (example: 1164 bytes, the smallest limit among the relay services considered) and keep every message under it. Chunk large data. Never use an ordering mode the transport does not support.
- Limit how much a text filter reads (example: 4 times the length it keeps).
- Unknown message types are dropped. Count violations per peer and disconnect on repeats.
- Rate-limit per peer per message type (movement, chat, voice, interact). Cap the number of spawns a peer may cause.
- Do not log hostile input without truncation; a flood of bad packets must not fill the host's log or disk.

Example (from one project): one 300 KB hello message froze a host for 33 s and dropped its players; moving the hello into the pre-connection hook and turning away anything over the largest legal size (83 bytes) fixed it.

## 5. Anti-cheat basics
- Speed and teleport checks on client-authoritative movement (max speed x time, with slack for lag), reconcile on mismatch.
- Reject impossible state (negative amounts, items you cannot reach, actions while down).
- Never trust client timestamps or client-reported hit results.
- Server-side cooldowns and costs; the client's UI is a hint.
- Save files and settings are the player's: validate on load (versions, ranges), never execute them, never let a save change what other players see without the host validating it.
- Anti-injection (tamper detection of the client binary) is a separate, optional layer. Be honest: it deters casual cheats and does not stop a determined one. Server-side checks do.

## 6. Privacy
- No IP address, email or real name in room codes, room lists, logs or crash reports.
- Player names: length cap, no control characters, a filter you decide with the user. Display names are never trusted for identity.
- Voice chat: needs microphone consent, push-to-talk by default, per-player mute, and a way to block someone for the session (`networking.md`).
- Chat: rate limit; offer a hide-chat option.
- Test and QA runs must never write the player's real save or settings (use a separate user-data directory or a persistence-off flag). A QA name once got saved as a player's own.

## 7. Secrets
- Credentials and keys for online services live only in a git-ignored config file (and an example file with blanks). Never in the repo, a skill, a log, a screenshot or chat.
- Ship only the client-side credential type of a service (a peer-to-peer client policy), never a server-trusted one.
- Check `.gitignore` and the export preset include/exclude lists before the first commit and before every export.
- The user signs in to accounts and accepts legal agreements themselves.

## 8. Testing: a hostile client
Write a suite that runs on loopback against the real host code and prints one line. It must include:
- an oversized hello, a malformed message type, a flood of valid messages, a spoofed sender id or a "who" argument;
- a replayed old message, a speed-hacked movement stream, a teleport;
- a use or grab attempt through a wall or barrier (the host must refuse), an action while down, an action on a freed object;
- a wrong-password storm and a repeated-rejection storm (the limits must engage);
- a client that connects and says nothing (must time out), and one that floods the door.
Pass line: `SECURITY_DONE problems=0`. Add the oversized-hello case to the smoke test in `assets/templates/net_smoke.gd`. Run it after every change to the network layer.

## 9. Online services
- A relay or lobby service needs a probe check (login works, a lobby can be created and found, a join by code works) and the second-machine test below.
- A real online join needs a second machine or Windows user. Mark it UNVERIFIED until one has been done.
- Public lobby attributes are readable by everyone: treat "public/private" filters as UX, not secrecy.
- Record free-tier limits and terms in `TOOLCHAIN.md`. If a code is derived by hashing, estimate how fast it can be brute-forced.

## 10. What a hostile client can still do
Write this list for your own game; do not claim more than you built. Example (from one project):
- read every public lobby's attributes; brute-force a short code's hash offline and find a private online room;
- take a relay-lobby seat without passing the door; on an unencrypted LAN capture a nonce and its proof and run an offline dictionary attack on a weak password;
- dodge per-identity limits with a new address or device id; fill the host's log with dropped packets.
None of that gets past the door to game state; it is listed so nobody assumes it is closed.

## 11. Checks
| Rule | Check | PASS |
|---|---|---|
| Door before state | hostile suite: game packets from the door are dropped | `SECURITY_DONE problems=0` |
| Size bounds | oversized hello rejected unread | same |
| Limits engage | password and rejection storms | same |
| Host validates | grab through glass refused; spoofed id ignored | same |
| No secrets in repo | `check_project.py` secret scan, export preset review | exit 0 |
| QA never writes real saves | run with the flag, diff the user-data directory | by hand |
| Real join | second machine | UNVERIFIED until done |
