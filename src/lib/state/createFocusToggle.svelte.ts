import {
	isTrackReferencePinned,
	setupFocusToggle,
	type TrackReferenceOrPlaceholder
} from '@livekit/components-core';
import { getMaybeLayoutContext } from '../context/layout-context.svelte.js';
import { ensureTrackRef } from '../context/track-reference-context.js';

/** Reactive focus (pin) state for a track's tile. */
export interface FocusToggleState {
	readonly className: string;
	readonly inFocus: boolean;
	/** Whether a layout context is present (the toggle only works within one). */
	readonly hasLayoutContext: boolean;
	/** Pin or unpin the track in the layout context. */
	toggle: () => void;
}

/**
 * Provides focus (pin) state and a toggle for a track's tile, driven by the
 * surrounding layout context's pin state.
 *
 * @param trackRef - the track reference; falls back to the track reference context.
 */
export function createFocusToggle(trackRef?: TrackReferenceOrPlaceholder): FocusToggleState {
	const tr = ensureTrackRef(trackRef);
	const layout = getMaybeLayoutContext();
	const { className } = setupFocusToggle();

	const inFocus = $derived(isTrackReferencePinned(tr, layout?.pin.state));

	return {
		className,
		get inFocus() {
			return inFocus;
		},
		hasLayoutContext: !!layout,
		toggle: () => {
			if (inFocus) {
				layout?.pin.dispatch?.({ msg: 'clear_pin' });
			} else {
				layout?.pin.dispatch?.({ msg: 'set_pin', trackReference: tr });
			}
		}
	};
}
