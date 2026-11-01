# Multi-instance smoke test for network/net.gd.  Roles come from user args after "--":
#   host <expected_players> <mode> [password]   mode: start | hold | leave
#   client <name> [expect_host_left]            late <seconds>      full <seconds>
#   joiner <name> <password> <expect>           expect: ok | <text the refusal must contain>
#   evil                                        sends an oversized hello to the door; must be dropped
#   upnp                                        codes
# Pass line per instance: "PASS ..." or "FAIL ...". scripts/net_test.sh runs the scenarios.
extends SceneTree

var net: Node
var got := {}   # signal name -> payload

func _initialize() -> void:
	net = root.get_node("Net")
	net.players_changed.connect(func(): got["players_changed"] = true)
	net.join_failed.connect(func(r): got["join_failed"] = r)
	net.left_room.connect(func(r): got["left_room"] = r)
	net.game_starting.connect(func(): got["game_starting"] = true)
	_run.call_deferred()

func _wait_for(cond: Callable, seconds: float) -> bool:
	var t := 0.0
	while t < seconds:
		if cond.call(): return true
		await create_timer(0.1).timeout
		t += 0.1
	return false

func _finish(ok: bool, msg: String) -> void:
	print(("PASS " if ok else "FAIL ") + msg)
	quit(0 if ok else 1)

func _run() -> void:
	var a := OS.get_cmdline_user_args()
	match a[0]:
		"host":
			var want := int(a[1])
			net.host("Alice", a[3] if a.size() > 3 else "")
			var ok := await _wait_for(func(): return net.players.size() == want, 15.0)
			if not ok: return _finish(false, "host: players=%s" % [net.players])
			var names: Array = net.players.values()
			names.sort()
			print("host sees: ", names)
			if a[2] == "start":
				var at_start: int = net.players.size()
				net.start_game()
				await create_timer(6.0).timeout          # window for the late joiner
				_finish(at_start == want and not net.room_open, "host started with %d players, room closed" % at_start)
			elif a[2] == "hold":
				await create_timer(8.0).timeout            # keep room open so a 5th player or a hostile one can try
				_finish(net.players.size() == want, "host held room, players=%d" % net.players.size())
			else:
				net.leave("")                              # host walks away mid-lobby
				await create_timer(1.0).timeout
				_finish(true, "host left")
		"client":
			net.join(net.code_from_ip("127.0.0.1"), a[1])
			if a.size() > 2 and a[2] == "expect_host_left":
				var ok := await _wait_for(func(): return got.has("left_room"), 20.0)
				_finish(ok and got["left_room"] == "Host left the room", "client left_room=%s" % got.get("left_room"))
			else:
				var ok := await _wait_for(func(): return got.has("game_starting"), 15.0)
				_finish(ok and net.players.size() >= 2, "client started, my list=%s" % [net.players.values()])
		"joiner":
			await create_timer(1.0).timeout
			net.join("127.0.0.1", a[1], a[2])
			if a[3] == "ok":
				var ok := await _wait_for(func(): return net.players.size() >= 2, 15.0)
				if ok: await create_timer(10.0).timeout       # stay, so the host sees this player while it holds the room
				_finish(ok, "joiner %s passed the door, list=%s" % [a[1], net.players.values()])
			else:
				var ok := await _wait_for(func(): return got.has("join_failed"), 15.0)
				var why := String(got.get("join_failed", ""))
				_finish(ok and a[3] in why, "joiner %s refused: '%s' (wanted '%s')" % [a[1], why, a[3]])
		"late":
			await create_timer(float(a[1])).timeout
			net.join("127.0.0.1", "Late")
			var ok := await _wait_for(func(): return got.has("left_room") or got.has("join_failed"), 15.0)
			var why = got.get("left_room", got.get("join_failed", ""))
			_finish(ok and "already started" in String(why), "late joiner told: %s" % why)
		"full":
			await create_timer(float(a[1])).timeout
			net.join("127.0.0.1", "Fifth")
			var ok := await _wait_for(func(): return got.has("join_failed"), 20.0)
			_finish(ok, "full room refused: %s" % got.get("join_failed", "no signal"))
		"evil":
			await create_timer(1.0).timeout
			var mp := net.multiplayer as SceneMultiplayer
			mp.auth_callback = func(_id, _data): pass          # replace Net's door logic: we play the hostile client
			mp.peer_authenticating.connect(func(id): mp.send_auth(id, PackedByteArray([2]) + Crypto.new().generate_random_bytes(300000)))
			var peer := ENetMultiplayerPeer.new()
			peer.create_client("127.0.0.1", net.PORT)
			mp.multiplayer_peer = peer
			var dropped := await _wait_for(func(): return peer.get_connection_status() == MultiplayerPeer.CONNECTION_DISCONNECTED, 10.0)
			_finish(dropped, "oversized hello: host dropped the stranger unread")
		"upnp":
			var got_ip := []
			net.public_ip_found.connect(func(ip): got_ip.append(ip))
			net.find_public_ip()
			var ok := await _wait_for(func(): return got_ip.size() == 1, 15.0)
			_finish(ok, "upnp returned (no crash/hang), ip='%s'" % (got_ip[0] if ok else "-"))
		"codes":
			var c = net.code_from_ip("192.168.1.20")
			var good = c == "C0A80114" and net.ip_from_code(c) == "192.168.1.20"
			var bad = net.ip_from_code("xyz") == "" and net.ip_from_code("C0A8011") == "" and net.ip_from_code("ZZZZZZZZ") == ""
			var rc: String = net.new_room_code()
			var rnd = rc.length() == 6 and net.ip_from_code(rc) == "" and rc != net.new_room_code()
			_finish(good and bad and rnd, "room codes %s, random code %s" % [c, rc])
