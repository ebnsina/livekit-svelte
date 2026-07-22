import { getContext, setContext } from 'svelte';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';

const TRACK_REF_CONTEXT_KEY = Symbol('lk-track-ref');

/** Provide a {@link TrackReferenceOrPlaceholder} to descendant components. Call during init. */
export function setTrackRefContext(trackRef: TrackReferenceOrPlaceholder): TrackReferenceOrPlaceholder {
	setContext(TRACK_REF_CONTEXT_KEY, trackRef);
	return trackRef;
}

/** Get the track reference from context, or `undefined` if none was provided. */
export function getMaybeTrackRefContext(): TrackReferenceOrPlaceholder | undefined {
	return getContext<TrackReferenceOrPlaceholder | undefined>(TRACK_REF_CONTEXT_KEY);
}

/** Get the track reference from context, throwing if it is missing. */
export function getTrackRefContext(): TrackReferenceOrPlaceholder {
	const ref = getMaybeTrackRefContext();
	if (!ref) {
		throw new Error(
			'[livekit-svelte] tried to access track reference context outside of a track context provider'
		);
	}
	return ref;
}

/** Resolve a track reference from an explicit argument or from context. */
export function ensureTrackRef(trackRef?: TrackReferenceOrPlaceholder): TrackReferenceOrPlaceholder {
	const ref = trackRef ?? getMaybeTrackRefContext();
	if (!ref) {
		throw new Error(
			'[livekit-svelte] no track reference provided — render inside a track context or pass one explicitly'
		);
	}
	return ref;
}
