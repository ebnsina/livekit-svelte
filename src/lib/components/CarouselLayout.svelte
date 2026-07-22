<script lang="ts">
	import { getScrollBarWidth, type TrackReferenceOrPlaceholder } from '@livekit/components-core';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createVisualStableUpdate } from '../state/createVisualStableUpdate.svelte.js';
	import TrackLoop from './TrackLoop.svelte';

	const MIN_HEIGHT = 130;
	const MIN_WIDTH = 140;
	const MIN_VISIBLE_TILES = 1;
	const ASPECT_RATIO = 16 / 10;
	const ASPECT_RATIO_INVERT = (1 - ASPECT_RATIO) * -1;

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		/** Track references to display in the carousel. */
		tracks: TrackReferenceOrPlaceholder[];
		/**
		 * Place the tiles vertically or horizontally next to each other.
		 * If undefined the orientation is guessed from the container dimensions.
		 */
		orientation?: 'vertical' | 'horizontal';
		/** Template rendered once per track; receives the track reference as an argument. */
		children: Snippet<[TrackReferenceOrPlaceholder]>;
	}

	let { tracks, orientation, children, class: className, ...rest }: Props = $props();

	let asideEl = $state<HTMLElement>();
	let width = $state(0);
	let height = $state(0);
	let prevTiles = $state(0);

	$effect(() => {
		const el = asideEl;
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

	const carouselOrientation = $derived(
		orientation ? orientation : height >= width ? 'vertical' : 'horizontal'
	);

	const tileSpan = $derived(
		carouselOrientation === 'vertical'
			? Math.max(width * ASPECT_RATIO_INVERT, MIN_HEIGHT)
			: Math.max(height * ASPECT_RATIO, MIN_WIDTH)
	);

	const scrollBarWidth = getScrollBarWidth();

	const tilesThatFit = $derived(
		carouselOrientation === 'vertical'
			? Math.max((height - scrollBarWidth) / tileSpan, MIN_VISIBLE_TILES)
			: Math.max((width - scrollBarWidth) / tileSpan, MIN_VISIBLE_TILES)
	);

	const maxVisibleTiles = $derived(
		Math.abs(tilesThatFit - prevTiles) < 0.5 ? Math.round(prevTiles) : Math.round(tilesThatFit)
	);

	// Snap `prevTiles` to the new fit once it drifts far enough (mirrors the React setState).
	$effect(() => {
		if (Math.abs(tilesThatFit - prevTiles) >= 0.5 && prevTiles !== tilesThatFit) {
			prevTiles = tilesThatFit;
		}
	});

	const sortedTiles = createVisualStableUpdate(
		() => tracks,
		() => maxVisibleTiles
	);

	$effect(() => {
		if (asideEl) {
			asideEl.dataset.lkOrientation = carouselOrientation;
			asideEl.style.setProperty('--lk-max-visible-tiles', maxVisibleTiles.toString());
		}
	});
</script>

{#key carouselOrientation}
	<aside class={['lk-carousel', className]} bind:this={asideEl} {...rest}>
		<TrackLoop tracks={sortedTiles.current} {children} />
	</aside>
{/key}
