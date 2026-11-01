# net.gd - Autoload "Net". ALL multiplayer code lives in this one file.
# WHAT:     ENet listen server with a "door". One player hosts, the others join; the host is the single source of truth.
#           A stranger is authenticated at the door (hello, optional password proof) BEFORE the engine creates any state for them.
# TALKS TO: ui/room/room.gd listens to the signals below. State.gd may read `players`.
# SIBLINGS: none. To change the transport (relay, WebRTC) replace this file and keep the signals.
# WHY LONG: the door (admission, limits, password proof) is kept in this one file on purpose, so it can be read and audited in one place.
# SECURITY: see references/security.md. Everything free-form (name, password proof) travels in the auth packets,
#           because that is the only place where raw bytes can be size-checked before the engine decodes anything.
extends Node

signal players_changed                 # lobby list changed -> redraw it
signal join_failed(reason: String)     # could not join -> show message on menu
signal left_room(reason: String)       # kicked / host left / disconnected -> back to menu
signal game_starting                   # host pressed Start -> everyone loads the level
signal public_ip_found(ip: String)     # result of find_public_ip(); "" means it failed

const GAME_VERSION := "0.1"            # shown to players
const PROTOCOL_VERSION := 1            # bump when a build is incompatible; mismatched joiners are refused
const PORT := 7777
const MAX_PLAYERS := 4                 # host included
const DOOR_SLOTS := 6                  # extra transport slots for strangers who have not passed the door yet
const MAX_NAME_LEN := 16               # characters kept
const MAX_AUTH_BYTES := 128            # any auth packet larger than this is dropped unread (hello is at most 100)
const MAX_PACKET := 1164               # keep every message you design under this (smallest relay limit known); chunk bigger data
const REGISTER_TIMEOUT := 5.0          # seconds a stranger has to finish the door
const JOIN_TIMEOUT := 6.0              # seconds before "Joining..." gives up (nobody answering = silence)
const MAX_ATTEMPTS_PER_MIN := 8        # door attempts per remote address per minute
const MAX_AT_DOOR := 6                 # strangers at the door at once
const ROOM_CODE_ALPHABET := "ABCDEFGHJKMNPQRSTUVWXYZ23456789"   # no look-alike characters

# auth message ids
const M_CHALLENGE := 1                 # host -> joiner: [1, has_password, salt(16), nonce(16)]
const M_HELLO := 2                     # joiner -> host: [2, proto_hi, proto_lo, (proof(32) if has_password), name_len, name...]
const M_WELCOME := 3                   # host -> joiner: [3]
const M_REFUSE := 4                    # host -> joiner: [4, reason utf8...]

var players := {}                      # peer_id -> display name (host's copy is the truth)
var room_open := true                  # false once the game starts: late joiners are refused
var room_code := ""                    # random code the host shows; resolve it with resolve_code() (see below)
var my_name := "Player"
var _reason_from_host := ""
var _upnp_thread: Thread
var _joined := false                   # client: the door is passed
var _my_password := ""
var _pw_key := PackedByteArray()       # host: sha256(salt + password), empty = no password
var _salt := PackedByteArray()
var _nonces := {}                      # host: peer_id -> challenge nonce
var _pending := {}                     # host: peer_id -> cleaned name, welcomed but not yet connected
var _at_door := {}                     # host: peer_id -> true while authenticating
var _door_hits := {}                   # host: address -> Array of timestamps (seconds)
var _rate := {}                        # host: "peer:kind" -> [window_start, count]


func _ready() -> void:
	multiplayer.server_relay = false           # clients only talk to the host (it owns the player list)
	var mp := multiplayer as SceneMultiplayer
	mp.auth_callback = _on_auth
	mp.auth_timeout = REGISTER_TIMEOUT         # backstop: a stranger that stalls is dropped by the engine
	mp.peer_authenticating.connect(_on_peer_authenticating)
	mp.peer_authentication_failed.connect(_on_auth_failed)
	multiplayer.peer_connected.connect(_on_peer_connected)
	multiplayer.peer_disconnected.connect(_on_peer_disconnected)
	multiplayer.connected_to_server.connect(_on_connected_ok)
	multiplayer.connection_failed.connect(_on_connection_failed)
	multiplayer.server_disconnected.connect(_on_server_disconnected)


# ---------- public API (UI calls these) ----------

func host(player_name: String, password := "") -> bool:
	leave("")                                              # clean slate, no stale peer
	var peer := ENetMultiplayerPeer.new()
	if peer.create_server(PORT, MAX_PLAYERS - 1 + DOOR_SLOTS) != OK:   # port busy / blocked
		join_failed.emit("Could not host (port %d busy?)" % PORT)
		return false
	multiplayer.multiplayer_peer = peer
	my_name = _clean_name(player_name)
	players = {1: my_name}
	room_open = true
	room_code = new_room_code()
	_salt = Crypto.new().generate_random_bytes(16)
	_pw_key = _sha256(_salt + password.to_utf8_buffer()) if password != "" else PackedByteArray()
	players_changed.emit()
	return true


