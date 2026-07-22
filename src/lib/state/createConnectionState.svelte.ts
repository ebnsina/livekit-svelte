import { connectionStateObserver } from '@livekit/components-core';
import type { ConnectionState, Room } from 'livekit-client';
import { ensureRoom } from '../context/room-context.js';
import { observableState, type ObservableState } from '../reactivity/observableState.svelte.js';

/**
 * Reactively tracks the connection state of a {@link Room}.
 *
 * @param room - the room to observe; falls back to the room from context.
 * @returns a reactive holder whose `.current` is the current {@link ConnectionState}.
 */
export function createConnectionState(room?: Room): ObservableState<ConnectionState> {
	const r = ensureRoom(room);
	return observableState(connectionStateObserver(r), r.state);
}
