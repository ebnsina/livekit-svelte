<script lang="ts">
	import type { Room } from 'livekit-client';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ensureRoom } from '../context/room-context.js';
	import { createStartAudio } from '../state/createStartAudio.svelte.js';

	interface Props extends HTMLButtonAttributes {
		/** The room to start audio for; falls back to the room context. */
		room?: Room;
		/** Button label. */
		label?: string;
	}

	let { room, label = 'Allow Audio', class: className, style, onclick, ...rest }: Props = $props();

	// Room is resolved once at init (context lookup is init-only).
	// svelte-ignore state_referenced_locally
	const r = ensureRoom(room);
	const start = createStartAudio(() => ({ room: r }));

	function handleClick(evt: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(evt);
		start.handleStartAudio();
	}
</script>

<button
	class={[start.className, className]}
	style="display: {start.display};{style ?? ''}"
	onclick={handleClick}
	{...rest}
>
	{label}
</button>
