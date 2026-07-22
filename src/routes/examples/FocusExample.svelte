<script lang="ts">
	import { Track } from 'livekit-client';
	import { createTracks, TrackRefContextProvider, VideoTrack, ParticipantName } from '$lib/index.js';
	import ControlDock from './ControlDock.svelte';

	const tracks = createTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
	const focused = $derived(tracks.current[0]);
	const others = $derived(tracks.current.slice(1));

	const key = (r: { participant: { identity: string }; source: string }) =>
		`${r.participant.identity}:${r.source}`;
</script>

<div class="flex flex-1 flex-col p-4 pb-28 sm:p-6 sm:pb-28">
	<div class="flex flex-1 gap-3">
		<div
			class="relative flex-1 overflow-hidden rounded-lk-lg border border-lk-border bg-lk-bg-2 shadow-lk"
		>
			{#if focused}
				<TrackRefContextProvider trackRef={focused}>
					{#snippet children()}
						<VideoTrack class="h-full w-full object-contain" />
						<ParticipantName
							class="absolute bottom-3 left-3 rounded-md bg-black/45 px-2 py-1 text-sm text-white backdrop-blur-sm"
						/>
					{/snippet}
				</TrackRefContextProvider>
			{/if}
		</div>

		{#if others.length}
			<div class="flex w-40 flex-col gap-3 overflow-y-auto sm:w-48">
				{#each others as ref (key(ref))}
					<TrackRefContextProvider trackRef={ref}>
						{#snippet children()}
							<div
								class="relative aspect-video overflow-hidden rounded-lk border border-lk-border bg-lk-bg-2"
							>
								<VideoTrack class="h-full w-full object-cover" />
								<ParticipantName
									class="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white"
								/>
							</div>
						{/snippet}
					</TrackRefContextProvider>
				{/each}
			</div>
		{/if}
	</div>
</div>
<ControlDock />
