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

	const state = createLiveKitRoom(() => ({
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
	if (state.room) {
		setRoomContext(state.room);
	}
</script>

<div class={[state.className, className]} {...rest}>
	{@render children?.()}
</div>
