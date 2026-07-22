<script lang="ts">
	import { Track } from 'livekit-client';
	import { createTracks, TrackLoop, VideoTrack, ParticipantName } from '$lib/index.js';
	import ControlDock from './ControlDock.svelte';

	const tracks = createTracks(
		[
			{ source: Track.Source.Camera, withPlaceholder: true },
			{ source: Track.Source.ScreenShare, withPlaceholder: false }
		],
		{ onlySubscribed: false }
	);
</script>

<div class="flex flex-1 flex-col">
	<div class="flex-1 overflow-y-auto px-4 pt-4 pb-28 sm:px-6">
		<div class="mx-auto grid max-w-6xl grid-cols-1 gap-lk-gap sm:grid-cols-2 lg:grid-cols-3">
			<TrackLoop tracks={tracks.current}>
				{#snippet children(trackRef)}
					<div
						class="group relative aspect-video overflow-hidden rounded-lk-lg border border-lk-border bg-lk-bg-2 shadow-lk transition hover:border-lk-border-strong hover:shadow-lk-md"
					>
						<VideoTrack {trackRef} class="h-full w-full object-cover" />
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
	<ControlDock />
</div>
