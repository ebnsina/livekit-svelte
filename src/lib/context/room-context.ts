import { getContext, setContext } from 'svelte';
import type { Room } from 'livekit-client';

const ROOM_CONTEXT_KEY = Symbol('lk-room');

/** Provide a {@link Room} to descendant components. Call during component init. */
export function setRoomContext(room: Room): Room {
	setContext(ROOM_CONTEXT_KEY, room);
	return room;
}

/** Get the {@link Room} from context, or `undefined` if none was provided. */
export function getMaybeRoomContext(): Room | undefined {
	return getContext<Room | undefined>(ROOM_CONTEXT_KEY);
}

/**
 * Get the {@link Room} from context, throwing if it is missing.
 * Use inside components that must live within a `<LiveKitRoom>`.
 */
export function getRoomContext(): Room {
	const room = getMaybeRoomContext();
	if (!room) {
		throw new Error(
			'[livekit-svelte] tried to access room context outside of a <LiveKitRoom> component'
		);
	}
	return room;
}

/**
 * Resolve a {@link Room} either from an explicit argument or from context.
 * Useful for components that accept an optional `room` prop.
 */
export function ensureRoom(room?: Room): Room {
	const r = room ?? getMaybeRoomContext();
	if (!r) {
		throw new Error(
			'[livekit-svelte] no room provided — render inside <LiveKitRoom> or pass a room explicitly'
		);
	}
	return r;
}
