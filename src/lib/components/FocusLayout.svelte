<script lang="ts">
	import type { ParticipantClickEvent, TrackReferenceOrPlaceholder } from '@livekit/components-core';
	import type { HTMLAttributes } from 'svelte/elements';
	import ParticipantTile from './ParticipantTile.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The track to display in the focus layout; falls back to the track reference context. */
		trackRef?: TrackReferenceOrPlaceholder;
		onParticipantClick?: (evt: ParticipantClickEvent) => void;
	}

	let { trackRef, onParticipantClick, ...rest }: Props = $props();
</script>

<ParticipantTile {trackRef} {onParticipantClick} {...rest} />
