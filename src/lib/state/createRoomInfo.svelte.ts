import { roomInfoObserver } from '@livekit/components-core';
import type { Room } from 'livekit-client';
import { ensureRoom } from '../context/room-context.js';
import { observableState, type ObservableState } from '../reactivity/observableState.svelte.js';

/** Name and metadata of a room. */
export interface RoomInfo {
	name: string;
	metadata: string | undefined;
}

/**
 * Reactively tracks a {@link Room}'s name and metadata.
 *
 * @param room - the room to observe; falls back to the room from context.
 */
export function createRoomInfo(room?: Room): ObservableState<RoomInfo> {
	const r = ensureRoom(room);
	return observableState(roomInfoObserver(r), { name: r.name, metadata: r.metadata });
}
