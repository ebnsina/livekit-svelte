<script lang="ts">
	import type { LocalUserChoices } from '@livekit/components-core';
	import { log } from '@livekit/components-core';
	import {
		facingModeFromLocalTrack,
		Track,
		type LocalAudioTrack,
		type LocalVideoTrack,
		type TrackProcessor
	} from 'livekit-client';
	import type { HTMLAttributes } from 'svelte/elements';
	import MediaDeviceMenu from '../components/MediaDeviceMenu.svelte';
	import TrackToggle from '../components/TrackToggle.svelte';
	import { createPersistentUserChoices } from '../state/createPersistentUserChoices.svelte.js';
	import { createPreviewTracks } from '../state/createPreviewTracks.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onsubmit' | 'onerror'> {
		/** Called with the `LocalUserChoices` once validation passes. */
		onSubmit?: (values: LocalUserChoices) => void;
		/** Custom validation. Only on success are the choices passed to `onSubmit`. */
		onValidate?: (values: LocalUserChoices) => boolean;
		onError?: (error: Error) => void;
		/** Prefill the form with initial values. */
		defaults?: Partial<LocalUserChoices>;
		/** Display a debug window. */
		debug?: boolean;
		joinLabel?: string;
		micLabel?: string;
		camLabel?: string;
		userLabel?: string;
		/** Persist user choices across sessions. Defaults to `true`. */
		persistUserChoices?: boolean;
		videoProcessor?: TrackProcessor<Track.Kind.Video>;
	}

	let {
		defaults = {},
		onValidate,
		onSubmit,
		onError,
		debug,
		joinLabel = 'Join Room',
		micLabel = 'Microphone',
		camLabel = 'Camera',
		userLabel = 'Username',
		persistUserChoices = true,
		videoProcessor,
		class: className,
		...htmlProps
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	const persistent = createPersistentUserChoices({
		defaults,
		preventSave: !persistUserChoices,
		preventLoad: !persistUserChoices
	});

	// Capture the initial choices once (used to seed state and the preview device ids).
	// svelte-ignore state_referenced_locally
	const initialUserChoices = persistent.userChoices;

	let audioEnabled = $state(initialUserChoices.audioEnabled);
	let videoEnabled = $state(initialUserChoices.videoEnabled);
	let audioDeviceId = $state(initialUserChoices.audioDeviceId);
	let videoDeviceId = $state(initialUserChoices.videoDeviceId);
	let username = $state(initialUserChoices.username);

	// Persist user choices to storage.
	$effect(() => persistent.saveAudioInputEnabled(audioEnabled));
	$effect(() => persistent.saveVideoInputEnabled(videoEnabled));
	$effect(() => persistent.saveAudioInputDeviceId(audioDeviceId));
	$effect(() => persistent.saveVideoInputDeviceId(videoDeviceId));
	$effect(() => persistent.saveUsername(username));

	// svelte-ignore state_referenced_locally
	const previewTracks = createPreviewTracks(
		() => ({
			audio: audioEnabled ? { deviceId: initialUserChoices.audioDeviceId } : false,
			video: videoEnabled
				? { deviceId: initialUserChoices.videoDeviceId, processor: videoProcessor }
				: false
		}),
		onError
	);

	let videoEl = $state<HTMLVideoElement>();

	const videoTrack = $derived(
		previewTracks.current?.filter((track) => track.kind === Track.Kind.Video)[0] as
			| LocalVideoTrack
			| undefined
	);
	const audioTrack = $derived(
		previewTracks.current?.filter((track) => track.kind === Track.Kind.Audio)[0] as
			| LocalAudioTrack
			| undefined
	);

	const facingMode = $derived.by(() => {
		if (videoTrack) {
			return facingModeFromLocalTrack(videoTrack).facingMode;
		}
		return 'undefined';
	});

	$effect(() => {
		if (videoEl && videoTrack) {
			videoTrack.unmute();
			videoTrack.attach(videoEl);
		}
		return () => {
			videoTrack?.detach();
		};
	});

	function handleValidation(values: LocalUserChoices): boolean {
		if (typeof onValidate === 'function') {
			return onValidate(values);
		}
		return values.username !== '';
	}

	const userChoices = $derived<LocalUserChoices>({
		username,
		videoEnabled,
		videoDeviceId,
		audioEnabled,
		audioDeviceId
	});
	const isValid = $derived(handleValidation(userChoices));

	function handleSubmit(event: MouseEvent) {
		event.preventDefault();
		if (handleValidation(userChoices)) {
			onSubmit?.(userChoices);
		} else {
			log.warn('Validation failed with: ', userChoices);
		}
	}
</script>

<div class={['lk-prejoin', className]} {...htmlProps}>
	<div class="lk-video-container">
		{#if videoTrack}
			<!-- svelte-ignore a11y_media_has_caption -->
			<video bind:this={videoEl} width="1280" height="720" data-lk-facing-mode={facingMode}></video>
		{/if}
		{#if !videoTrack || !videoEnabled}
			<div class="lk-camera-off-note">
				<svg
					width="320"
					height="320"
					viewBox="0 0 320 320"
					preserveAspectRatio="xMidYMid meet"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M160 180C204.182 180 240 144.183 240 100C240 55.8172 204.182 20 160 20C115.817 20 79.9997 55.8172 79.9997 100C79.9997 144.183 115.817 180 160 180Z"
						fill="white"
						fill-opacity="0.25"
					/>
					<path
						d="M97.6542 194.614C103.267 191.818 109.841 192.481 115.519 195.141C129.025 201.466 144.1 205 159.999 205C175.899 205 190.973 201.466 204.48 195.141C210.158 192.481 216.732 191.818 222.345 194.614C262.703 214.719 291.985 253.736 298.591 300.062C300.15 310.997 291.045 320 280 320H39.9997C28.954 320 19.8495 310.997 21.4087 300.062C28.014 253.736 57.2966 214.72 97.6542 194.614Z"
						fill="white"
						fill-opacity="0.25"
					/>
				</svg>
			</div>
		{/if}
	</div>
	<div class="lk-button-group-container">
		<div class="lk-button-group audio">
			<TrackToggle
				initialState={audioEnabled}
				source={Track.Source.Microphone}
				onChange={(enabled) => (audioEnabled = enabled)}
			>
				{micLabel}
			</TrackToggle>
			<div class="lk-button-group-menu">
				<MediaDeviceMenu
					initialSelection={audioDeviceId}
					kind="audioinput"
					disabled={!audioTrack}
					tracks={{ audioinput: audioTrack }}
					onActiveDeviceChange={(_, id) => (audioDeviceId = id)}
				/>
			</div>
		</div>
		<div class="lk-button-group video">
			<TrackToggle
				initialState={videoEnabled}
				source={Track.Source.Camera}
				onChange={(enabled) => (videoEnabled = enabled)}
			>
				{camLabel}
			</TrackToggle>
			<div class="lk-button-group-menu">
				<MediaDeviceMenu
					initialSelection={videoDeviceId}
					kind="videoinput"
					disabled={!videoTrack}
					tracks={{ videoinput: videoTrack }}
					onActiveDeviceChange={(_, id) => (videoDeviceId = id)}
				/>
			</div>
		</div>
	</div>

	<form class="lk-username-container">
		<input
			class="lk-form-control"
			id="username"
			name="username"
			type="text"
			bind:value={username}
			placeholder={userLabel}
			autocomplete="off"
		/>
		<button
			class="lk-button lk-join-button"
			type="submit"
			onclick={handleSubmit}
			disabled={!isValid}
		>
			{joinLabel}
		</button>
	</form>

	{#if debug}
		<strong>User Choices:</strong>
		<ul class="lk-list" style="overflow: hidden; max-width: 15rem;">
			<li>Username: {`${userChoices.username}`}</li>
			<li>Video Enabled: {`${userChoices.videoEnabled}`}</li>
			<li>Audio Enabled: {`${userChoices.audioEnabled}`}</li>
			<li>Video Device: {`${userChoices.videoDeviceId}`}</li>
			<li>Audio Device: {`${userChoices.audioDeviceId}`}</li>
		</ul>
	{/if}
</div>
