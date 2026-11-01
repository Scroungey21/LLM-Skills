--!strict
-- WHAT:     The game's shared state in one table (phase, round, scores). On the server it is the truth; clients mirror it via Net.
-- TALKS TO: Events (emits "State:<key>" on every change).
-- SIBLINGS: Net.luau, Events.luau.
local Events = require(script.Parent.Events)

local State = {}

local data: { [string]: any } = {
	phase = "Lobby", -- Lobby | Playing | Results   (rename for your game)
}

function State.get(key: string): any
	return data[key]
end

function State.set(key: string, value: any)
	if data[key] == value then
		return
	end
	data[key] = value
	Events.emit("State:" .. key, value)
end

return State
