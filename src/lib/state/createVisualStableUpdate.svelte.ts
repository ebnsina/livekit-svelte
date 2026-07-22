import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { log, sortTrackReferences, updatePages } from '@livekit/components-core';

/** Options for {@link createVisualStableUpdate}. */
export interface VisualStableUpdateOptions {
	/** Overwrites the default sort function. */
	customSortFunction?: (
		trackReferences: TrackReferenceOrPlaceholder[]
	) => TrackReferenceOrPlaceholder[];
}

/** Return type of {@link createVisualStableUpdate}: a reactive holder of the stabilized track references. */
export interface VisualStableUpdateState {
	readonly current: TrackReferenceOrPlaceholder[];
}

/**
 * Prevents visually jarring jumps and shifts of tiles in an array. The algorithm only
 * starts to update once there are more items than visually fit on a page; it then keeps
 * speaking participants on the first page and always visible.
 *
 * Used by {@link GridLayout} (via {@link createPagination}) and {@link CarouselLayout}.
 *
 * @param trackReferences - getter for the track references to display.
 * @param maxItemsOnPage - getter for the number of items visible per page.
 * @returns a reactive holder whose `.current` is the stabilized track reference array.
 */
export function createVisualStableUpdate(
	trackReferences: () => TrackReferenceOrPlaceholder[],
	maxItemsOnPage: () => number,
	options: VisualStableUpdateOptions = {}
): VisualStableUpdateState {
	// Persist across recomputations (mirrors the React `useRef`s).
	let lastTrackRefs: TrackReferenceOrPlaceholder[] = [];
	let lastMaxItemsOnPage = -1;

	const current = $derived.by(() => {
		const maxItems = maxItemsOnPage();
		const layoutChanged = maxItems !== lastMaxItemsOnPage;

		const sortedTrackRefs =
			typeof options.customSortFunction === 'function'
				? options.customSortFunction(trackReferences())
				: sortTrackReferences(trackReferences());

		let updatedTrackRefs: TrackReferenceOrPlaceholder[] = [...sortedTrackRefs];
		if (layoutChanged === false) {
			try {
				updatedTrackRefs = updatePages(lastTrackRefs, sortedTrackRefs, maxItems);
			} catch (error) {
				log.error('Error while running updatePages(): ', error);
			}
		}

		// Save info to compare against in the next update cycle.
		lastTrackRefs = layoutChanged ? sortedTrackRefs : updatedTrackRefs;
		lastMaxItemsOnPage = maxItems;

		return updatedTrackRefs;
	});

	return {
		get current() {
			return current;
		}
	};
}