func join(room_code_or_ip: String, player_name: String, password := "") -> void:
	leave("")
	var address := ip_from_code(room_code_or_ip)           # a direct (LAN / VPN) address code
	if address == "":
		address = resolve_code(room_code_or_ip)            # random room code via your lobby service
	if address == "":
		address = room_code_or_ip.strip_edges()            # allow typing an IP directly
	if address == "":
		join_failed.emit("Enter a room code")
		return
	var peer := ENetMultiplayerPeer.new()
	if peer.create_client(address, PORT) != OK:
		join_failed.emit("Bad address")
		return
	multiplayer.multiplayer_peer = peer
	my_name = _clean_name(player_name)
	_my_password = password
	_join_watchdog(peer)


func start_game() -> void:                                 # host only
	if not multiplayer.is_server() or players.size() < 1:
		return
	room_open = false
	_begin.rpc()


func leave(reason: String) -> void:                        # safe to call any time, any number of times
	if multiplayer.multiplayer_peer != null:
		multiplayer.multiplayer_peer.close()
		multiplayer.multiplayer_peer = null
	players.clear()
	_pending.clear()
	_at_door.clear()
	_nonces.clear()
	_joined = false
	_my_password = ""
	room_open = true
	_reason_from_host = ""
	if reason != "":                                       # "" = quiet leave (no message to show)
		left_room.emit(reason)


func kick(peer_id: int) -> void:                           # host only
	if multiplayer.is_server() and peer_id != 1 and peer_id in multiplayer.get_peers():
		multiplayer.multiplayer_peer.disconnect_peer(peer_id)


# Game RPCs call this first: returns false when a peer sends a kind of message too often.
# Example: if not Net.allow(multiplayer.get_remote_sender_id(), "grab", 10): return
func allow(peer_id: int, kind: String, per_second: int) -> bool:
	var key := "%d:%s" % [peer_id, kind]
	var now := Time.get_ticks_msec() / 1000.0
	var slot: Array = _rate.get(key, [now, 0])
	if now - float(slot[0]) >= 1.0:
		slot = [now, 0]
	slot[1] += 1
	_rate[key] = slot
	return int(slot[1]) <= per_second


# ---------- room codes ----------
# new_room_code(): a random code. It encodes NOTHING about the host (no address, no name).
# To join by it you need a lookup: a lobby/relay service, or a LAN broadcast. Plug that into resolve_code().
# code_from_ip()/ip_from_code(): a DIRECT address code (an IPv4 written as 8 hex characters) for LAN or VPN.
# It is not secret and not private: anyone who sees it knows the address. Label it that way in the UI.

func new_room_code() -> String:
	var bytes := Crypto.new().generate_random_bytes(6)
	var code := ""
	for b in bytes:
		code += ROOM_CODE_ALPHABET[b % ROOM_CODE_ALPHABET.length()]
	return code


func resolve_code(_code: String) -> String:                # replace: ask your lobby service, return an address or ""
	return ""


func code_from_ip(ip: String) -> String:                   # "192.168.1.20" -> "C0A80114"
	var code := ""
	for part in ip.split("."):
		code += "%02X" % clampi(int(part), 0, 255)
	return code


func ip_from_code(code: String) -> String:                 # "C0A80114" -> "192.168.1.20", "" if invalid
	code = code.strip_edges().to_upper()
	if code.length() != 8 or not code.is_valid_hex_number():
		return ""
	var parts := PackedStringArray()
	for i in 4:
		parts.append(str(code.substr(i * 2, 2).hex_to_int()))
	return ".".join(parts)


func local_ip() -> String:                                 # first private IPv4, for LAN rooms
	for ip in IP.get_local_addresses():
		if ip.begins_with("192.168.") or ip.begins_with("10.") or ip.begins_with("172."):
			return ip
	return "127.0.0.1"


func find_public_ip() -> void:                             # asks the router (UPnP) to open the port
	_upnp_thread = Thread.new()                            # blocking call -> runs in a thread
	_upnp_thread.start(func(): _upnp_done.call_deferred(_open_port_upnp()))


# ---------- the door (runs before the engine creates any state for a stranger) ----------

