import { createMediaDeviceObserver, setupDeviceSelector } from '@livekit/components-core';
import { Room, type LocalAudioTrack, type LocalVideoTrack } from 'livekit-client';
import { getMaybeRoomContext } from '../context/room-context.js';
import { observableState } from '../reactivity/observableState.svelte.js';

type DeviceSelector = ReturnType<typeof setupDeviceSelector>;

/** Options for {@link createMediaDeviceSelect}. */
export interface CreateMediaDeviceSelectProps {
	kind: MediaDeviceKind;
	room?: Room;
	track?: LocalAudioTrack | LocalVideoTrack;
	/** Call `getUserMedia` to enumerate devices with labels when permissions are missing. */
	requestPermissions?: boolean;
	onError?: (e: Error) => void;
}

/** Reactive device list plus the active device and a setter. */
export interface MediaDeviceSelectState {
	readonly devices: MediaDeviceInfo[];
	readonly className: string;
	readonly activeDeviceId: string;
	setActiveMediaDevice: DeviceSelector['setActiveMediaDevice'];
}

/**
 * Lists the media devices of one kind, tracks the active device, and provides a
 * setter to switch devices. Device enumeration is browser-only; on the server this
 * returns an empty, inert state.
 */
export function createMediaDeviceSelect(
	props: CreateMediaDeviceSelectProps
): MediaDeviceSelectState {
	const room = props.room ?? getMaybeRoomContext();
	const devices = observableState(
		createMediaDeviceObserver(props.kind, props.onError, props.requestPermissions),
		[] as MediaDeviceInfo[]
	);

	let activeDeviceId = $state('default');
	let className = $state('');
	// A room is required to drive device switching; fall back to a throwaway room in the
	// browser when not inside a <LiveKitRoom> (mirrors the official behavior).
	const roomFallback = room ?? (typeof window !== 'undefined' ? new Room() : undefined);
	let setActiveMediaDevice: DeviceSelector['setActiveMediaDevice'] = async () => {};

	if (roomFallback) {
		activeDeviceId = roomFallback.getActiveDevice(props.kind) ?? 'default';
		const selector = setupDeviceSelector(props.kind, roomFallback, props.track);
		className = selector.className;
		setActiveMediaDevice = selector.setActiveMediaDevice;

		$effect(() => {
			const sub = selector.activeDeviceObservable.subscribe((deviceId) => {
				if (!deviceId) return;
				activeDeviceId = deviceId;
			});
			return () => sub?.unsubscribe();
		});
	}

	return {
		get devices() {
			return devices.current;
		},
		get className() {
			return className;
		},
		get activeDeviceId() {
			return activeDeviceId;
		},
		setActiveMediaDevice: (deviceId, options) => setActiveMediaDevice(deviceId, options)
	};
}
