import { setupConnectionQualityIndicator } from '@livekit/components-core';
import type { ConnectionQuality, Participant } from 'livekit-client';
import { ensureParticipant } from '../context/participant-context.js';
import { observableState } from '../reactivity/observableState.svelte.js';

/** Reactive connection-quality state for a participant. */
export interface ConnectionQualityIndicatorState {
	readonly quality: ConnectionQuality;
	readonly className: string;
}

/**
 * Reactively tracks a participant's connection quality.
 *
 * @param participant - the participant; falls back to the participant context.
 */
export function createConnectionQualityIndicator(
	participant?: Participant
): ConnectionQualityIndicatorState {
	const p = ensureParticipant(participant);
	const { className, connectionQualityObserver } = setupConnectionQualityIndicator(p);
	const quality = observableState(connectionQualityObserver, p.connectionQuality);

	return {
		get quality() {
			return quality.current;
		},
		className
	};
}
