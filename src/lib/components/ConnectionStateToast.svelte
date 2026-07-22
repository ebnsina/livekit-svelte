<script lang="ts">
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { ConnectionState, type Room } from 'livekit-client';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createConnectionState } from '../state/createConnectionState.svelte.js';
	import Toast from './Toast.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		/** The room whose connection state to display. Falls back to the room from context. */
		room?: Room;
	}

	let { room, ...rest }: Props = $props();

	// Room is resolved once at init (context lookup is init-only); it does not change.
	// svelte-ignore state_referenced_locally
	const state = createConnectionState(room);

	const showSpinner = $derived(
		state.current === ConnectionState.Reconnecting || state.current === ConnectionState.Connecting
	);
	const label = $derived.by(() => {
		switch (state.current) {
			case ConnectionState.Reconnecting:
				return 'Reconnecting';
			case ConnectionState.Connecting:
				return 'Connecting';
			case ConnectionState.Disconnected:
				return 'Disconnected';
			default:
				return undefined;
		}
	});
</script>

{#if label !== undefined}
	<Toast class="lk-toast-connection-state" {...rest}>
		{#if showSpinner}<LoaderCircle class="lk-spinner" /> {/if}{label}
	</Toast>
{/if}
