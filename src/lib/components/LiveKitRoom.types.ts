import type {
	AudioCaptureOptions,
	DisconnectReason,
	MediaDeviceFailure,
	Room,
	RoomConnectOptions,
	RoomOptions,
	ScreenShareCaptureOptions,
	VideoCaptureOptions
} from 'livekit-client';
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

/** Props accepted by `<LiveKitRoom>` and the `createLiveKitRoom` factory. */
export interface LiveKitRoomProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onerror'> {
	/** The auth token to connect with. Connection is deferred until this is set. */
	token?: string;
	/** LiveKit server URL, e.g. `wss://your-project.livekit.cloud`. */
	serverUrl?: string;
	/** Options passed to the `Room` constructor (ignored when `room` is provided). */
	options?: RoomOptions;
	/** Use an externally created `Room` instead of letting the component create one. */
	room?: Room;
	/** Options passed to `room.connect()`. */
	connectOptions?: RoomConnectOptions;
	/** Whether to connect to the room. Defaults to `true`. */
	connect?: boolean;
	/** Publish the microphone on connect. `true`/`false` or capture options. Defaults to `false`. */
	audio?: AudioCaptureOptions | boolean;
	/** Publish the camera on connect. `true`/`false` or capture options. Defaults to `false`. */
	video?: VideoCaptureOptions | boolean;
	/** Publish a screen share on connect. `true`/`false` or capture options. Defaults to `false`. */
	screen?: ScreenShareCaptureOptions | boolean;
	/** Simulate N participants instead of connecting (useful for local development). */
	simulateParticipants?: number;

	/** Called after the room successfully connects. */
	onConnected?: () => void;
	/** Called when the room disconnects. */
	onDisconnected?: (reason?: DisconnectReason) => void;
	/** Called on any connection/publish error. */
	onError?: (error: Error) => void;
	/** Called when acquiring a media device fails (permission denied, in use, etc.). */
	onMediaDeviceFailure?: (failure?: MediaDeviceFailure, kind?: MediaDeviceKind) => void;
	/** Called on an end-to-end encryption error. */
	onEncryptionError?: (error: Error) => void;

	/** Room content. */
	children?: Snippet;
}
