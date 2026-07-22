import { encryptionStatusObservable } from '@livekit/components-core';
import { LocalParticipant, type Participant, type Room } from 'livekit-client';
import { ensureParticipant } from '../context/participant-context.js';
import { ensureRoom } from '../context/room-context.js';
import { observableState, type ObservableState } from '../reactivity/observableState.svelte.js';

/** Options for {@link createIsEncrypted}. */
export interface CreateIsEncryptedOptions {
	/** The room to use; falls back to the room from context. */
	room?: Room;
}

/**
 * Reactively tracks whether a participant's tracks are end-to-end encrypted.
 *
 * @param participant - the participant; falls back to the participant context.
 * @param options - optional room override.
 * @returns a reactive holder whose `.current` reflects the encryption status.
 */
export function createIsEncrypted(
	participant?: Participant,
	options: CreateIsEncryptedOptions = {}
): ObservableState<boolean> {
	const p = ensureParticipant(participant);
	const room = ensureRoom(options.room);

	const initial = p.isLocal ? (p as LocalParticipant).isE2EEEnabled : !!p.isEncrypted;
	return observableState(encryptionStatusObservable(room, p), initial);
}
