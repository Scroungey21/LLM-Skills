--!strict
-- WHAT:     The ONE place for every RemoteEvent. The server creates them, the client waits for them.
--           Holds the rules every remote must follow: validate arguments, rate limit, never trust the client.
-- TALKS TO: every server service and client controller (they call Net, never RemoteEvents directly).
-- SIBLINGS: Events.luau (same-side messages), State.luau (authoritative game state).
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Net = {}

local FOLDER_NAME = "NetRemotes"
local MAX_CALLS_PER_SECOND = 20 -- @tunable per remote, per player; raise only for a good reason

local function getFolder(): Folder
	local folder = ReplicatedStorage:FindFirstChild(FOLDER_NAME)
	if folder then
		return folder :: Folder
	end
	if RunService:IsServer() then
		local created = Instance.new("Folder")
		created.Name = FOLDER_NAME
		created.Parent = ReplicatedStorage
		return created
	end
	return ReplicatedStorage:WaitForChild(FOLDER_NAME) :: Folder
end

local function getRemote(name: string): RemoteEvent
	local folder = getFolder()
	local existing = folder:FindFirstChild(name)
	if existing then
		return existing :: RemoteEvent
	end
	if RunService:IsServer() then
		local remote = Instance.new("RemoteEvent")
		remote.Name = name
		remote.Parent = folder
		return remote
	end
	return folder:WaitForChild(name) :: RemoteEvent
end

-- SERVER: create every remote at boot so clients can find them (call once per name).
function Net.define(name: string)
	assert(RunService:IsServer(), "Net.define is server-only")
	getRemote(name)
end

-- SERVER: listen to a client request. The validator MUST reject bad types and out-of-range values.
-- Rate limiting is applied here, so handlers stay small.
local callLog: { [string]: { [Player]: { count: number, windowStart: number } } } = {}

function Net.onServerEvent(name: string, validate: (...any) -> boolean, handler: (player: Player, ...any) -> ())
	assert(RunService:IsServer(), "Net.onServerEvent is server-only")
	local remote = getRemote(name)
	callLog[name] = callLog[name] or {}
	remote.OnServerEvent:Connect(function(player: Player, ...)
		local now = os.clock()
		local entry = callLog[name][player]
		if not entry or now - entry.windowStart >= 1 then
			entry = { count = 0, windowStart = now }
			callLog[name][player] = entry
		end
		entry.count += 1
		if entry.count > MAX_CALLS_PER_SECOND then
			return -- silently drop spam
		end
		if not validate(...) then
			return -- bad input from the client: ignore it, never trust it
		end
		handler(player, ...)
	end)
end

function Net.fireClient(name: string, player: Player, ...: any)
	assert(RunService:IsServer(), "Net.fireClient is server-only")
	getRemote(name):FireClient(player, ...)
end

function Net.fireAllClients(name: string, ...: any)
	assert(RunService:IsServer(), "Net.fireAllClients is server-only")
	getRemote(name):FireAllClients(...)
end

-- CLIENT: send a REQUEST (never a result). The server decides.
function Net.fireServer(name: string, ...: any)
	assert(RunService:IsClient(), "Net.fireServer is client-only")
	getRemote(name):FireServer(...)
end

function Net.onClientEvent(name: string, handler: (...any) -> ())
	assert(RunService:IsClient(), "Net.onClientEvent is client-only")
	getRemote(name).OnClientEvent:Connect(handler)
end

if RunService:IsServer() then
	Players.PlayerRemoving:Connect(function(player: Player)
		for _, perPlayer in callLog do
			perPlayer[player] = nil
		end
	end)
end

return Net
