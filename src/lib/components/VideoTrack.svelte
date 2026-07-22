<script lang="ts">
	import type { ParticipantClickEvent, TrackReferenceOrPlaceholder } from '@livekit/components-core';
	import type { HTMLVideoAttributes } from 'svelte/elements';
	import { ensureTrackRef } from '../context/track-reference-context.js';
	import { createMediaTrack } from '../state/createMediaTrack.svelte.js';

	interface Props extends HTMLVideoAttributes {
		/** The track reference to render. Falls back to the track reference context. */
		trackRef?: TrackReferenceOrPlaceholder;
		/** Called when the video is clicked, with the participant and publication. */
		onTrackClick?: (evt: ParticipantClickEvent) => void;
	}

	let { trackRef, onTrackClick, onclick, class: className, ...rest }: Props = $props();

	// Track reference is resolved once at init (context lookup is init-only).
	// svelte-ignore state_referenced_locally
	const tr = ensureTrackRef(trackRef);

	let el = $state<HTMLVideoElement>();
	const media = createMediaTrack(tr, () => el);

	function handleClick(evt: MouseEvent & { currentTarget: EventTarget & HTMLVideoElement }) {
		onclick?.(evt);
		onTrackClick?.({ participant: tr.participant, track: media.publication });
	}
</script>

<!-- svelte-ignore a11y_media_has_caption -->
<video
	bind:this={el}
	class={[media.className, className]}
	{...media.dataAttributes}
	{...rest}
	muted
	onclick={handleClick}
></video>
