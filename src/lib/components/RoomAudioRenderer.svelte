<script lang="ts">
	import { getTrackReferenceId } from '@livekit/components-core';
	import { Track, type Room } from 'livekit-client';
	import { createTracks } from '../state/createTracks.svelte.js';
	import AudioTrack from './AudioTrack.svelte';

	interface Props {
		/** The room to render audio for. Falls back to the room from context. */
		room?: Room;
		/** Volume applied to all rendered audio tracks (typically 0.0–1.0). */
		volume?: number;
		/** When `true`, mutes (stops server delivery of) all rendered audio tracks. */
		muted?: boolean;
	}

	let { room, volume, muted }: Props = $props();

	// Room is resolved once at init (context lookup is init-only).
	// svelte-ignore state_referenced_locally
	const tracks = createTracks(
		[Track.Source.Microphone, Track.Source.ScreenShareAudio, Track.Source.Unknown],
		{ updateOnlyOn: [], onlySubscribed: true, room }
	);

	const audioTracks = $derived(
		tracks.current.filter(
			(ref) => !ref.participant.isLocal && ref.publication.kind === Track.Kind.Audio
		)
	);
</script>

<div style="display: none;">
	{#each audioTracks as trackRef (getTrackReferenceId(trackRef))}
		<AudioTrack {trackRef} {volume} {muted} />
	{/each}
</div>