func _on_peer_authenticating(id: int) -> void:
	if not multiplayer.is_server():
		return                                             # joiner: wait for the host's CHALLENGE
	_at_door[id] = true
	if _door_limit_hit(_address_of(id)) or _at_door.size() > MAX_AT_DOOR:
		_drop(id)                                          # too many attempts: say nothing
		return
	var nonce := Crypto.new().generate_random_bytes(16)
	_nonces[id] = nonce
	var msg := PackedByteArray([M_CHALLENGE, 1 if not _pw_key.is_empty() else 0])
	msg.append_array(_salt)
	msg.append_array(nonce)
	(multiplayer as SceneMultiplayer).send_auth(id, msg)


func _door_limit_hit(address: String) -> bool:             # records this attempt; true when the address tries too often
	var now := Time.get_ticks_msec() / 1000.0
	var hits: Array = _door_hits.get(address, [])
	hits = hits.filter(func(t): return now - float(t) < 60.0)
	hits.append(now)
	if _door_hits.size() > 256:
		_door_hits.clear()                                 # bound the table
	_door_hits[address] = hits
	return hits.size() > MAX_ATTEMPTS_PER_MIN


func _on_auth(id: int, data: PackedByteArray) -> void:
	if data.size() == 0 or data.size() > MAX_AUTH_BYTES:   # oversized: turn away unread
		_drop(id)
		return
	if multiplayer.is_server():
		_host_reads_hello(id, data)
	else:
		_joiner_reads_host(data)


func _host_reads_hello(id: int, data: PackedByteArray) -> void:
	var hello := _parse_hello(data)
	if hello.is_empty() or not _nonces.has(id):
		_drop(id)
		return
	var refusal := _door_refusal(id, hello)
	if refusal != "":
		_refuse(id, refusal)
		return
	var mp := multiplayer as SceneMultiplayer
	_pending[id] = _clean_name(hello["name"])
	mp.send_auth(id, PackedByteArray([M_WELCOME]))
	mp.complete_auth(id)


func _parse_hello(data: PackedByteArray) -> Dictionary:    # {} when malformed; lengths are checked before anything is read
	if data[0] != M_HELLO or data.size() < 4:
		return {}
	var at := 3
	var proof := PackedByteArray()
	if not _pw_key.is_empty():
		if data.size() < at + 33:
			return {}
		proof = data.slice(at, at + 32)
		at += 32
	var name_len := int(data[at])
	at += 1
	if name_len > MAX_NAME_LEN * 4 or data.size() != at + name_len:     # bytes, not characters
		return {}
	return {"proto": (int(data[1]) << 8) | int(data[2]), "proof": proof,
			"name": data.slice(at, at + name_len).get_string_from_utf8()}


func _door_refusal(id: int, hello: Dictionary) -> String:  # "" = let in, else the reason to show
	if hello["proto"] != PROTOCOL_VERSION:
		return "Different game version (host has %d, you have %d)" % [PROTOCOL_VERSION, hello["proto"]]
	if not room_open:
		return "Game already started"
	if players.size() + _pending.size() >= MAX_PLAYERS:
		return "Room is full"
	if not _pw_key.is_empty():
		var expected := Crypto.new().hmac_digest(HashingContext.HASH_SHA256, _pw_key, _nonces[id])
		if not _same_bytes(hello["proof"], expected):
			return "Wrong password"
	return ""


func _joiner_reads_host(data: PackedByteArray) -> void:
	var mp := multiplayer as SceneMultiplayer
	match data[0]:
		M_CHALLENGE:
			_answer_challenge(data)
		M_WELCOME:
			mp.complete_auth(1)
		M_REFUSE:
			_fail_join(data.slice(1).get_string_from_utf8().substr(0, 80))


func _answer_challenge(data: PackedByteArray) -> void:     # builds the hello: protocol, optional password proof, name
	if data.size() != 34:
		return _fail_join("Bad answer from host")
	var has_pw := data[1] == 1
	if has_pw and _my_password == "":
		return _fail_join("This room needs a password")
	var name_bytes := my_name.to_utf8_buffer()
	var hello := PackedByteArray([M_HELLO, (PROTOCOL_VERSION >> 8) & 255, PROTOCOL_VERSION & 255])
	if has_pw:
		var key := _sha256(data.slice(2, 18) + _my_password.to_utf8_buffer())
		hello.append_array(Crypto.new().hmac_digest(HashingContext.HASH_SHA256, key, data.slice(18, 34)))
	hello.append(name_bytes.size())
	hello.append_array(name_bytes)
	(multiplayer as SceneMultiplayer).send_auth(1, hello)

func _on_auth_failed(id: int) -> void:
	_at_door.erase(id)
	_nonces.erase(id)
	_pending.erase(id)


func _drop(id: int) -> void:                               # silently disconnect a stranger (if still there)
	var still_there := _at_door.has(id) or id in multiplayer.get_peers()
	_at_door.erase(id)
	if still_there and multiplayer.multiplayer_peer != null:
		multiplayer.multiplayer_peer.disconnect_peer(id)


