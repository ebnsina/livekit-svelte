import { setupTrackMutedIndicator, type TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { ensureTrackRef } from '../context/track-reference-context.js';
import { observableState } from '../reactivity/observableState.svelte.js';

/** Reactive muted state for a track. */
export interface TrackMutedIndicatorState {
	readonly isMuted: boolean;
	readonly className: string;
}

/**
 * Reactively tracks whether a track (camera/microphone/screen share) is muted.
 *
 * @param trackRef - the track reference; falls back to the track reference context.
 */
export function createTrackMutedIndicator(
	trackRef?: TrackReferenceOrPlaceholder
): TrackMutedIndicatorState {
	const tr = ensureTrackRef(trackRef);
	const { className, mediaMutedObserver } = setupTrackMutedIndicator(tr);

	const isMuted = observableState(
		mediaMutedObserver,
		!!(
			tr.publication?.isMuted ||
			tr.participant.getTrackPublication(tr.source)?.isMuted
		)
	);

	return {
		get isMuted() {
			return isMuted.current;
		},
		className
	};
}
