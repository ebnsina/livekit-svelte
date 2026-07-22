/* eslint-disable @typescript-eslint/no-explicit-any */
import { log, type TrackReference } from '@livekit/components-core';
import {
	areTokenSourceFetchOptionsEqual,
	ConnectionState,
	decodeTokenPayload,
	ExternalE2EEKeyProvider,
	Room,
	RoomEvent,
	Track,
	TokenSourceConfigurable,
	TokenSourceFixed,
	type BaseE2EEManager,
	type BaseKeyProvider,
	type RoomConnectOptions,
	type RoomOptions,
	type TokenSourceFetchOptions,
	type TrackPublishOptions
} from 'livekit-client';
import { getMaybeRoomContext } from '../context/room-context.js';
import {
	createAgent,
	createAgentTimeoutIdStore,
	Emitter,
	type AgentState,
	type TypedEmitter
} from './createAgent.svelte.js';
import { createConnectionState } from './createConnectionState.svelte.js';
import { createLocalParticipant } from './createLocalParticipant.svelte.js';

const browser = typeof window !== 'undefined';

/** Session lifecycle events. */
export enum SessionEvent {
	ConnectionStateChanged = 'connectionStateChanged',
	MediaDevicesError = 'mediaDevicesError',
	EncryptionError = 'encryptionError'
}

/** Callback signatures for {@link SessionEvent}. */
export type SessionCallbacks = {
	[SessionEvent.ConnectionStateChanged]: (newAgentConnectionState: ConnectionState) => void;
	[SessionEvent.MediaDevicesError]: (error: Error) => void;
	[SessionEvent.EncryptionError]: (error: Error) => void;
};

/** Options for {@link SessionState.start}. */
export type SessionConnectOptions = {
	/** Optional abort signal which terminates connecting if triggered. */
	signal?: AbortSignal;
	tracks?: {
		microphone?: { enabled?: boolean; publishOptions?: TrackPublishOptions };
		camera?: { enabled?: boolean; publishOptions?: TrackPublishOptions };
		screenShare?: { enabled?: boolean; publishOptions?: TrackPublishOptions };
	};
	/** Options for `Room.connect(.., .., opts)`. */
	roomConnectOptions?: RoomConnectOptions;
};

/** Options for switching the active input device. */
export type SwitchActiveDeviceOptions = {
	/** Add an `exact` constraint to the getUserMedia request. */
	exact?: boolean;
};

type SessionStateCommon = {
	room: Room;
	internal: {
		emitter: TypedEmitter<SessionCallbacks>;
		tokenSource: TokenSourceConfigurable | TokenSourceFixed;
		agentConnectTimeoutMilliseconds?: number;
		agentTimeoutFailureReason: string | null;
		startAgentTimeout: (agentConnectTimeoutMilliseconds?: number) => void;
		clearAgentTimeout: () => void;
		clearAgentTimeoutFailureReason: () => void;
		updateAgentTimeoutState: (agentState: AgentState) => void;
		updateAgentTimeoutParticipantExists: (agentParticipantExists: boolean) => void;
	};
};

type SessionStateConnecting = SessionStateCommon & {
	connectionState: ConnectionState.Connecting;
	isConnected: false;
	local: { cameraTrack: undefined; microphoneTrack: undefined; screenShareTrack: undefined };
};

type SessionStateConnected = SessionStateCommon & {
	connectionState:
		| ConnectionState.Connected
		| ConnectionState.Reconnecting
		| ConnectionState.SignalReconnecting;
	isConnected: true;
	local: {
		cameraTrack?: TrackReference;
		microphoneTrack?: TrackReference;
		screenShareTrack?: TrackReference;
	};
};

type SessionStateDisconnected = SessionStateCommon & {
	connectionState: ConnectionState.Disconnected;
	isConnected: false;
	local: { cameraTrack: undefined; microphoneTrack: undefined; screenShareTrack: undefined };
};

type SessionActions = {
	/** Resolves once the room connects. */
	waitUntilConnected: (signal?: AbortSignal) => Promise<void>;
	/** Resolves once the room disconnects. */
	waitUntilDisconnected: (signal?: AbortSignal) => Promise<void>;
	prepareConnection: () => Promise<void>;
	/** Connect to the underlying room and dispatch any agents. */
	start: (options?: SessionConnectOptions) => Promise<void>;
	/** Disconnect from the underlying room. */
	end: () => Promise<void>;
	/** Enable or disable E2EE. */
	setEncryptionEnabled: (enabled: boolean) => Promise<void>;
};

/** The reactive shape returned by {@link createSession}. */
export type UseSessionReturn = (
	| SessionStateConnecting
	| SessionStateConnected
	| SessionStateDisconnected
) &
	SessionActions;

