<script lang="ts">
	import { RoomEvent, type LocalAudioTrack, type LocalVideoTrack } from 'livekit-client';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getMaybeRoomContext } from '../context/room-context.js';
	import { createMediaDeviceSelect } from '../state/createMediaDeviceSelect.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLUListElement>, 'onError'> {
		kind: MediaDeviceKind;
		onActiveDeviceChange?: (deviceId: string) => void;
		onDeviceListChange?: (devices: MediaDeviceInfo[]) => void;
		onDeviceSelectError?: (e: Error) => void;
		initialSelection?: string;
		/** Force the browser to return only the exact selected device. Defaults to `true`. */
		exactMatch?: boolean;
		track?: LocalAudioTrack | LocalVideoTrack;
		requestPermissions?: boolean;
		onError?: (e: Error) => void;
	}

	let {
		kind,
		onActiveDeviceChange,
		onDeviceListChange,
		onDeviceSelectError,
		initialSelection,
		exactMatch,
		track,
		requestPermissions,
		onError,
		class: className,
		...rest
	}: Props = $props();

	const room = getMaybeRoomContext();

	function handleError(e: Error) {
		// Surface as a room media-device error too, matching the official component.
		room?.emit(RoomEvent.MediaDevicesError, e);
		onError?.(e);
	}

	// Props are resolved once at init (context lookup is init-only).
	// svelte-ignore state_referenced_locally
	const select = createMediaDeviceSelect({ kind, room, track, requestPermissions, onError: handleError });

	$effect(() => {
		if (initialSelection !== undefined) {
			void select.setActiveMediaDevice(initialSelection);
		}
	});

	$effect(() => {
		onDeviceListChange?.(select.devices);
	});

	let previousActiveDeviceId = 'default';
	$effect(() => {
		if (select.activeDeviceId !== previousActiveDeviceId) {
			onActiveDeviceChange?.(select.activeDeviceId);
		}
		previousActiveDeviceId = select.activeDeviceId;
	});

	const hasDefault = $derived(
		!!select.devices.find((info) => info.label.toLowerCase().startsWith('default'))
	);

	function isActive(deviceId: string, index: number) {
		return (
			deviceId === select.activeDeviceId ||
			(!hasDefault && index === 0 && select.activeDeviceId === 'default')
		);
	}

	async function handleActiveDeviceChange(deviceId: string) {
		try {
			await select.setActiveMediaDevice(deviceId, { exact: exactMatch ?? true });
		} catch (e) {
			if (e instanceof Error) onDeviceSelectError?.(e);
			else throw e;
		}
	}
</script>

<ul class={[select.className, 'lk-list', className]} {...rest}>
	{#each select.devices as device, index (device.deviceId)}
		<li
			id={device.deviceId}
			data-lk-active={isActive(device.deviceId, index)}
			aria-selected={isActive(device.deviceId, index)}
			role="option"
		>
			<button class="lk-button" onclick={() => handleActiveDeviceChange(device.deviceId)}>
				{device.label}
			</button>
		</li>
	{/each}
</ul>
