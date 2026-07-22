<script lang="ts">
	import { Track } from 'livekit-client';
	import type { HTMLAttributes } from 'svelte/elements';
	import LayoutContextProvider from '../components/LayoutContextProvider.svelte';
	import ParticipantAudioTile from '../components/ParticipantAudioTile.svelte';
	import TrackLoop from '../components/TrackLoop.svelte';
	import { createLayoutContext } from '../context/layout-context.svelte.js';
	import { createTracks } from '../state/createTracks.svelte.js';
	import Chat from './Chat.svelte';
	import ControlBar from './ControlBar.svelte';

	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();

	const layoutContext = createLayoutContext();
	const audioTracks = createTracks([Track.Source.Microphone]);

	const showChat = $derived(layoutContext.widget.state?.showChat ?? false);
</script>

<LayoutContextProvider value={layoutContext}>
	<div class={['lk-audio-conference', className]} {...rest}>
		<div class="lk-audio-conference-stage">
			<TrackLoop tracks={audioTracks.current}>
				{#snippet children(trackRef)}
					<ParticipantAudioTile {trackRef} />
				{/snippet}
			</TrackLoop>
		</div>
		<ControlBar controls={{ microphone: true, screenShare: false, camera: false, chat: true }} />
		{#if showChat}
			<Chat />
		{/if}
	</div>
</LayoutContextProvider>
