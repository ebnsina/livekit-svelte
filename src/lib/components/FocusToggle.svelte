<script lang="ts">
	import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getMaybeLayoutContext } from '../context/layout-context.svelte.js';
	import { icons } from '../icons/index.js';
	import { createFocusToggle } from '../state/createFocusToggle.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The track reference to focus; falls back to the track reference context. */
		trackRef?: TrackReferenceOrPlaceholder;
		children?: Snippet;
	}

	let { trackRef, children, class: className, onclick, ...rest }: Props = $props();

	const layout = getMaybeLayoutContext();
	// Track reference resolved once at init (context lookup is init-only).
	// svelte-ignore state_referenced_locally
	const focus = createFocusToggle(trackRef);

	function handleClick(evt: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(evt);
		focus.toggle();
	}
</script>

{#if layout}
	<button class={[focus.className, className]} onclick={handleClick} {...rest}>
		{#if children}
			{@render children()}
		{:else}
			{@const Icon = focus.inFocus ? icons.Minimize : icons.Maximize}
			<Icon />
		{/if}
	</button>
{/if}