func _refuse(id: int, reason: String) -> void:             # tell the stranger why, then drop them
	(multiplayer as SceneMultiplayer).send_auth(id, PackedByteArray([M_REFUSE]) + reason.to_utf8_buffer())
	await get_tree().create_timer(0.3).timeout
	_drop(id)


func _fail_join(reason: String) -> void:
	_fail_join_now.call_deferred(reason)                   # never close the peer from inside the auth callback (crashes the engine)


func _fail_join_now(reason: String) -> void:
	leave("")
	join_failed.emit(reason)


func _address_of(id: int) -> String:
	var peer := multiplayer.multiplayer_peer as ENetMultiplayerPeer
	var p: ENetPacketPeer = peer.get_peer(id) if peer != null else null
	return p.get_remote_address() if p != null else "unknown"


func _sha256(bytes: PackedByteArray) -> PackedByteArray:
	var ctx := HashingContext.new()
	ctx.start(HashingContext.HASH_SHA256)
	ctx.update(bytes)
	return ctx.finish()


func _same_bytes(a: PackedByteArray, b: PackedByteArray) -> bool:   # constant time
	if a.size() != b.size():
		return false
	var diff := 0
	for i in a.size():
		diff |= int(a[i]) ^ int(b[i])
	return diff == 0


# ---------- internals ----------

func _clean_name(raw: String) -> String:
	var n := ""
	for ch in raw.substr(0, MAX_NAME_LEN * 2):             # read at most 2x what we keep
		if ch.unicode_at(0) >= 32 and ch.unicode_at(0) != 127:
			n += ch
	n = n.strip_edges().substr(0, MAX_NAME_LEN)
	return n if n != "" else "Player"


func _unique_name(wanted: String) -> String:               # "Bob" taken -> "Bob 2"
	var n := wanted
	var i := 2
	while n in players.values():
		n = "%s %d" % [wanted.substr(0, MAX_NAME_LEN - 3), i]
		i += 1
	return n


func _on_peer_connected(id: int) -> void:                  # runs only after the door was passed
	_at_door.erase(id)
	_nonces.erase(id)
	if multiplayer.is_server() and _pending.has(id):
		players[id] = _unique_name(_pending[id])
		_pending.erase(id)
		_sync_players.rpc(players)


func _join_watchdog(peer: MultiplayerPeer) -> void:        # nobody answering gives silence: don't hang
	await get_tree().create_timer(JOIN_TIMEOUT).timeout
	if multiplayer.multiplayer_peer == peer and not _joined:
		leave("")
		join_failed.emit("Could not connect (wrong code, full room, or blocked)")


func _on_connected_ok() -> void:                           # client side: the door is passed, the host knows my name
	_joined = true


func _on_connection_failed() -> void:
	leave("")
	join_failed.emit("Could not connect (wrong code, full room, or blocked)")


func _on_server_disconnected() -> void:
	var why := _reason_from_host if _reason_from_host != "" else "Host left the room"
	leave(why)


func _on_peer_disconnected(id: int) -> void:
	if players.erase(id) and multiplayer.is_server():
		players_changed.emit()
		for peer_id in multiplayer.get_peers():            # several players can leave in the same
			if _is_connected(peer_id):                      # instant: skip the ones already closing
				_sync_players.rpc_id(peer_id, players)


func _is_connected(id: int) -> bool:
	var packet_peer: ENetPacketPeer = multiplayer.multiplayer_peer.get_peer(id)
	return packet_peer != null and packet_peer.get_state() == ENetPacketPeer.STATE_CONNECTED


func _upnp_done(ip: String) -> void:
	_upnp_thread.wait_to_finish()
	public_ip_found.emit(ip)


func _open_port_upnp() -> String:                          # blocking: only call from a thread
	var upnp := UPNP.new()
	if upnp.discover(2000) != UPNP.UPNP_RESULT_SUCCESS:
		return ""
	var gateway := upnp.get_gateway()
	if gateway == null or not gateway.is_valid_gateway():
		return ""
	if upnp.add_port_mapping(PORT, PORT, "game-room", "UDP") != UPNP.UPNP_RESULT_SUCCESS:
		return ""
	return upnp.query_external_address()


# ---------- RPCs (the only game messages that cross the network) ----------

@rpc("authority", "call_local", "reliable")
func _sync_players(list: Dictionary) -> void:              # host -> everyone
	players = list                                         # "authority" mode: the engine refuses anyone but the host
	players_changed.emit()


@rpc("authority", "call_local", "reliable")
func _begin() -> void:
	room_open = false
	game_starting.emit()
