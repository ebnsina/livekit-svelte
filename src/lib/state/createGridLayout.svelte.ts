import type { GridLayoutDefinition, GridLayoutInfo } from '@livekit/components-core';
import { GRID_LAYOUTS, selectGridLayout } from '@livekit/components-core';

/** Options for {@link createGridLayout}. */
export interface CreateGridLayoutOptions {
	gridLayouts?: GridLayoutDefinition[];
}

/** Reactive grid layout state, including the measured container size. */
export interface GridLayoutState {
	readonly layout: GridLayoutInfo;
	readonly containerWidth: number;
	readonly containerHeight: number;
}

/**
 * Selects the best grid layout to fit all tiles into the measured container. If the
 * available space is not enough, it reduces the maximum number of visible tiles and
 * selects a layout that still works visually within the given constraints.
 *
 * Observes the grid element's size via a `ResizeObserver` and writes the resulting
 * `--lk-col-count` / `--lk-row-count` CSS variables onto it.
 *
 * @param gridElement - getter for the grid container element.
 * @param trackCount - getter for the number of tracks to lay out.
 */
export function createGridLayout(
	gridElement: () => HTMLDivElement | undefined | null,
	trackCount: () => number,
	options: CreateGridLayoutOptions = {}
): GridLayoutState {
	const gridLayouts = options.gridLayouts ?? GRID_LAYOUTS;

	let width = $state(0);
	let height = $state(0);

	$effect(() => {
		const el = gridElement();
		if (!el) return;
		const rect = el.getBoundingClientRect();
		width = rect.width;
		height = rect.height;
		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry) {
				width = entry.contentRect.width;
				height = entry.contentRect.height;
			}
		});
		observer.observe(el);
		return () => observer.disconnect();
	});

	const layout = $derived(selectGridLayout(gridLayouts, trackCount(), width, height));

	$effect(() => {
		const el = gridElement();
		if (el && layout) {
			el.style.setProperty('--lk-col-count', layout.columns.toString());
			el.style.setProperty('--lk-row-count', layout.rows.toString());
		}
	});

	return {
		get layout() {
			return layout;
		},
		get containerWidth() {
			return width;
		},
		get containerHeight() {
			return height;
		}
	};
}
