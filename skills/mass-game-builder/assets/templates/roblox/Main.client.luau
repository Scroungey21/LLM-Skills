--!strict
-- WHAT:     Client entry point. Boots shared modules and starts controllers. The only client script at boot.
-- TALKS TO: Net (ReplicatedStorage.Shared), controllers in this folder.
-- SIBLINGS: server/Main.server.luau.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Shared = ReplicatedStorage:WaitForChild("Shared")
local Net = require(Shared:WaitForChild("Net"))

Net.onClientEvent("Ping", function(reply: any)
	print(`[boot] client got reply '{tostring(reply)}'`)
end)
Net.fireServer("Ping", "hello")

print("[boot] client ready")
