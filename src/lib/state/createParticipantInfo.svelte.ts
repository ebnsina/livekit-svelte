import { participantInfoObserver } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import { getMaybeParticipantContext } from '../context/participant-context.js';
import { observableState, type ObservableState } from '../reactivity/observableState.svelte.js';

/** Identity, name, and metadata of a participant. */
export interface ParticipantInfo {
	identity?: string;
	name?: string;
	metadata?: string;
}

/**
 * Reactively tracks a participant's identity, name, and metadata.
 *
 * @param participant - the participant to observe; falls back to the participant context.
 */
export function createParticipantInfo(participant?: Participant): ObservableState<ParticipantInfo> {
	const p = participant ?? getMaybeParticipantContext();
	return observableState(participantInfoObserver(p), {
		identity: p?.identity,
		name: p?.name,
		metadata: p?.metadata
	});
}
