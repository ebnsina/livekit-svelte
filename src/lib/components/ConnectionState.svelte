<script lang="ts">
	import type { ConnectionState, Room } from 'livekit-client';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createConnectionState } from '../state/createConnectionState.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The room whose connection status to display. Falls back to the room from context. */
		room?: Room;
		/** Optional custom rendering; receives the current connection state string. */
		children?: Snippet<[ConnectionState]>;
	}

	let { room, class: className, children, ...rest }: Props = $props();

	// Room is resolved once at init (context lookup is init-only); it does not change.
	// svelte-ignore state_referenced_locally
	const state = createConnectionState(room);
</script>

<div class={className} data-lk-connection-state={state.current} {...rest}>
	{#if children}{@render children(state.current)}{:else}{state.current}{/if}
</div>
