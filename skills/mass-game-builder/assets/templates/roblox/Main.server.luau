--!strict
-- WHAT:     Server entry point. Boots the shared modules, defines remotes, starts services. The only server Script at boot.
-- TALKS TO: Net, State, Events (ReplicatedStorage.Shared), services in this folder.
-- SIBLINGS: client/Main.client.luau.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Shared = ReplicatedStorage:WaitForChild("Shared")
local Net = require(Shared:WaitForChild("Net"))
local State = require(Shared:WaitForChild("State"))

Net.define("Ping")
Net.onServerEvent("Ping", function(message: any)
	return type(message) == "string" and #message <= 32
end, function(player: Player, message: string)
	print(`[boot] server got Ping '{message}' from {player.Name}`)
	Net.fireClient("Ping", player, "pong")
end)

print(`[boot] server ready, phase = {State.get("phase")}`)
