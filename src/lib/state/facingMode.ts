import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { LocalTrackPublication, facingModeFromLocalTrack } from 'livekit-client';

/** Facing mode of a video track, if determinable. */
export type FacingMode = 'user' | 'environment' | 'left' | 'right' | 'undefined';

/**
 * Determines the `facingMode` of a local video track. Works only on local tracks;
 * returns `'undefined'` otherwise.
 */
export function facingMode(trackReference: TrackReferenceOrPlaceholder): FacingMode {
	if (trackReference.publication instanceof LocalTrackPublication) {
		const localTrack = trackReference.publication.track;
		if (localTrack) {
			return facingModeFromLocalTrack(localTrack).facingMode;
		}
	}
	return 'undefined';
}
