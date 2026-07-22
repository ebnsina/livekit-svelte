<script lang="ts">
	import { createInteractingObservable } from '@livekit/components-core';
	import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
	import type { RoomEvent } from 'livekit-client';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { icons } from '../icons/index.js';
	import { createGridLayout } from '../state/createGridLayout.svelte.js';
	import { createPagination } from '../state/createPagination.svelte.js';
	import { createSwipe } from '../state/createSwipe.svelte.js';
	import TrackLoop from './TrackLoop.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** Track references to lay out in the grid (e.g. from `createTracks()`). */
		tracks: TrackReferenceOrPlaceholder[];
		/** Additional room events that should trigger an update (kept for API parity). */
		updateOnlyOn?: RoomEvent[];
		/** Template rendered once per track; receives the track reference as an argument. */
		children: Snippet<[TrackReferenceOrPlaceholder]>;
	}

	// `updateOnlyOn` is destructured out (API parity) so it is not spread onto the div.
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let { tracks, updateOnlyOn, children, class: className, ...rest }: Props = $props();

	let gridEl = $state<HTMLDivElement>();

	const grid = createGridLayout(
		() => gridEl,
		() => tracks.length
	);
	const pagination = createPagination(
		() => grid.layout.maxTiles,
		() => tracks
	);

	createSwipe(() => gridEl, {
		onLeftSwipe: () => pagination.nextPage(),
		onRightSwipe: () => pagination.prevPage()
	});

	// Reveal the pagination controls for a while when interacting with the grid.
	let interactive = $state(false);
	$effect(() => {
		const el = gridEl;
		if (!el) return;
		const sub = createInteractingObservable(el, 2000).subscribe((v) => (interactive = v));
		return () => sub.unsubscribe();
	});

	const ChevronIcon = icons.ChevronDown;
</script>

<div
	bind:this={gridEl}
	class={['lk-grid-layout', className]}
	data-lk-pagination={pagination.totalPageCount > 1}
	{...rest}
>
	<TrackLoop tracks={pagination.tracks} {children} />
	{#if tracks.length > grid.layout.maxTiles}
		<div class="lk-pagination-indicator">
			{#each { length: pagination.totalPageCount }, index (index)}
				{#if index + 1 === pagination.currentPage}
					<span data-lk-active></span>
				{:else}
					<span></span>
				{/if}
			{/each}
		</div>
		<div class="lk-pagination-control" data-lk-user-interaction={interactive}>
			<button class="lk-button" onclick={() => pagination.prevPage()}>
				<ChevronIcon />
			</button>
			<span class="lk-pagination-count">{pagination.currentPage} of {pagination.totalPageCount}</span>
			<button class="lk-button" onclick={() => pagination.nextPage()}>
				<ChevronIcon />
			</button>
		</div>
	{/if}
</div>
