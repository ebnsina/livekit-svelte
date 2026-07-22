import { participantPermissionObserver } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import { ensureParticipant } from '../context/participant-context.js';
import { observableState, type ObservableState } from '../reactivity/observableState.svelte.js';

/** A participant's permissions (`ParticipantPermission | undefined`). */
export type ParticipantPermissions = Participant['permissions'];

/**
 * Reactively tracks a participant's permissions.
 *
 * @param participant - the participant; falls back to the participant context.
 */
export function createParticipantPermissions(
	participant?: Participant
): ObservableState<ParticipantPermissions> {
	const p = ensureParticipant(participant);
	return observableState(participantPermissionObserver(p), p.permissions);
}
