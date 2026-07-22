import { mutedObserver, type TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { observableState, type ObservableState } from '../reactivity/observableState.svelte.js';

/**
 * Reactively tracks whether the given track reference is muted.
 */
export function createIsMuted(ref: TrackReferenceOrPlaceholder): ObservableState<boolean> {
	const initial = !!(
		ref.publication?.isMuted || ref.participant.getTrackPublication(ref.source)?.isMuted
	);
	return observableState(mutedObserver(ref), initial);
}
