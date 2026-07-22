import { connectedParticipantsObserver } from '@livekit/components-core';
import type { RemoteParticipant, Room, RoomEvent } from 'livekit-client';
import { ensureRoom } from '../context/room-context.js';

/** Options for {@link createRemoteParticipants}. */
export interface CreateRemoteParticipantsOptions {
	/** Limit updates to these additional room events (performance tuning). */
	updateOnlyOn?: RoomEvent[];
	/** The room to use; falls back to the room from context. */
	room?: Room;
}

/**
 * Reactively returns all remote participants (excluding the local participant).
 */
export function createRemoteParticipants(
	options: CreateRemoteParticipantsOptions = {}
): { readonly current: RemoteParticipant[] } {
	const room = ensureRoom(options.room);
	let participants = $state<RemoteParticipant[]>([]);

	$effect(() => {
		const listener = connectedParticipantsObserver(room, {
			additionalRoomEvents: options.updateOnlyOn
		}).subscribe((p) => (participants = p));
		return () => listener.unsubscribe();
	});

	return {
		get current() {
			return participants;
		}
	};
}
