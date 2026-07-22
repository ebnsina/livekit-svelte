<script lang="ts">
	import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
	import type { Snippet } from 'svelte';
	import {
		getMaybeTrackRefContext,
		setTrackRefContext
	} from '../context/track-reference-context.js';

	interface Props {
		trackRef?: TrackReferenceOrPlaceholder;
		children?: Snippet;
	}

	let { trackRef, children }: Props = $props();

	// Only provide a track reference context if one is not already present.
	// svelte-ignore state_referenced_locally
	if (trackRef && !getMaybeTrackRefContext()) {
		setTrackRefContext(trackRef);
	}
</script>

{@render children?.()}
