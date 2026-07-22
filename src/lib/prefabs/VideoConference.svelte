<script lang="ts">
	import type {
		MessageDecoder,
		MessageEncoder,
		TrackReferenceOrPlaceholder
	} from '@livekit/components-core';
	import { isEqualTrackRef, isTrackReference, isWeb } from '@livekit/components-core';
	import { RoomEvent, Track } from 'livekit-client';
	import type { HTMLAttributes } from 'svelte/elements';
	import CarouselLayout from '../components/CarouselLayout.svelte';
	import type { MessageFormatter } from '../components/ChatEntry.svelte';
	import ConnectionStateToast from '../components/ConnectionStateToast.svelte';
	import FocusLayout from '../components/FocusLayout.svelte';
	import FocusLayoutContainer from '../components/FocusLayoutContainer.svelte';
	import GridLayout from '../components/GridLayout.svelte';
	import LayoutContextProvider from '../components/LayoutContextProvider.svelte';
	import ParticipantTile from '../components/ParticipantTile.svelte';
	import RoomAudioRenderer from '../components/RoomAudioRenderer.svelte';
	import { createLayoutContext } from '../context/layout-context.svelte.js';
	import { createPinnedTracks } from '../state/createPinnedTracks.svelte.js';
	import { createTracks } from '../state/createTracks.svelte.js';
	import Chat from './Chat.svelte';
	import ControlBar from './ControlBar.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		/** An optional formatter for chat message bodies. */
		chatMessageFormatter?: MessageFormatter;
		chatMessageEncoder?: MessageEncoder;
		chatMessageDecoder?: MessageDecoder;
	}

	let {
		chatMessageFormatter,
		chatMessageEncoder,
		chatMessageDecoder,
		class: className,
		...rest
	}: Props = $props();

	const layoutContext = createLayoutContext();

	const tracks = createTracks(
		[
			{ source: Track.Source.Camera, withPlaceholder: true },
			{ source: Track.Source.ScreenShare, withPlaceholder: false }
		],
		{ updateOnlyOn: [RoomEvent.ActiveSpeakersChanged], onlySubscribed: false }
	);

	const pinnedTracks = createPinnedTracks(layoutContext);
	const focusTrack = $derived(pinnedTracks.current?.[0]);
	const carouselTracks = $derived(
		tracks.current.filter((track) => !isEqualTrackRef(track, focusTrack))
	);
	const screenShareTracks = $derived(
		tracks.current
			.filter(isTrackReference)
			.filter((track) => track.publication.source === Track.Source.ScreenShare)
	);

	// Ref-like (non-reactive) tracker for the auto-focused screen share track.
	let lastAutoFocusedScreenShareTrack: TrackReferenceOrPlaceholder | null = null;

	$effect(() => {
		const ssTracks = screenShareTracks;
		const ft = focusTrack;
		const allTracks = tracks.current;

		// If screen share tracks are published, and no pin is set explicitly, auto set the screen share.
		if (
			ssTracks.some((track) => track.publication.isSubscribed) &&
			lastAutoFocusedScreenShareTrack === null
		) {
			layoutContext.pin.dispatch?.({ msg: 'set_pin', trackReference: ssTracks[0] });
			lastAutoFocusedScreenShareTrack = ssTracks[0];
		} else if (
			lastAutoFocusedScreenShareTrack &&
			!ssTracks.some(
				(track) =>
					track.publication.trackSid ===
					lastAutoFocusedScreenShareTrack?.publication?.trackSid
			)
		) {
			layoutContext.pin.dispatch?.({ msg: 'clear_pin' });
			lastAutoFocusedScreenShareTrack = null;
		}
		if (ft && !isTrackReference(ft)) {
			const updatedFocusTrack = allTracks.find(
				(tr) => tr.participant.identity === ft.participant.identity && tr.source === ft.source
			);
			if (updatedFocusTrack !== ft && isTrackReference(updatedFocusTrack)) {
				layoutContext.pin.dispatch?.({ msg: 'set_pin', trackReference: updatedFocusTrack });
			}
		}
	});

	const showChat = $derived(layoutContext.widget.state?.showChat ?? false);
</script>

<div class={['lk-video-conference', className]} {...rest}>
	{#if isWeb()}
		<LayoutContextProvider value={layoutContext}>
			<div class="lk-video-conference-inner">
				{#if !focusTrack}
					<div class="lk-grid-layout-wrapper">
						<GridLayout tracks={tracks.current}>
							{#snippet children(trackRef)}
								<ParticipantTile {trackRef} />
							{/snippet}
						</GridLayout>
					</div>
				{:else}
					<div class="lk-focus-layout-wrapper">
						<FocusLayoutContainer>
							<CarouselLayout tracks={carouselTracks}>
								{#snippet children(trackRef)}
									<ParticipantTile {trackRef} />
								{/snippet}
							</CarouselLayout>
							<FocusLayout trackRef={focusTrack} />
						</FocusLayoutContainer>
					</div>
				{/if}
				<ControlBar controls={{ chat: true, settings: false }} />
			</div>
			<Chat
				style={showChat ? 'display: grid;' : 'display: none;'}
				messageFormatter={chatMessageFormatter}
				messageEncoder={chatMessageEncoder}
				messageDecoder={chatMessageDecoder}
			/>
		</LayoutContextProvider>
	{/if}
	<RoomAudioRenderer />
	<ConnectionStateToast />
</div>
