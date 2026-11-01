# Networking

Read this when the game has more than one player. Pick the mode first (an **expensive-to-reverse decision: ask the user**), then follow that mode's section.
Security (authority, the door, limits, hostile-client tests) is in `security.md`; read it with this file.

## Contents
1. Choose the mode
2. How players reach each other
3. Authority rules
4. The tested template: `net.gd`
5. Connecting the game to `net.gd`
6. Room flow
7. Network edge cases
8. Testing
9. Web and WebRTC
10. Services that cost money or need accounts
11. Voice chat (proximity)

---

## 1. Choose the mode
| Mode | Use when | How | Template |
|---|---|---|---|
| **none** | single player, puzzle, narrative, most arcade | no network code | - |
| **local** | couch co-op, hot-seat, split-screen | one process, one input device per player, a camera per player or one shared | - |
| **lan** | same network | listen server, direct address | `net_enet.gd` |
| **online** (desktop) | players over the internet | same listen server reached by VPN overlay, UPnP, port forward, or a relay/lobby service | `net_enet.gd` + your lobby service |
| **online-web** | must run in a browser | WebRTC + a signalling service (section 9) | not shipped |
| **dedicated** | competitive, persistent worlds, many players, matchmaking | always-on servers (cost) | out of scope: say so |
Ask: how many players, who can join (friends, anyone with a code, a public list), is anything permanent or ranked, and the budget for services. Default for small friend groups: ENet listen server, a handful of players. Beyond about 8 players measure before promising.
"Peer to peer" in small games means a **host-authoritative listen server** (one player's game is the server). True mesh P2P is much harder to keep correct: avoid it.

## 2. How players reach each other
Godot's multiplayer uses UDP. Most home connections sit behind NAT. Options, most reliable first:
| Method | Notes |
|---|---|
| LAN | always works; direct address |
| VPN overlay (Tailscale, ZeroTier) | works through nearly all NATs; players install a client; check current free limits |
| UPnP | works on many routers; `Net.find_public_ip()` asks the router to open the port |
| Manual port forward | host forwards UDP 7777 |
| Relay / lobby service (an engine platform's service, a lobby backend) | needed for random room codes and a room browser; record terms, limits and cost in `TOOLCHAIN.md` |
| Carrier-grade NAT | hosting impossible: another player hosts, or use a relay |
**Room codes.** `Net.new_room_code()` makes a random code that encodes nothing about the host. Resolving it to an address needs a lookup (lobby service or LAN broadcast): plug it into `Net.resolve_code()`. `code_from_ip`/`ip_from_code` give a *direct address code* for LAN or VPN; it is not secret, so label it that way. Never put an IP in a code you present as private.

## 3. Authority rules
1. **The host is the truth** for anything that affects more than one player: score, round state, timers, doors, shared items, who holds what.
2. **Clients send requests, never results.** "Grab crate 7", not "I now hold crate 7".
3. **Each player controls their own movement** (client-authoritative) for feel; add host-side speed and teleport checks (`security.md`). Switch to host-authoritative movement for competitive or ranked games.
4. **The host validates every request** (alive? free? in range? line of sight? rate?).
5. Announcements go host to everyone; requests go client to host. Nothing client to client.
RPC cheat sheet (Godot 4):
```gdscript
@rpc("any_peer", "call_remote", "reliable")        # client -> host REQUEST
func request_grab(item_path: NodePath) -> void:
	var who := multiplayer.get_remote_sender_id()   # never trust a "who" argument
	if not multiplayer.is_server() or not Net.allow(who, "grab", 10): return
	# ...validate, then apply and announce...

@rpc("authority", "call_local", "reliable")        # host -> everyone ANNOUNCEMENT (host runs it too)
func announce_grab(item_path: NodePath, who: int) -> void: ...

@rpc("any_peer", "call_remote", "unreliable")      # frequent data like position: lossy is fine
func send_position(pos: Vector3) -> void: ...
```
- Set authority explicitly (`set_multiplayer_authority(peer_id)`). Name player nodes by peer id.
- Use `MultiplayerSpawner` so late joiners get existing objects and `MultiplayerSynchronizer` for plain properties. Physics props: the host simulates; clients display synchronised transforms.
- Large static sets (shelf stock, scenery) are built from a shared seed on every machine, never sent. Moving items go in one unreliable snapshot per tick, interpolated by clients.
- Keep every message under the transport's packet limit (`Net.MAX_PACKET`, example 1164 bytes); chunk bigger data.

## 4. The tested template: `net.gd`
`assets/templates/net_enet.gd` (copied to `network/net.gd` by the scaffold). Autoload `Net`. Tested with multi-instance headless runs (`net_smoke.gd`, scenarios A to D).
API: `Net.host(name, password := "")`, `Net.join(code_or_ip, name, password := "")`, `Net.start_game()`, `Net.leave(reason)`, `Net.kick(id)`, `Net.allow(peer, kind, per_second)`, `Net.new_room_code()`, `Net.resolve_code(code)` (your hook), `Net.find_public_ip()`, `Net.code_from_ip/ip_from_code/local_ip`.
Signals: `players_changed`, `join_failed(reason)`, `left_room(reason)`, `game_starting`, `public_ip_found(ip)`. Data: `Net.players`, `Net.room_open`, `Net.room_code`.
Design, and why:
- `server_relay = false`: clients talk only to the host; relaying joins and leaves caused error spam when several left at once.
- **The door**: hello (protocol number, name) and an optional salted-hash/HMAC password proof travel in the pre-connection auth packets. Anything over `MAX_AUTH_BYTES` is dropped unread. Per-address attempt limits, a cap on strangers at the door, and an `auth_timeout`. The host's room limit is enforced at the door ("Room is full") so a stranger gets a reason, not silence.
- Names are cleaned (control characters removed), length-capped, de-duplicated ("Bob" then "Bob 2").
- A join watchdog turns "nobody answering" into a clear message after a few seconds.
- A protocol mismatch is refused with a readable reason (bump `PROTOCOL_VERSION` when a build is incompatible).
- Port busy returns a readable error, not a crash. Host leaving closes the room for everyone (no host migration; log the decision).
Customise only the constants at the top. Not in the template: a lobby/relay service, encryption (ENet is not encrypted on a LAN), host-side movement checks, ask-to-join prompts and bans. Add those per `security.md`.

## 5. Connecting the game to `net.gd`
The lobby screen listens; the level script reacts to the game starting.
```gdscript
# room.gd - Lobby screen. WHAT: shows the room code and the player list; the host presses Start.
extends Control

func _ready() -> void:
	Net.players_changed.connect(_redraw)
	Net.game_starting.connect(func(): get_tree().change_scene_to_file("res://levels/level1/level1.tscn"))
	Net.left_room.connect(func(why): _back_to_menu(why))
	Net.join_failed.connect(func(why): $Message.text = why)

func _redraw() -> void:
	$PlayerList.text = "\n".join(Net.players.values())
	$StartButton.visible = multiplayer.is_server() and Net.players.size() >= 2
```
In the level, spawn one player per entry in `Net.players`. When a player disconnects mid-game (`peer_disconnected` on the host) the level script must remove that player's node **and drop anything they carried**: this is game-specific.

## 6. Room flow
```
MENU -> (Host | Join) -> DOOR -> LOBBY -> Start -> PLAYING (room closed) -> ROUND_END -> LOBBY or MENU
                                  ^                                               |
                                  +---------------- host or player leaves --------+  (everyone gets a message)
```
`State.phase` mirrors this. Every screen has Back or Leave. New rooms default to the safest settings (`security.md` section 3).

## 7. Network edge cases
| Case | In `net.gd`? | Notes |
|---|---|---|
| Room full | Yes | refused at the door with a reason |
| Wrong code / nobody hosting | Yes | watchdog message |
| Wrong or missing password | Yes | refused with a reason; attempts limited per address |
| Oversized or malformed hello | Yes | dropped unread |
| Duplicate / empty / long / control-character names | Yes | cleaned and numbered |
| Join after game started | Yes | refused with reason |
| Different build versions | Yes | refused with reason |
| Stranger who says nothing | Yes | `auth_timeout` |
| Host leaves | Yes | `left_room("Host left the room")` for all |
| Port already in use | Yes | `join_failed` message |
| Many players leave at once | Yes | no error spam |
| Player leaves mid-game | **No: you** | remove node, drop carried items, update win condition |
| Everyone but one leaves | **No: you** | end the round or continue solo; log it |
| Two players act on one object | **No: you** | the host grants the first request |
| Host lag spike / alt-tab | **No: you** | keep timers on the host; test it |
| Latency and packet loss | **No: you** | inject latency/loss in code behind a debug flag, or use a network conditioner (Windows: clumsy; Linux: `tc netem`; macOS: Network Link Conditioner); use unreliable for frequent updates and interpolate |
| Cheating | **No: you** | `security.md`: speed checks, line of sight, rate limits |

## 8. Testing
`scripts/gate.ps1 -Net` (Windows) or `scripts/net_test.sh` run `tests/net_smoke.gd` as real instances: duplicate names, start, late joiner, full room, host leaves, password right and wrong, hostile oversized hello. PASS line: `G9 PASS (net smoke)`. Run it after any change to `net.gd`. Also play two real windows once per feature (the editor can run multiple instances). Add your own hostile cases to the suite (`security.md` section 8).

## 9. Web and WebRTC (not shipped as a template)
Browsers cannot open raw UDP, so ENet does not work in a web export. Use WebRTC (`WebRTCMultiplayerPeer`): peers need a signalling exchange through a small server and a STUN server; strict NATs need a TURN relay, which costs money. Some pairs will fail: show a clear message and a fallback. **Ask the user before choosing web multiplayer**, record limits and costs in `TOOLCHAIN.md`, keep the same `Net` signals so the rest of the game does not change.

## 10. Services that cost money or need accounts
Say it plainly and offer the nearest option within the budget: matchmaking with strangers, ranked play and persistent accounts need servers; store lobbies and relays have fees or terms and tie the game to a platform; voice needs relay or a vetted addon. The user decides. Account creation, sign-in and legal acceptance are the user's steps.

## 11. Voice chat (proximity)
Engines rarely ship a free voice stack. Decide early (ask) and vet the option in the engine's tools file (Godot: TwoVoip; Unity: OpenVoiceSharp or a platform service after verifying terms; Unreal: a platform voice service after verifying terms). Fallback: players use an outside voice app and the game shows a speaking indicator.
Pattern (all engines):
1. Capture the microphone and compress with Opus; push-to-talk by default, voice activation as an option.
2. Send packets through the **Net seam**, unreliable.
3. The host forwards each speaker's packets **only to peers within hearing range**, which keeps bandwidth flat.
4. The receiver plays them from a **3D audio source attached to the speaker**, so volume and panning follow distance.
5. A jitter buffer smooths late packets.
Edge cases: no microphone or permission denied (the game must still start, show a muted icon); device unplugged mid-match; sample-rate mismatch; echo with speakers; muted or blocked players; speaking while knocked down; a player leaving mid-sentence; many people talking at once (cap voices); voice during pause. Privacy: consent, per-player mute and block (`security.md` section 6).
Test: two real instances; speak; check the indicator, the distance falloff and that an out-of-range player is not heard. Audio is a manual check: log it in `HANDOFF.md`.
