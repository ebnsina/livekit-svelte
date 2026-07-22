import { participantPermissionObserver } from '@livekit/components-core';
import type { Room } from 'livekit-client';
import { ensureRoom } from '../context/room-context.js';
import { observableState, type ObservableState } from '../reactivity/observableState.svelte.js';
import type { ParticipantPermissions } from './createParticipantPermissions.svelte.js';

/**
 * Reactively tracks the local participant's permissions.
 *
 * @param room - the room; falls back to the room from context.
 */
export function createLocalParticipantPermissions(
	room?: Room
): ObservableState<ParticipantPermissions> {
	const r = ensureRoom(room);
	return observableState(
		participantPermissionObserver(r.localParticipant),
		r.localParticipant.permissions
	);
}
