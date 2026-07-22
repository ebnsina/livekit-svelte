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
</script>

<div class="grid grid-cols-2 gap-lk-gap sm:grid-cols-3">
	<TrackLoop tracks={tracks.current}>
		{#snippet children(trackRef)}
			<div class="relative overflow-hidden rounded-lk border border-lk-border bg-lk-bg-2">
				<VideoTrack {trackRef} class="aspect-video w-full object-cover" />
				<ParticipantName
					class="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white"
				/>
			</div>
		{/snippet}
	</TrackLoop>
</div>

<div class="mt-4 flex items-center gap-2">
	<TrackToggle
		source={Track.Source.Microphone}
		class="flex items-center gap-1 rounded-lk bg-lk-control-bg px-3 py-2 hover:bg-lk-control-hover"
	/>
	<TrackToggle
		source={Track.Source.Camera}
		class="flex items-center gap-1 rounded-lk bg-lk-control-bg px-3 py-2 hover:bg-lk-control-hover"
	/>
	<TrackToggle
		source={Track.Source.ScreenShare}
		class="flex items-center gap-1 rounded-lk bg-lk-control-bg px-3 py-2 hover:bg-lk-control-hover"
	/>
	<DisconnectButton
		class="ml-auto rounded-lk bg-lk-danger px-3 py-2 text-lk-danger-fg disabled:opacity-50"
	>
		Leave
	</DisconnectButton>
</div>

<RoomAudioRenderer />
