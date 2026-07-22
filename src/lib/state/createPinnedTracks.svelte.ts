import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import {
	ensureLayoutContext,
	type LayoutContextType
} from '../context/layout-context.svelte.js';

/** Return type of {@link createPinnedTracks}: a reactive holder of the pinned track references. */
export interface PinnedTracksState {
	readonly current: TrackReferenceOrPlaceholder[];
}

/**
 * Reactively returns the pinned (focused) tracks of the current layout context.
 *
 * Must be called within a layout context (or given one explicitly).
 *
 * @param layoutContext - the layout context; falls back to the one from context.
 */
export function createPinnedTracks(layoutContext?: LayoutContextType): PinnedTracksState {
	const context = ensureLayoutContext(layoutContext);

	const current = $derived.by(() => {
		if (context.pin.state !== undefined && context.pin.state.length >= 1) {
			return context.pin.state;
		}
		return [];
	});

	return {
		get current() {
			return current;
		}
	};
}
