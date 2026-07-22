<script lang="ts">
	import type { Participant } from 'livekit-client';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getConnectionQualityIcon } from '../icons/index.js';
	import { createConnectionQualityIndicator } from '../state/createConnectionQualityIndicator.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The participant; falls back to the participant context. */
		participant?: Participant;
		children?: Snippet;
	}

	let { participant, children, class: className, ...rest }: Props = $props();

	// Participant is resolved once at init (context lookup is init-only).
	// svelte-ignore state_referenced_locally
	const indicator = createConnectionQualityIndicator(participant);
</script>

<div class={[indicator.className, className]} data-lk-quality={indicator.quality} {...rest}>
	{#if children}
		{@render children()}
	{:else}
		{@const Icon = getConnectionQualityIcon(indicator.quality)}
		<Icon />
	{/if}
</div>
