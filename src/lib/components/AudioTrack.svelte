<script lang="ts">
	import { log, type TrackReferenceOrPlaceholder } from '@livekit/components-core';
	import { RemoteAudioTrack, RemoteTrackPublication } from 'livekit-client';
	import type { HTMLAudioAttributes } from 'svelte/elements';
	import { ensureTrackRef } from '../context/track-reference-context.js';
	import { createMediaTrack } from '../state/createMediaTrack.svelte.js';

	interface Props extends Omit<HTMLAudioAttributes, 'muted'> {
		/** The track reference whose audio to render. Falls back to the track reference context. */
		trackRef?: TrackReferenceOrPlaceholder;
		/** Playback volume, typically 0.0–1.0. Only applies to remote audio tracks. */
		volume?: number;
		/** When set, enables/disables server-side delivery of the audio track. */
		muted?: boolean;
		onSubscriptionStatusChanged?: (subscribed: boolean) => void;
	}

	let { trackRef, volume, muted, onSubscriptionStatusChanged, class: className, ...rest }: Props =
		$props();

	// Track reference is resolved once at init (context lookup is init-only).
	// svelte-ignore state_referenced_locally
	const tr = ensureTrackRef(trackRef);

	let el = $state<HTMLAudioElement>();
	const media = createMediaTrack(tr, () => el);

	$effect(() => {
		onSubscriptionStatusChanged?.(!!media.isSubscribed);
	});

	$effect(() => {
		const t = media.track;
		if (t === undefined || volume === undefined) return;
		if (t instanceof RemoteAudioTrack) t.setVolume(volume);
		else log.warn('Volume can only be set on remote audio tracks.');
	});

	$effect(() => {
		const pub = media.publication;
		if (pub === undefined || muted === undefined) return;
		if (pub instanceof RemoteTrackPublication) pub.setEnabled(!muted);
		else log.warn('Can only call setEnabled on remote track publications.');
	});
</script>

<audio bind:this={el} class={[media.className, className]} {...media.dataAttributes} {...rest}
></audio>
