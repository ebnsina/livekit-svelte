import { activeSpeakerObserver } from '@livekit/components-core';
import type { Participant, Room } from 'livekit-client';
import { ensureRoom } from '../context/room-context.js';
import { observableState, type ObservableState } from '../reactivity/observableState.svelte.js';

/** Options for {@link createSpeakingParticipants}. */
export interface CreateSpeakingParticipantsOptions {
	/** The room to use; falls back to the room from context. */
	room?: Room;
}

/**
 * Reactively returns only the active speakers among all participants.
 *
 * @param options - optional room override.
 * @returns a reactive holder whose `.current` is the active-speaker array.
 */
export function createSpeakingParticipants(
	options: CreateSpeakingParticipantsOptions = {}
): ObservableState<Participant[]> {
	const room = ensureRoom(options.room);
	return observableState(activeSpeakerObserver(room), room.activeSpeakers);
}
