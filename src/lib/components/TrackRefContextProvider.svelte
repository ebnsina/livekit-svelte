<script lang="ts">
	import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
	import type { Snippet } from 'svelte';
	import { setTrackRefContext } from '../context/track-reference-context.js';

	interface Props {
		trackRef: TrackReferenceOrPlaceholder;
		children?: Snippet<[TrackReferenceOrPlaceholder]>;
	}

	let { trackRef, children }: Props = $props();

	// Provide this iteration's track reference to descendants (including the rendered snippet).
	// Set once at init; TrackLoop keys each item by track id, so a changed track is a new instance.
	// svelte-ignore state_referenced_locally
	setTrackRefContext(trackRef);
</script>

{@render children?.(trackRef)}