/** Type guard for {@link UseSessionReturn}. */
export function isUseSessionReturn(value: unknown): value is UseSessionReturn {
	return (
		typeof value === 'object' &&
		value !== null &&
		'room' in value &&
		'connectionState' in value &&
		'internal' in value
	);
}

type UseSessionCommonOptions = {
	agentConnectTimeoutMilliseconds?: number;
};

type UseSessionWithRoomOptions = {
	room: Room;
	encryption?: never;
};

type UseSessionEncryptionOptions =
	| { key: string | ArrayBuffer | BaseKeyProvider; worker: Worker; e2eeManager?: undefined }
	| { key?: undefined; worker?: undefined; e2eeManager: BaseE2EEManager }
	| { key?: undefined; worker?: undefined; e2eeManager?: undefined };

type UseSessionWithoutRoomOptions = {
	room?: never;
	encryption?: UseSessionEncryptionOptions;
};

type UseSessionRoomOptions = UseSessionWithRoomOptions | UseSessionWithoutRoomOptions;

/** Options for {@link createSession} with a configurable token source. */
export type CreateSessionConfigurableOptions = UseSessionCommonOptions &
	UseSessionRoomOptions &
	TokenSourceFetchOptions;
/** Options for {@link createSession} with a fixed token source. */
export type CreateSessionFixedOptions = UseSessionCommonOptions & UseSessionRoomOptions;

/**
 * A Session represents a managed connection to a Room which can contain Agents.
 *
 * Port of React's `useSession`.
 *
 * @param tokenSource - a fixed or configurable token source.
 * @param options - session / token-fetch options.
 */
