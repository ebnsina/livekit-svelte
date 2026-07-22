<script lang="ts">
	import { setRoomContext } from '../context/room-context.js';
	import { createLiveKitRoom } from '../state/createLiveKitRoom.svelte.js';
	import type { LiveKitRoomProps } from './LiveKitRoom.types.js';

	let {
		token,
		serverUrl,
		options,
		room,
		connectOptions,
		connect,
		audio,
		video,
		screen,
		simulateParticipants,
		onConnected,
		onDisconnected,
		onError,
		onMediaDeviceFailure,
		onEncryptionError,
		children,
		class: className = '',
		...rest
	}: LiveKitRoomProps = $props();

	const lk = createLiveKitRoom(() => ({
		token,
		serverUrl,
		options,
		room,
		connectOptions,
		connect,
		audio,
		video,
		screen,
		simulateParticipants,
		onConnected,
		onDisconnected,
		onError,
		onMediaDeviceFailure,
		onEncryptionError
	}));

	// Provide the room to descendants. Set synchronously at init (browser).
	if (lk.room) {
		setRoomContext(lk.room);
	}

	// The room and its tracks only exist in the browser. Render children after mount so
	// server output (no room) and the initial hydration render match, then reveal the UI.
	let mounted = $state(false);
	$effect(() => {
		mounted = true;
	});
</script>

<div class={[lk.className, className]} {...rest}>
	{#if mounted && lk.room}
		{@render children?.()}
	{/if}
</div>
