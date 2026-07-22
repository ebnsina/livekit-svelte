<script lang="ts">
	import {
		isTrackReference,
		type ParticipantClickEvent,
		type TrackReferenceOrPlaceholder
	} from '@livekit/components-core';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { ensureTrackRef } from '../context/track-reference-context.js';
	import { createParticipantTile } from '../state/createParticipantTile.svelte.js';
	import AudioTrack from './AudioTrack.svelte';
	import BarVisualizer from './BarVisualizer.svelte';
	import ConnectionQualityIndicator from './ConnectionQualityIndicator.svelte';
	import ParticipantContextIfNeeded from './ParticipantContextIfNeeded.svelte';
	import ParticipantName from './ParticipantName.svelte';
	import TrackMutedIndicator from './TrackMutedIndicator.svelte';
	import TrackRefContextIfNeeded from './TrackRefContextIfNeeded.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The track reference to display; falls back to the track reference context. */
		trackRef?: TrackReferenceOrPlaceholder;
		disableSpeakingIndicator?: boolean;
		onParticipantClick?: (event: ParticipantClickEvent) => void;
		/** Custom tile content, replacing the default audio/metadata layout. */
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
	style="position: relative; min-height: 160px;"
	{...tile.dataAttributes}
	onclick={handleClick}
	{...rest}
>
	<TrackRefContextIfNeeded trackRef={tr}>
		<ParticipantContextIfNeeded participant={tr.participant}>
			{#if children}
				{@render children()}
			{:else}
				{#if isTrackReference(tr)}
					<AudioTrack trackRef={tr} />
				{/if}
				<BarVisualizer barCount={7} options={{ minHeight: 8 }} />
				<div class="lk-participant-metadata">
					<div class="lk-participant-metadata-item">
						<TrackMutedIndicator trackRef={tr} />
						<ParticipantName />
					</div>
					<ConnectionQualityIndicator class="lk-participant-metadata-item" />
				</div>
			{/if}
		</ParticipantContextIfNeeded>
	</TrackRefContextIfNeeded>
</div>
