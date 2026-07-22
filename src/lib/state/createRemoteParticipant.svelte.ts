import {
	connectedParticipantObserver,
	participantByIdentifierObserver,
	type ParticipantIdentifier
} from '@livekit/components-core';
import type { ParticipantEvent, RemoteParticipant, Room } from 'livekit-client';
import { ensureRoom } from '../context/room-context.js';
import { observableState, type ObservableState } from '../reactivity/observableState.svelte.js';

/** Options for {@link createRemoteParticipant}. */
export interface CreateRemoteParticipantOptions {
	/**
	 * To optimize performance, use `updateOnlyOn` to decide on what `ParticipantEvent`s the
	 * factory updates. By default it updates on all relevant events to keep the participant up to date.
	 */
	updateOnlyOn?: ParticipantEvent[];
	/** The room to use; falls back to the room from context. */
	room?: Room;
}

/**
 * Reactively returns the first {@link RemoteParticipant} matched by identity or by a
 * {@link ParticipantIdentifier} (identity and/or participant kind).
 *
 * @param identityOrIdentifier - a participant identity string or a {@link ParticipantIdentifier}.
 * @param options - optional event/room tuning.
 * @returns a reactive holder whose `.current` is the matched participant or `undefined`.
 */
export function createRemoteParticipant(
	identityOrIdentifier: string | ParticipantIdentifier,
	options: CreateRemoteParticipantOptions = {}
): ObservableState<RemoteParticipant | undefined> {
	const room = ensureRoom(options.room);

	const observable =
		typeof identityOrIdentifier === 'string'
			? connectedParticipantObserver(room, identityOrIdentifier, {
					additionalEvents: options.updateOnlyOn
				})
			: participantByIdentifierObserver(room, identityOrIdentifier, {
					additionalEvents: options.updateOnlyOn
				});

	return observableState(observable, undefined);
}
