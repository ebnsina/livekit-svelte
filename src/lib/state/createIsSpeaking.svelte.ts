import { createIsSpeakingObserver } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import { ensureParticipant } from '../context/participant-context.js';
import { observableState, type ObservableState } from '../reactivity/observableState.svelte.js';

/**
 * Reactively tracks whether a participant is currently speaking.
 *
 * @param participant - the participant; falls back to the participant context.
 */
export function createIsSpeaking(participant?: Participant): ObservableState<boolean> {
	const p = ensureParticipant(participant);
	return observableState(createIsSpeakingObserver(p), p.isSpeaking);
}
