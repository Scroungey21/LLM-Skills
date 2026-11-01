--!strict
-- WHAT:     A tiny same-side message bus (server-to-server or client-to-client). Not for crossing the network: use Net for that.
-- TALKS TO: any module that needs to announce "something happened" without knowing who listens.
-- SIBLINGS: Net.luau (network), State.luau (state changes emit events here).
local Events = {}

local listeners: { [string]: { [number]: (...any) -> () } } = {}
local nextId = 0

-- Returns a function that removes the listener. Always keep it and call it on cleanup.
function Events.on(name: string, fn: (...any) -> ()): () -> ()
	listeners[name] = listeners[name] or {}
	nextId += 1
	local id = nextId
	listeners[name][id] = fn
	return function()
		if listeners[name] then
			listeners[name][id] = nil
		end
	end
end

function Events.emit(name: string, ...: any)
	local set = listeners[name]
	if not set then
		return
	end
	for _, fn in set do
		task.spawn(fn, ...)
	end
end

return Events
