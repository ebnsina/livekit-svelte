<script lang="ts">
	import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
	import { Track } from 'livekit-client';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createLocalParticipant } from '../state/createLocalParticipant.svelte.js';
	import { createLocalParticipantPermissions } from '../state/createLocalParticipantPermissions.svelte.js';
	import { createPersistentUserChoices } from '../state/createPersistentUserChoices.svelte.js';
	import BarVisualizer from '../components/BarVisualizer.svelte';
	import DisconnectButton from '../components/DisconnectButton.svelte';
	import MediaDeviceMenu from '../components/MediaDeviceMenu.svelte';
	import StartMediaButton from '../components/StartMediaButton.svelte';
	import TrackToggle from '../components/TrackToggle.svelte';

	/** Which controls to show. Unset entries default from permissions. */
	export type VoiceAssistantControlBarControls = {
		microphone?: boolean;
		leave?: boolean;
	};

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		onDeviceError?: (e: { source: Track.Source; error: Error }) => void;
		controls?: VoiceAssistantControlBarControls;
		/** Persist device choices across sessions. Defaults to `true`. */
		saveUserChoices?: boolean;
	}

	let {
		controls,
		saveUserChoices = true,
		onDeviceError,
		class: className,
		...rest
	}: Props = $props();

	const permissions = createLocalParticipantPermissions();
	const local = createLocalParticipant();

	const micTrackRef = $derived<TrackReferenceOrPlaceholder>({
		participant: local.localParticipant,
		source: Track.Source.Microphone,
		publication: local.microphoneTrack
	});

	const visibleControls = $derived.by(() => {
		const vc: VoiceAssistantControlBarControls = { leave: true, microphone: true, ...controls };
		const p = permissions.current;
		if (!p) {
			vc.microphone = false;
		} else {
			vc.microphone ??= p.canPublish;
		}
		return vc;
	});

	// svelte-ignore state_referenced_locally
	const choices = createPersistentUserChoices({ preventSave: !saveUserChoices });

	const microphoneOnChange = (enabled: boolean, isUserInitiated: boolean) =>
		isUserInitiated ? choices.saveAudioInputEnabled(enabled) : undefined;
</script>

<div class={['lk-agent-control-bar', className]} {...rest}>
	{#if visibleControls.microphone}
		<div class="lk-button-group">
			<TrackToggle
				source={Track.Source.Microphone}
				showIcon={true}
				onChange={microphoneOnChange}
				onDeviceError={(error) => onDeviceError?.({ source: Track.Source.Microphone, error })}
			>
				<BarVisualizer trackRef={micTrackRef} barCount={7} options={{ minHeight: 5 }} />
			</TrackToggle>
			<div class="lk-button-group-menu">
				<MediaDeviceMenu
					kind="audioinput"
					onActiveDeviceChange={(_kind, deviceId) => choices.saveAudioInputDeviceId(deviceId ?? 'default')}
				/>
			</div>
		</div>
	{/if}

	{#if visibleControls.leave}
		<DisconnectButton>Disconnect</DisconnectButton>
	{/if}

	<StartMediaButton />
</div>
