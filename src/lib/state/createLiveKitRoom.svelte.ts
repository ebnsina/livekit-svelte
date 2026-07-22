import { log, setupLiveKitRoom } from '@livekit/components-core';
import { MediaDeviceFailure, Room, RoomEvent, type DisconnectReason } from 'livekit-client';
import type { LiveKitRoomProps } from '../components/LiveKitRoom.types.js';

/** Reactive result of {@link createLiveKitRoom}. */
export interface LiveKitRoomState {
	/** The active room instance, or `undefined` before it is created. */
	readonly room: Room | undefined;
	/** The class name the root element should carry (from core). */
	readonly className: string;
}

/**
 * Creates and manages a LiveKit {@link Room}: constructs it, wires event handlers,
 * connects/disconnects, and publishes local tracks on connect.
 *
 * All lifecycle work happens inside `$effect`, so nothing runs during SSR and
 * everything is cleaned up on teardown.
 *
 * @param getProps - accessor returning the current props (kept reactive by reading
 *   only the fields each effect needs).
 */
export function createLiveKitRoom(getProps: () => LiveKitRoomProps): LiveKitRoomState {
	const { className } = setupLiveKitRoom();
	const initial = getProps();
	if (initial.options && initial.room) {
		log.warn(
			'when using a manually created room, the options object will be ignored. set the desired options directly when creating the room instead.'
		);
	}

	// Create the room synchronously (browser only) so it can be provided via context at
	// component init. During SSR there is no room — components guard against `undefined`.
	let room = $state<Room | undefined>(
		typeof window !== 'undefined' ? (initial.room ?? new Room(initial.options)) : undefined
	);

	// Swap in an externally provided room if the `room` prop changes identity.
	$effect(() => {
		const { room: passedRoom } = getProps();
		if (typeof window === 'undefined') return;
		if (passedRoom && passedRoom !== room) {
			room = passedRoom;
		} else if (!room) {
			room = passedRoom ?? new Room(getProps().options);
		}
	});

	// Wire room event handlers → prop callbacks, and publish local tracks on signal connect.
	$effect(() => {
		const r = room;
		if (!r) return;
		const { audio, video, screen, onConnected, onDisconnected, onError, onMediaDeviceFailure, onEncryptionError } =
			getProps();

		const onSignalConnected = () => {
			const localP = r.localParticipant;
			log.debug('trying to publish local tracks');
			Promise.all([
				localP.setMicrophoneEnabled(!!audio, typeof audio !== 'boolean' ? audio : undefined),
				localP.setCameraEnabled(!!video, typeof video !== 'boolean' ? video : undefined),
				localP.setScreenShareEnabled(!!screen, typeof screen !== 'boolean' ? screen : undefined)
			]).catch((e) => {
				log.warn(e);
				onError?.(e as Error);
			});
		};
		const handleMediaDeviceError = (e: Error, kind?: MediaDeviceKind) => {
			onMediaDeviceFailure?.(MediaDeviceFailure.getFailure(e), kind);
		};
		const handleEncryptionError = (e: Error) => onEncryptionError?.(e);
		const handleDisconnected = (reason?: DisconnectReason) => onDisconnected?.(reason);
		const handleConnected = () => onConnected?.();

		r.on(RoomEvent.SignalConnected, onSignalConnected)
			.on(RoomEvent.MediaDevicesError, handleMediaDeviceError)
			.on(RoomEvent.EncryptionError, handleEncryptionError)
			.on(RoomEvent.Disconnected, handleDisconnected)
			.on(RoomEvent.Connected, handleConnected);

		return () => {
			r.off(RoomEvent.SignalConnected, onSignalConnected)
				.off(RoomEvent.MediaDevicesError, handleMediaDeviceError)
				.off(RoomEvent.EncryptionError, handleEncryptionError)
				.off(RoomEvent.Disconnected, handleDisconnected)
				.off(RoomEvent.Connected, handleConnected);
		};
	});

	// Connect / disconnect based on props.
	$effect(() => {
		const r = room;
		if (!r) return;
		const { connect = true, token, serverUrl, connectOptions, simulateParticipants, onError } =
			getProps();

		let cancelled = false;

		if (simulateParticipants) {
			r.simulateParticipants({
				participants: { count: simulateParticipants },
				publish: { audio: true, useRealTracks: true }
			});
			return;
		}

		if (connect) {
			if (!token) {
				log.debug('no token yet');
				return;
			}
			if (!serverUrl) {
				log.warn('no livekit url provided');
				onError?.(new Error('no livekit url provided'));
				return;
			}
			log.debug('connecting');
			r.connect(serverUrl, token, connectOptions).catch((e) => {
				log.warn(e);
				if (!cancelled) onError?.(e as Error);
			});
		} else {
			log.debug('disconnecting because connect is false');
			r.disconnect();
		}

		return () => {
			cancelled = true;
		};
	});

	// Disconnect when the component using this room is destroyed.
	$effect(() => {
		const r = room;
		if (!r) return;
		return () => {
			log.info('disconnecting on unmount');
			r.disconnect();
		};
	});

	return {
		get room() {
			return room;
		},
		className
	};
}
