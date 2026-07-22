<script lang="ts">
	import { Track } from 'livekit-client';
	import { createTracks, TrackRefContextProvider, BarVisualizer, ParticipantName } from '$lib/index.js';
	import ControlDock from './ControlDock.svelte';

	// Microphone tracks (with placeholders so silent/muted participants still show).
	const audio = createTracks([{ source: Track.Source.Microphone, withPlaceholder: true }], {
		onlySubscribed: false
	});
</script>

<div class="flex flex-1 flex-wrap content-center items-center justify-center gap-6 p-6 pb-28">
	{#each audio.current as ref (ref.participant.identity)}
		<div
			class="flex w-56 flex-col items-center gap-4 rounded-lk-lg border border-lk-border bg-lk-bg-2 p-6 shadow-lk"
		>
			<div
				class="flex size-16 items-center justify-center rounded-full bg-lk-accent-subtle text-xl font-semibold text-lk-accent"
			>
				{(ref.participant.identity[0] ?? '?').toUpperCase()}
			</div>
			<TrackRefContextProvider trackRef={ref}>
				{#snippet children()}
					<BarVisualizer
						track={ref}
						barCount={12}
						class="flex h-16 w-full items-end justify-center gap-1"
					>
						{#snippet children({ highlighted, style })}
							<span
								class="w-1.5 rounded-full transition-colors {highlighted
									? 'bg-lk-accent'
									: 'bg-lk-border-strong'}"
								{style}
							></span>
						{/snippet}
					</BarVisualizer>
					<ParticipantName class="text-sm font-medium text-lk-fg-secondary" />
				{/snippet}
			</TrackRefContextProvider>
		</div>
	{:else}
		<p class="text-lk-fg-secondary">No participants yet.</p>
	{/each}
</div>
<ControlDock />
