import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { createVisualStableUpdate } from './createVisualStableUpdate.svelte.js';

/** Reactive pagination state for an array of track references. */
export interface PaginationState {
	readonly totalPageCount: number;
	readonly firstItemIndex: number;
	readonly lastItemIndex: number;
	/** Track references on the current page (visually stabilized). */
	readonly tracks: TrackReferenceOrPlaceholder[];
	readonly currentPage: number;
	nextPage: () => void;
	prevPage: () => void;
	setPage: (num: number) => void;
}

/**
 * Simple pagination logic for use with arrays of track references. Uses
 * {@link createVisualStableUpdate} so tiles do not jump around between updates.
 *
 * @param itemPerPage - getter for the number of items to show per page.
 * @param trackReferences - getter for the full list of track references.
 */
export function createPagination(
	itemPerPage: () => number,
	trackReferences: () => TrackReferenceOrPlaceholder[]
): PaginationState {
	let currentPage = $state(1);

	const totalPageCount = $derived(
		Math.max(Math.ceil(trackReferences().length / itemPerPage()), 1)
	);

	// Clamp the current page if the total shrinks below it.
	$effect(() => {
		if (currentPage > totalPageCount) {
			currentPage = totalPageCount;
		}
	});

	const lastItemIndex = $derived(currentPage * itemPerPage());
	const firstItemIndex = $derived(lastItemIndex - itemPerPage());

	const updatedTrackReferences = createVisualStableUpdate(trackReferences, itemPerPage);
	const tracksOnPage = $derived(
		updatedTrackReferences.current.slice(firstItemIndex, lastItemIndex)
	);

	const changePage = (direction: 'next' | 'previous') => {
		if (direction === 'next') {
			if (currentPage === totalPageCount) return;
			currentPage = currentPage + 1;
		} else {
			if (currentPage === 1) return;
			currentPage = currentPage - 1;
		}
	};

	const goToPage = (num: number) => {
		if (num > totalPageCount) {
			currentPage = totalPageCount;
		} else if (num < 1) {
			currentPage = 1;
		} else {
			currentPage = num;
		}
	};

	return {
		get totalPageCount() {
			return totalPageCount;
		},
		get firstItemIndex() {
			return firstItemIndex;
		},
		get lastItemIndex() {
			return lastItemIndex;
		},
		get tracks() {
			return tracksOnPage;
		},
		get currentPage() {
			return currentPage;
		},
		nextPage: () => changePage('next'),
		prevPage: () => changePage('previous'),
		setPage: goToPage
	};
}
