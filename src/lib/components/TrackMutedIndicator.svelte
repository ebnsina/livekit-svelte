<script lang="ts">
	import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { ensureTrackRef } from '../context/track-reference-context.js';
	import { getSourceIcon } from '../icons/index.js';
	import { createTrackMutedIndicator } from '../state/createTrackMutedIndicator.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The track reference; falls back to the track reference context. */
		trackRef?: TrackReferenceOrPlaceholder;
		/** When to render the indicator. Defaults to `'always'`. */
		show?: 'always' | 'muted' | 'unmuted';
		children?: Snippet;
	}

	let { trackRef, show = 'always', children, class: className, ...rest }: Props = $props();

	// Track reference is resolved once at init (context lookup is init-only).
	// svelte-ignore state_referenced_locally
	const tr = ensureTrackRef(trackRef);
	const indicator = createTrackMutedIndicator(tr);

	const showIndicator = $derived(
		show === 'always' ||
			(show === 'muted' && indicator.isMuted) ||
			(show === 'unmuted' && !indicator.isMuted)
	);
</script>

{#if showIndicator}
	<div class={[indicator.className, className]} data-lk-muted={indicator.isMuted} {...rest}>
		{#if children}
			{@render children()}
		{:else}
			{@const Icon = getSourceIcon(tr.source, !indicator.isMuted)}
			<Icon />
		{/if}
	</div>
{/if}
