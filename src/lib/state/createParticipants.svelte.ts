import type { Participant, Room, RoomEvent } from 'livekit-client';
import { createLocalParticipant } from './createLocalParticipant.svelte.js';
import { createRemoteParticipants } from './createRemoteParticipants.svelte.js';

/** Options for {@link createParticipants}. */
export interface CreateParticipantsOptions {
	/** Limit updates to these additional room events (performance tuning). */
	updateOnlyOn?: RoomEvent[];
	/** The room to use; falls back to the room from context. */
	room?: Room;
}

/**
 * Reactively returns all participants (local first, then remote) in the room.
 */
export function createParticipants(
	options: CreateParticipantsOptions = {}
): { readonly current: Participant[] } {
	const local = createLocalParticipant(options.room);
	const remote = createRemoteParticipants(options);

	return {
		get current() {
			return [local.localParticipant, ...remote.current];
		}
	};
}
