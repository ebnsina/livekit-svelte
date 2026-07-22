<script lang="ts">
	import type { Room } from 'livekit-client';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createRoomInfo } from '../state/createRoomInfo.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		/** The room whose name to display. Falls back to the room from context. */
		room?: Room;
		/** Where to render `children` relative to the name. */
		childrenPosition?: 'before' | 'after';
		children?: Snippet;
	}

	let { room, childrenPosition = 'before', children, class: className, ...rest }: Props = $props();

	// Room is resolved once at init (context lookup is init-only); it does not change.
	// svelte-ignore state_referenced_locally
	const info = createRoomInfo(room);
</script>

<span class={className} {...rest}>
	{#if childrenPosition === 'before'}{@render children?.()}{/if}
	{info.current.name}
	{#if childrenPosition === 'after'}{@render children?.()}{/if}
</span>
