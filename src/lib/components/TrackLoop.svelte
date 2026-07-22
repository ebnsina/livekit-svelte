<script lang="ts">
	import { getTrackReferenceId, type TrackReferenceOrPlaceholder } from '@livekit/components-core';
	import type { Snippet } from 'svelte';
	import TrackRefContextProvider from './TrackRefContextProvider.svelte';

	interface Props {
		/** Track references to loop over (e.g. from `createTracks()`). */
		tracks: TrackReferenceOrPlaceholder[];
		/** Template rendered once per track; also receives the track reference as an argument. */
		children: Snippet<[TrackReferenceOrPlaceholder]>;
	}

	let { tracks, children }: Props = $props();
</script>

{#each tracks as trackRef (getTrackReferenceId(trackRef))}
	<TrackRefContextProvider {trackRef} {children} />
{/each}