export function createSession(
	tokenSource: TokenSourceConfigurable,
	options?: CreateSessionConfigurableOptions
): UseSessionReturn;
export function createSession(
	tokenSource: TokenSourceFixed,
	options?: CreateSessionFixedOptions
): UseSessionReturn;
export function createSession(
	tokenSource: TokenSourceConfigurable | TokenSourceFixed,
	options: CreateSessionConfigurableOptions | CreateSessionFixedOptions = {}
): UseSessionReturn {
	const {
		room: optionsRoom,
		agentConnectTimeoutMilliseconds,
		encryption: unstableEncryption,
		...unstableRestOptions
	} = options as CreateSessionConfigurableOptions;

	const encryptionE2eeManager =
		unstableEncryption && 'e2eeManager' in unstableEncryption
			? unstableEncryption.e2eeManager
			: null;
	const encryptionKey =
		unstableEncryption && !('e2eeManager' in unstableEncryption)
			? (unstableEncryption.key ?? null)
			: null;
	const encryptionWorker =
		unstableEncryption && !('e2eeManager' in unstableEncryption)
			? (unstableEncryption.worker ?? null)
			: null;

	// svelte-ignore state_referenced_locally
	const roomFromContext = getMaybeRoomContext();

	let externalKeyProvider: ExternalE2EEKeyProvider | null = null;
	const keyProvider: BaseKeyProvider | null = (() => {
		if (typeof encryptionKey === 'string' || encryptionKey instanceof ArrayBuffer) {
			if (browser) {
				externalKeyProvider = new ExternalE2EEKeyProvider();
				externalKeyProvider.setKey(encryptionKey).catch((e) => log.error(e));
			}
			return externalKeyProvider;
		}
		return encryptionKey;
	})();

	const room: Room = (() => {
		const preGeneratedRoom = roomFromContext ?? optionsRoom;
		if (preGeneratedRoom) {
			return preGeneratedRoom;
		}
		if (!browser) {
			// SSR: effects don't run, so this placeholder is never actually used.
			return undefined as unknown as Room;
		}

		const encryptionViaWorker = !!(keyProvider && encryptionWorker);
		const encryptionViaManager = !!encryptionE2eeManager;
		const encryptionEnabled = encryptionViaWorker || encryptionViaManager;

		const roomOptions: RoomOptions = {};
		if (encryptionViaWorker) {
			roomOptions.encryption = { keyProvider: keyProvider!, worker: encryptionWorker! };
		} else if (encryptionViaManager) {
			roomOptions.encryption = { e2eeManager: encryptionE2eeManager! };
		} else if (unstableEncryption !== undefined) {
			log.warn(
				'createSession options encryption was set, but neither encryption.key with encryption.worker nor encryption.e2eeManager was provided.'
			);
		}
		const created = new Room(roomOptions);
		if (encryptionEnabled) {
			created.setE2EEEnabled(true);
		}
		return created;
	})();

	$effect(() => {
		return () => {
			room?.disconnect();
		};
	});

	const emitter = new Emitter<SessionCallbacks>();

	const connection = createConnectionState(room);

	$effect(() => {
		const handleMediaDevicesError = (error: Error) => {
			emitter.emit(SessionEvent.MediaDevicesError, error);
		};
		room.on(RoomEvent.MediaDevicesError, handleMediaDevicesError);
		return () => {
			room.off(RoomEvent.MediaDevicesError, handleMediaDevicesError);
		};
	});

	$effect(() => {
		const handleEncryptionError = (error: Error) => {
			emitter.emit(SessionEvent.EncryptionError, error);
		};
		room.on(RoomEvent.EncryptionError, handleEncryptionError);
		return () => {
			room.off(RoomEvent.EncryptionError, handleEncryptionError);
		};
	});

	const localParticipant = createLocalParticipant(room);

	const localCamera = $derived.by<TrackReference | undefined>(() => {
		const publication = localParticipant.cameraTrack;
		if (!publication) {
			return undefined;
		}
		return {
			source: Track.Source.Camera,
			participant: localParticipant.localParticipant,
			publication
		};
	});
	const localMicrophone = $derived.by<TrackReference | undefined>(() => {
		const publication = localParticipant.microphoneTrack;
		if (!publication) {
			return undefined;
		}
		return {
			source: Track.Source.Microphone,
			participant: localParticipant.localParticipant,
			publication
		};
	});
	const localScreenShare = $derived.by<TrackReference | undefined>(() => {
		// Depend on the screen-share enabled flag so this recomputes when it toggles.
		void localParticipant.isScreenShareEnabled;
		const publication = localParticipant.localParticipant.getTrackPublication(
			Track.Source.ScreenShare
		);
		if (!publication) {
			return undefined;
		}
		return {
			source: Track.Source.ScreenShare,
			participant: localParticipant.localParticipant,
			publication
		};
	});

	const timeoutStore = createAgentTimeoutIdStore();

	const sessionInternal: UseSessionReturn['internal'] = {
		emitter,
		tokenSource,
		agentConnectTimeoutMilliseconds,
		get agentTimeoutFailureReason() {
			return timeoutStore.agentTimeoutFailureReason;
		},
		startAgentTimeout: timeoutStore.startAgentTimeout,
		clearAgentTimeout: timeoutStore.clearAgentTimeout,
		clearAgentTimeoutFailureReason: timeoutStore.clearAgentTimeoutFailureReason,
		updateAgentTimeoutState: timeoutStore.updateAgentTimeoutState,
		updateAgentTimeoutParticipantExists: timeoutStore.updateAgentTimeoutParticipantExists
	};

	const isConnectedFor = (state: ConnectionState) =>
		state === ConnectionState.Connected ||
		state === ConnectionState.Reconnecting ||
		state === ConnectionState.SignalReconnecting;

	const conversationState = $derived.by(() => {
		const common: SessionStateCommon = { room, internal: sessionInternal };
		const roomConnectionState = connection.current;

		switch (roomConnectionState) {
			case ConnectionState.Connected:
			case ConnectionState.Reconnecting:
			case ConnectionState.SignalReconnecting:
				return {
					...common,
					connectionState: roomConnectionState,
					isConnected: true,
					local: {
						cameraTrack: localCamera,
						microphoneTrack: localMicrophone,
						screenShareTrack: localScreenShare
					}
				} as SessionStateConnected;
			case ConnectionState.Connecting:
				return {
					...common,
					connectionState: ConnectionState.Connecting,
					isConnected: false,
					local: { cameraTrack: undefined, microphoneTrack: undefined, screenShareTrack: undefined }
				} as SessionStateConnecting;
			case ConnectionState.Disconnected:
			default:
				return {
					...common,
					connectionState: ConnectionState.Disconnected,
					isConnected: false,
					local: { cameraTrack: undefined, microphoneTrack: undefined, screenShareTrack: undefined }
				} as SessionStateDisconnected;
		}
	});

	// Non-reactive mirror of the connection state for waitUntil* helpers.
	let connectionStateRef: ConnectionState = conversationState.connectionState;
	$effect(() => {
		connectionStateRef = conversationState.connectionState;
		emitter.emit(SessionEvent.ConnectionStateChanged, conversationState.connectionState);
	});

	const waitUntilConnectionState = (state: ConnectionState, signal?: AbortSignal) => {
		if (connectionStateRef === state) {
			return Promise.resolve();
		}
		return new Promise<void>((resolve, reject) => {
			const onceEventOccurred = (newState: ConnectionState) => {
				if (newState !== state) {
					return;
				}
				cleanup();
				resolve();
			};
			const abortHandler = () => {
				cleanup();
				reject(
					new Error(
						`createSession(/* ... */).waitUntilConnectionState(${state}, /* signal */) - signal aborted`
					)
				);
			};
			const cleanup = () => {
				emitter.off(SessionEvent.ConnectionStateChanged, onceEventOccurred);
				signal?.removeEventListener('abort', abortHandler);
			};
			emitter.on(SessionEvent.ConnectionStateChanged, onceEventOccurred);
			signal?.addEventListener('abort', abortHandler);
		});
	};

	const waitUntilConnected = (signal?: AbortSignal) =>
		waitUntilConnectionState(ConnectionState.Connected, signal);
	const waitUntilDisconnected = (signal?: AbortSignal) =>
		waitUntilConnectionState(ConnectionState.Disconnected, signal);

	const setEncryptionEnabled = (enabled: boolean) => room.setE2EEEnabled(enabled);

	const agent = createAgent(() => ({
		connectionState: conversationState.connectionState,
		room,
		internal: sessionInternal
	}));

	// Token source fetch handling (React's useSessionTokenSourceFetch).
	const isConfigurable = tokenSource instanceof TokenSourceConfigurable;
	let memoizedTokenFetchOptions: TokenSourceFetchOptions | null = isConfigurable
		? unstableRestOptions
		: null;
	$effect(() => {
		if (!isConfigurable) {
			memoizedTokenFetchOptions = null;
			return;
		}
		if (
			memoizedTokenFetchOptions !== null &&
			areTokenSourceFetchOptionsEqual(memoizedTokenFetchOptions, unstableRestOptions)
		) {
			return;
		}
		memoizedTokenFetchOptions = unstableRestOptions;
	});

	const tokenSourceFetch = (force?: boolean) => {
		if (isConfigurable) {
			if (!memoizedTokenFetchOptions) {
				throw new Error(
					'AgentSession - memoized token fetch options are not set, but the passed tokenSource was an instance of TokenSourceConfigurable.'
				);
			}
			return (tokenSource as TokenSourceConfigurable).fetch(memoizedTokenFetchOptions, force);
		}
		return (tokenSource as TokenSourceFixed).fetch();
	};

	let wasSessionEndCalled = false;

	const start = async (connectOptions: SessionConnectOptions = {}) => {
		const {
			signal,
			tracks = { microphone: { enabled: true, publishOptions: { preConnectBuffer: true } } },
			roomConnectOptions
		} = connectOptions;

		await waitUntilDisconnected(signal);
		wasSessionEndCalled = false;

		const onSignalAbort = () => {
			room.disconnect();
		};
		signal?.addEventListener('abort', onSignalAbort);

		const onDisconnected = () => {
			if (!wasSessionEndCalled) {
				tokenSourceFetch(true);
			}
		};
		room.once(RoomEvent.Disconnected, onDisconnected);

		let tokenDispatchesAgent = false;
		await Promise.all([
			tokenSourceFetch().then(({ serverUrl, participantToken }) => {
				const participantTokenPayload = decodeTokenPayload(participantToken);
				const participantTokenAgentDispatchCount =
					participantTokenPayload.roomConfig?.agents?.length ?? 0;
				tokenDispatchesAgent = participantTokenAgentDispatchCount > 0;
				return room.connect(serverUrl, participantToken, roomConnectOptions);
			}),
			tracks.microphone?.enabled
				? room.localParticipant.setMicrophoneEnabled(
						true,
						undefined,
						tracks.microphone?.publishOptions ?? {}
					)
				: Promise.resolve(),
			tracks.camera?.enabled
				? room.localParticipant.setCameraEnabled(true, undefined, tracks.camera?.publishOptions ?? {})
				: Promise.resolve(),
			tracks.screenShare?.enabled
				? room.localParticipant.setScreenShareEnabled(
						true,
						undefined,
						tracks.screenShare?.publishOptions ?? {}
					)
				: Promise.resolve()
		]);

		await waitUntilConnected(signal);
		if (tokenDispatchesAgent) {
			await agent.waitUntilConnected(signal);
		}

		signal?.removeEventListener('abort', onSignalAbort);
	};

	const end = async () => {
		wasSessionEndCalled = true;
		tokenSourceFetch(true);
		await room.disconnect();
	};

	const prepareConnection = async () => {
		const credentials = await tokenSourceFetch();
		await room.prepareConnection(credentials.serverUrl, credentials.participantToken);
	};

	// Run prepareConnection exactly once on mount.
	let didPrepare = false;
	$effect(() => {
		if (didPrepare) {
			return;
		}
		didPrepare = true;
		prepareConnection().catch((err) => {
			console.warn('WARNING: Room.prepareConnection failed:', err);
		});
	});

	const actions: SessionActions = {
		waitUntilConnected,
		waitUntilDisconnected,
		prepareConnection,
		start,
		end,
		setEncryptionEnabled
	};

	return new Proxy(actions as UseSessionReturn, {
		get(target, prop, receiver) {
			if (prop in actions) {
				return Reflect.get(target, prop, receiver);
			}
			return (conversationState as unknown as Record<string | symbol, unknown>)[prop];
		},
		has(target, prop) {
			return prop in actions || prop in (conversationState as object);
		}
	});
}
