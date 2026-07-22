<script lang="ts">
	import { supportsScreenSharing } from '@livekit/components-core';
	import { Track } from 'livekit-client';
	import type { HTMLAttributes } from 'svelte/elements';
	import Settings from '@lucide/svelte/icons/settings';
	import { getMaybeLayoutContext } from '../context/layout-context.svelte.js';
	import { icons } from '../icons/index.js';
	import { createLocalParticipantPermissions } from '../state/createLocalParticipantPermissions.svelte.js';
	import { createMediaQuery } from '../state/createMediaQuery.svelte.js';
	import { createPersistentUserChoices } from '../state/createPersistentUserChoices.svelte.js';
	import ChatToggle from '../components/ChatToggle.svelte';
	import DisconnectButton from '../components/DisconnectButton.svelte';
	import MediaDeviceMenu from '../components/MediaDeviceMenu.svelte';
	import SettingsMenuToggle from '../components/SettingsMenuToggle.svelte';
	import StartMediaButton from '../components/StartMediaButton.svelte';
	import TrackToggle from '../components/TrackToggle.svelte';

	/** Which controls to show. Unset entries default from permissions. */
	export type ControlBarControls = {
		microphone?: boolean;
		camera?: boolean;
		chat?: boolean;
		screenShare?: boolean;
		leave?: boolean;
		settings?: boolean;
	};

	interface Props extends HTMLAttributes<HTMLDivElement> {
		onDeviceError?: (e: { source: Track.Source; error: Error }) => void;
		variation?: 'minimal' | 'verbose' | 'textOnly';
		controls?: ControlBarControls;
		/** Persist device choices across sessions. Defaults to `true`. */
		saveUserChoices?: boolean;
	}

	let {
		variation,
		controls,
		saveUserChoices = true,
		onDeviceError,
		class: className,
		...rest
	}: Props = $props();

	const ChatIcon = icons.MessageSquare;
	const LeaveIcon = icons.PhoneOff;

	// Maps a track source to its protocol number (avoids importing the protocol package).
	function trackSourceToProtocol(source: Track.Source) {
		switch (source) {
			case Track.Source.Camera:
				return 1;
			case Track.Source.Microphone:
				return 2;
			case Track.Source.ScreenShare:
				return 3;
			default:
				return 0;
		}
	}

	const layout = getMaybeLayoutContext();
	let isChatOpen = $state(false);
	$effect(() => {
		const showChat = layout?.widget.state?.showChat;
		if (showChat !== undefined) isChatOpen = showChat;
	});

	const tooLittleSpace = createMediaQuery(() => `(max-width: ${isChatOpen ? 1000 : 760}px)`);
	const resolvedVariation = $derived(variation ?? (tooLittleSpace.matches ? 'minimal' : 'verbose'));
	const showIcon = $derived(resolvedVariation === 'minimal' || resolvedVariation === 'verbose');
	const showText = $derived(resolvedVariation === 'textOnly' || resolvedVariation === 'verbose');

	const permissions = createLocalParticipantPermissions();

	const visibleControls = $derived.by(() => {
		const vc: ControlBarControls = { leave: true, ...controls };
		const p = permissions.current;
		if (!p) {
			vc.camera = false;
			vc.chat = false;
			vc.microphone = false;
			vc.screenShare = false;
		} else {
			const canPublishSource = (source: Track.Source) =>
				p.canPublish &&
				(p.canPublishSources.length === 0 ||
					p.canPublishSources.includes(trackSourceToProtocol(source)));
			vc.camera ??= canPublishSource(Track.Source.Camera);
			vc.microphone ??= canPublishSource(Track.Source.Microphone);
			vc.screenShare ??= canPublishSource(Track.Source.ScreenShare);
			vc.chat ??= p.canPublishData && controls?.chat;
		}
		return vc;
	});

	const browserSupportsScreenSharing = supportsScreenSharing();
	let isScreenShareEnabled = $state(false);

	// svelte-ignore state_referenced_locally
	const choices = createPersistentUserChoices({ preventSave: !saveUserChoices });
	const microphoneOnChange = (enabled: boolean, isUserInitiated: boolean) =>
		isUserInitiated ? choices.saveAudioInputEnabled(enabled) : undefined;
	const cameraOnChange = (enabled: boolean, isUserInitiated: boolean) =>
		isUserInitiated ? choices.saveVideoInputEnabled(enabled) : undefined;
</script>

<div class={['lk-control-bar', className]} {...rest}>
	{#if visibleControls.microphone}
		<div class="lk-button-group">
			<TrackToggle
				source={Track.Source.Microphone}
				{showIcon}
				onChange={microphoneOnChange}
				onDeviceError={(error) => onDeviceError?.({ source: Track.Source.Microphone, error })}
			>
				{#if showText}Microphone{/if}
			</TrackToggle>
			<div class="lk-button-group-menu">
				<MediaDeviceMenu
					kind="audioinput"
					onActiveDeviceChange={(_kind, deviceId) => choices.saveAudioInputDeviceId(deviceId ?? 'default')}
				/>
			</div>
		</div>
	{/if}

	{#if visibleControls.camera}
		<div class="lk-button-group">
			<TrackToggle
				source={Track.Source.Camera}
				{showIcon}
				onChange={cameraOnChange}
				onDeviceError={(error) => onDeviceError?.({ source: Track.Source.Camera, error })}
			>
				{#if showText}Camera{/if}
			</TrackToggle>
			<div class="lk-button-group-menu">
				<MediaDeviceMenu
					kind="videoinput"
					onActiveDeviceChange={(_kind, deviceId) => choices.saveVideoInputDeviceId(deviceId ?? 'default')}
				/>
			</div>
		</div>
	{/if}

	{#if visibleControls.screenShare && browserSupportsScreenSharing}
		<TrackToggle
			source={Track.Source.ScreenShare}
			captureOptions={{ audio: true, selfBrowserSurface: 'include' }}
			{showIcon}
			onChange={(enabled) => (isScreenShareEnabled = enabled)}
			onDeviceError={(error) => onDeviceError?.({ source: Track.Source.ScreenShare, error })}
		>
			{#if showText}{isScreenShareEnabled ? 'Stop screen share' : 'Share screen'}{/if}
		</TrackToggle>
	{/if}

	{#if visibleControls.chat}
		<ChatToggle>
			{#if showIcon}<ChatIcon />{/if}
			{#if showText}Chat{/if}
		</ChatToggle>
	{/if}

	{#if visibleControls.settings}
		<SettingsMenuToggle>
			{#if showIcon}<Settings />{/if}
			{#if showText}Settings{/if}
		</SettingsMenuToggle>
	{/if}

	{#if visibleControls.leave}
		<DisconnectButton>
			{#if showIcon}<LeaveIcon />{/if}
			{#if showText}Leave{/if}
		</DisconnectButton>
	{/if}

	<StartMediaButton />
</div>
