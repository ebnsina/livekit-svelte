<script lang="ts">
	import {
		isTrackReference,
		type ParticipantClickEvent,
		type TrackReferenceOrPlaceholder
	} from '@livekit/components-core';
	import { Track } from 'livekit-client';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { ensureTrackRef } from '../context/track-reference-context.js';
	import { icons } from '../icons/index.js';
	import { createParticipantTile } from '../state/createParticipantTile.svelte.js';
	import AudioTrack from './AudioTrack.svelte';
	import ConnectionQualityIndicator from './ConnectionQualityIndicator.svelte';
	import FocusToggle from './FocusToggle.svelte';
	import ParticipantContextIfNeeded from './ParticipantContextIfNeeded.svelte';
	import ParticipantName from './ParticipantName.svelte';
	import TrackMutedIndicator from './TrackMutedIndicator.svelte';
	import TrackRefContextIfNeeded from './TrackRefContextIfNeeded.svelte';
	import VideoTrack from './VideoTrack.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The track reference to display; falls back to the track reference context. */
		trackRef?: TrackReferenceOrPlaceholder;
		disableSpeakingIndicator?: boolean;
		onParticipantClick?: (event: ParticipantClickEvent) => void;
		/** Custom tile content, replacing the default video/metadata layout. */
		children?: Snippet;
	}

	let {
		trackRef,
		disableSpeakingIndicator,
		onParticipantClick,
		children,
		class: className,
		onclick,
		...rest
	}: Props = $props();

	// Track reference and options are resolved once at init (context lookup is init-only).
	// svelte-ignore state_referenced_locally
	const tr = ensureTrackRef(trackRef);
	// svelte-ignore state_referenced_locally
	const tile = createParticipantTile(tr, { disableSpeakingIndicator });

	const isVideo = $derived(
		isTrackReference(tr) &&
			(tr.publication?.kind === 'video' ||
				tr.source === Track.Source.Camera ||
				tr.source === Track.Source.ScreenShare)
	);

	const ScreenShareIcon = icons.ScreenShare;

	function handleClick(evt: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onclick?.(evt);
		if (onParticipantClick) {
			const track = tr.publication ?? tr.participant.getTrackPublication(tr.source);
			onParticipantClick({ participant: tr.participant, track });
		}
	}
</script>

<div
	class={[tile.className, className]}
	style="position: relative;"
	{...tile.dataAttributes}
	onclick={handleClick}
	{...rest}
>
	<TrackRefContextIfNeeded trackRef={tr}>
		<ParticipantContextIfNeeded participant={tr.participant}>
			{#if children}
				{@render children()}
			{:else}
				{#if isVideo}
					<VideoTrack trackRef={tr} />
				{:else if isTrackReference(tr)}
					<AudioTrack trackRef={tr} />
				{/if}
				<div class="lk-participant-metadata">
					<div class="lk-participant-metadata-item">
						{#if tr.source === Track.Source.Camera}
							<TrackMutedIndicator
								trackRef={{ participant: tr.participant, source: Track.Source.Microphone }}
								show="muted"
							/>
							<ParticipantName />
						{:else}
							<ScreenShareIcon style="margin-right: 0.25rem;" />
							<ParticipantName>'s screen</ParticipantName>
						{/if}
					</div>
					<ConnectionQualityIndicator class="lk-participant-metadata-item" />
				</div>
			{/if}
			<FocusToggle trackRef={tr} />
		</ParticipantContextIfNeeded>
	</TrackRefContextIfNeeded>
</div>
