<script lang="ts">
	import { Track } from 'livekit-client';
	import {
		createTracks,
		TrackLoop,
		VideoTrack,
		ParticipantName,
		TrackToggle,
		DisconnectButton,
		RoomAudioRenderer
	} from '$lib/index.js';

	// Camera + screen share, with placeholders for participants without a camera track.
	const tracks = createTracks(
		[
			{ source: Track.Source.Camera, withPlaceholder: true },
			{ source: Track.Source.ScreenShare, withPlaceholder: false }
		],
		{ onlySubscribed: false }
	);

	const controlBtn =
		'inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-lk-fg-secondary transition hover:bg-lk-control-hover hover:text-lk-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lk-accent-ring';
</script>

<div class="relative flex flex-1 flex-col">
	<!-- Video grid -->
	<div class="flex-1 overflow-y-auto px-4 pt-4 pb-28 sm:px-6">
		<div
			class="mx-auto grid max-w-6xl grid-cols-1 gap-lk-gap sm:grid-cols-2 lg:grid-cols-3"
		>
			<TrackLoop tracks={tracks.current}>
				{#snippet children(trackRef)}
					<div
						class="group relative aspect-video overflow-hidden rounded-lk-lg border border-lk-border bg-lk-bg-2 shadow-lk transition hover:border-lk-border-strong hover:shadow-lk-md"
					>
						<VideoTrack {trackRef} class="h-full w-full object-cover" />
						<!-- Scrim + name overlay -->
						<div
							class="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent"
						></div>
						<ParticipantName
							class="absolute bottom-2.5 left-2.5 max-w-[calc(100%-1.25rem)] truncate rounded-md bg-black/45 px-2 py-1 text-xs font-medium text-white/95 backdrop-blur-sm"
						/>
					</div>
				{/snippet}
			</TrackLoop>
		</div>
	</div>

	<!-- Floating control bar -->
	<div
		class="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-4"
	>
		<div
			class="pointer-events-auto flex items-center gap-1 rounded-full border border-lk-border bg-lk-bg-3/85 p-1.5 shadow-lk-lg backdrop-blur-xl"
		>
			<TrackToggle source={Track.Source.Microphone} class={controlBtn} />
			<TrackToggle source={Track.Source.Camera} class={controlBtn} />
			<TrackToggle source={Track.Source.ScreenShare} class={controlBtn} />

			<span class="mx-1 h-6 w-px bg-lk-border" aria-hidden="true"></span>

			<DisconnectButton
				class="inline-flex items-center justify-center gap-1.5 rounded-full bg-lk-danger px-4 py-2.5 text-sm font-semibold text-lk-danger-fg transition hover:bg-lk-danger-hover focus-visible:ring-2 focus-visible:ring-lk-accent-ring focus-visible:outline-none disabled:opacity-50"
			>
				Leave
			</DisconnectButton>
		</div>
	</div>

	<RoomAudioRenderer />
</div>
