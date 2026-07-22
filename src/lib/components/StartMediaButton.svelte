<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getRoomContext } from '../context/room-context.js';
	import { createStartAudio } from '../state/createStartAudio.svelte.js';
	import { createStartVideo } from '../state/createStartVideo.svelte.js';

	interface Props extends HTMLButtonAttributes {
		/** Button label. Defaults to `Start Audio`/`Start Video` depending on what is blocked. */
		label?: string;
	}

	let { label, class: className, style, onclick, ...rest }: Props = $props();

	// Room comes from context (must render inside <LiveKitRoom>).
	const room = getRoomContext();
	const audio = createStartAudio(() => ({ room }));
	const video = createStartVideo(() => ({ room }));

	const display = $derived(audio.canPlayAudio && video.canPlayVideo ? 'none' : 'block');
	const resolvedLabel = $derived(label ?? `Start ${!audio.canPlayAudio ? 'Audio' : 'Video'}`);

	function handleClick(evt: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(evt);
		audio.handleStartAudio();
		video.handleStartVideo();
	}
</script>

<button
	class={[audio.className, video.className, className]}
	style="display: {display};{style ?? ''}"
	onclick={handleClick}
	{...rest}
>
	{resolvedLabel}
</button>
