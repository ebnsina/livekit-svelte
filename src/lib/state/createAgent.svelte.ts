/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	ParticipantAgentAttributes,
	participantAttributesObserver,
	participantInfoObserver,
	participantTracksObservable,
	type TrackReference
} from '@livekit/components-core';
import {
	ConnectionState,
	ParticipantEvent,
	ParticipantKind,
	RoomEvent,
	Track,
	type LocalTrackPublication,
	type Participant,
	type RemoteParticipant,
	type Room
} from 'livekit-client';
import { getMaybeSessionContext } from '../context/session-context.svelte.js';
import { createRemoteParticipants } from './createRemoteParticipants.svelte.js';

// ---------------------------------------------------------------------------
// Minimal typed event emitter (Node's `events` / `typed-emitter` are not
// available in this environment; this is a faithful minimal replacement of the
// on/off/once/emit surface those packages provide).
// ---------------------------------------------------------------------------

/** A map of event names to their listener signatures. */
export type EventMap = Record<string, (...args: any[]) => void>;

/** Strongly-typed emitter interface (subset of Node's `EventEmitter`). */
export interface TypedEmitter<Events extends EventMap> {
	on<E extends keyof Events>(event: E, listener: Events[E]): this;
	off<E extends keyof Events>(event: E, listener: Events[E]): this;
	once<E extends keyof Events>(event: E, listener: Events[E]): this;
	emit<E extends keyof Events>(event: E, ...args: Parameters<Events[E]>): boolean;
}

/** A tiny synchronous typed event emitter. */
export class Emitter<Events extends EventMap> implements TypedEmitter<Events> {
	private listeners = new Map<keyof Events, Set<(...args: any[]) => void>>();

	on<E extends keyof Events>(event: E, listener: Events[E]): this {
		let set = this.listeners.get(event);
		if (!set) {
			set = new Set();
			this.listeners.set(event, set);
		}
		set.add(listener as (...args: any[]) => void);
		return this;
	}

	off<E extends keyof Events>(event: E, listener: Events[E]): this {
		this.listeners.get(event)?.delete(listener as (...args: any[]) => void);
		return this;
	}

	once<E extends keyof Events>(event: E, listener: Events[E]): this {
		const wrapper = ((...args: any[]) => {
			this.off(event, wrapper as Events[E]);
			(listener as (...args: any[]) => void)(...args);
		}) as Events[E];
		return this.on(event, wrapper);
	}

	emit<E extends keyof Events>(event: E, ...args: Parameters<Events[E]>): boolean {
		const set = this.listeners.get(event);
		if (!set || set.size === 0) {
			return false;
		}
		for (const listener of [...set]) {
			listener(...args);
		}
		return true;
	}
}

// ---------------------------------------------------------------------------
// Agent state types
// ---------------------------------------------------------------------------

// FIXME: make this 10 seconds once room dispatch booting info is discoverable
const DEFAULT_AGENT_CONNECT_TIMEOUT_MILLISECONDS = 20_000;

type AgentSdkStates = 'initializing' | 'idle' | 'listening' | 'thinking' | 'speaking';

/**
 * State representing the current status of the agent.
 *
 * @remarks This is the extended agent lifecycle used by {@link createSession} /
 * {@link createAgent} — distinct from the simpler `AgentState` used by the bar visualizer.
 */
export type AgentState =
	| 'disconnected'
	| 'connecting'
	| 'pre-connect-buffering'
	| 'failed'
	| AgentSdkStates;

/** Agent lifecycle events. */
export enum AgentEvent {
	CameraChanged = 'cameraChanged',
	MicrophoneChanged = 'microphoneChanged',
	StateChanged = 'stateChanged'
}

/** Callback signatures for {@link AgentEvent}. */
export type AgentCallbacks = {
	[AgentEvent.CameraChanged]: (newTrack: TrackReference | undefined) => void;
	[AgentEvent.MicrophoneChanged]: (newTrack: TrackReference | undefined) => void;
	[AgentEvent.StateChanged]: (newAgentState: AgentState) => void;
};

type AgentStateCommon = {
	attributes: Participant['attributes'];
	internal: {
		emitter: TypedEmitter<AgentCallbacks>;
		agentParticipant: RemoteParticipant | null;
		workerParticipant: RemoteParticipant | null;
	};
};

type AgentStateAvailable = AgentStateCommon & {
	state: 'listening' | 'thinking' | 'speaking';
	failureReasons: null;
	identity: Participant['identity'];
	name: Participant['name'];
	metadata: Participant['metadata'];
	isConnected: true;
	canListen: true;
	isFinished: false;
	isPending: false;
	cameraTrack?: TrackReference;
	microphoneTrack?: TrackReference;
};

type AgentStatePreConnectBuffering = AgentStateCommon & {
	state: 'pre-connect-buffering';
	failureReasons: null;
	identity: Participant['identity'];
	name: Participant['name'];
	metadata: Participant['metadata'];
	isConnected: false;
	canListen: true;
	isFinished: false;
	isPending: false;
	cameraTrack?: TrackReference;
	microphoneTrack?: TrackReference;
};

type AgentStateUnAvailable = AgentStateCommon & {
	state: 'initializing' | 'idle';
	failureReasons: null;
	identity: Participant['identity'];
	name: Participant['name'];
	metadata: Participant['metadata'];
	isConnected: false;
	canListen: false;
	isFinished: false;
	isPending: true;
	cameraTrack?: TrackReference;
	microphoneTrack?: TrackReference;
};

type AgentStateConnecting = AgentStateCommon & {
	state: 'connecting';
	failureReasons: null;
	identity: undefined;
	name: undefined;
	metadata: undefined;
	isConnected: false;
	canListen: false;
	isFinished: false;
	isPending: true;
	cameraTrack: undefined;
	microphoneTrack: undefined;
};

type AgentStateDisconnected = AgentStateCommon & {
	state: 'disconnected';
	failureReasons: null;
	identity: undefined;
	name: undefined;
	metadata: undefined;
	isConnected: false;
	canListen: false;
	isFinished: true;
	isPending: false;
	cameraTrack: undefined;
	microphoneTrack: undefined;
};

type AgentStateFailed = AgentStateCommon & {
	state: 'failed';
	failureReasons: Array<string>;
	identity: undefined;
	name: undefined;
	metadata: undefined;
	isConnected: false;
	canListen: false;
	isFinished: true;
	isPending: false;
	cameraTrack: undefined;
	microphoneTrack: undefined;
};

type AgentActions = {
	/** Resolves once the agent is connected and available for user input. */
	waitUntilConnected: (signal?: AbortSignal) => Promise<void>;
	/** Resolves once the client could be listening for user speech (`canListen` is true). */
	waitUntilCouldBeListening: (signal?: AbortSignal) => Promise<void>;
	/** Resolves once the client has disconnected from the agent. */
	waitUntilFinished: (signal?: AbortSignal) => Promise<void>;
	/** Resolves once the agent has published a camera track. */
	waitUntilCamera: (signal?: AbortSignal) => Promise<TrackReference>;
	/** Resolves once the agent has published a microphone track. */
	waitUntilMicrophone: (signal?: AbortSignal) => Promise<TrackReference>;
};

type AgentStateCases =
	| AgentStateConnecting
	| AgentStateDisconnected
	| AgentStateAvailable
	| AgentStatePreConnectBuffering
	| AgentStateUnAvailable
	| AgentStateFailed;

/** The reactive shape returned by {@link createAgent}. */
export type UseAgentReturn = AgentStateCases & AgentActions;

const generateDerivedStateValues = (state: AgentState) => ({
	isConnected: state === 'listening' || state === 'thinking' || state === 'speaking',
	canListen:
		state === 'pre-connect-buffering' ||
		state === 'listening' ||
		state === 'thinking' ||
		state === 'speaking',
	isFinished: state === 'disconnected' || state === 'failed',
	isPending: state === 'connecting' || state === 'initializing' || state === 'idle'
});

// ---------------------------------------------------------------------------
// Agent timeout store
// ---------------------------------------------------------------------------

/** The interface exposed by {@link createAgentTimeoutIdStore}. */
export interface AgentTimeoutIdStore {
	readonly agentTimeoutFailureReason: string | null;
	startAgentTimeout: (agentConnectTimeoutMilliseconds?: number) => void;
	clearAgentTimeout: () => void;
	clearAgentTimeoutFailureReason: () => void;
	updateAgentTimeoutState: (agentState: AgentState) => void;
	updateAgentTimeoutParticipantExists: (agentParticipantExists: boolean) => void;
}

/** Internal store used by {@link createSession} to track the agent-connect timeout. */
export function createAgentTimeoutIdStore(): AgentTimeoutIdStore {
	let agentTimeoutFailureReason = $state<string | null>(null);
	let agentTimeoutId: ReturnType<typeof setTimeout> | null = null;
	let agentStateRef: AgentState = 'connecting';
	let agentParticipantExistsRef = false;

	const startAgentConnectedTimeout = (agentConnectTimeoutMilliseconds?: number) => {
		return setTimeout(() => {
			if (!agentParticipantExistsRef) {
				agentTimeoutFailureReason = 'Agent did not join the room.';
				return;
			}
			const { isConnected } = generateDerivedStateValues(agentStateRef);
			if (!isConnected) {
				agentTimeoutFailureReason = 'Agent joined the room but did not complete initializing.';
				return;
			}
		}, agentConnectTimeoutMilliseconds ?? DEFAULT_AGENT_CONNECT_TIMEOUT_MILLISECONDS);
	};

	return {
		get agentTimeoutFailureReason() {
			return agentTimeoutFailureReason;
		},
		startAgentTimeout: (agentConnectTimeoutMilliseconds?: number) => {
			if (agentTimeoutId) {
				clearTimeout(agentTimeoutId);
			}
			agentTimeoutFailureReason = null;
			agentTimeoutId = startAgentConnectedTimeout(agentConnectTimeoutMilliseconds);
			agentStateRef = 'connecting';
			agentParticipantExistsRef = false;
		},
		clearAgentTimeout: () => {
			if (agentTimeoutId) {
				clearTimeout(agentTimeoutId);
			}
			agentTimeoutFailureReason = null;
			agentTimeoutId = null;
			agentStateRef = 'connecting';
			agentParticipantExistsRef = false;
		},
		clearAgentTimeoutFailureReason: () => {
			agentTimeoutFailureReason = null;
		},
		updateAgentTimeoutState: (agentState: AgentState) => {
			agentStateRef = agentState;
		},
		updateAgentTimeoutParticipantExists: (agentParticipantExists: boolean) => {
			agentParticipantExistsRef = agentParticipantExists;
		}
	};
}

// ---------------------------------------------------------------------------
// createAgent
// ---------------------------------------------------------------------------

/** The subset of a session that {@link createAgent} needs. */
export type SessionStub = {
	connectionState: ConnectionState;
	room: Room;
	internal: {
		agentConnectTimeoutMilliseconds?: number;
		agentTimeoutFailureReason: string | null;
		startAgentTimeout: (agentConnectTimeoutMilliseconds?: number) => void;
		clearAgentTimeout: () => void;
		clearAgentTimeoutFailureReason: () => void;
		updateAgentTimeoutState: (agentState: AgentState) => void;
		updateAgentTimeoutParticipantExists: (agentParticipantExists: boolean) => void;
	};
};

/**
 * Encapsulates all agent state, normalizing quirks around how LiveKit Agents work.
 *
 * Port of React's `useAgent`. Pass an explicit session or provide one via
 * {@link setSessionContext}.
 *
 * @param getSession - accessor for the session (or `undefined` to use context).
 */
export function createAgent(getSession?: () => SessionStub | undefined): UseAgentReturn {
	// svelte-ignore state_referenced_locally
	const sessionFromContext = getMaybeSessionContext();
	const resolveSession = () => getSession?.() ?? sessionFromContext;

	const initialSession = resolveSession();
	if (!initialSession) {
		throw new Error(
			'No session provided, make sure you are inside a Session context or pass the session explicitly'
		);
	}

	const room = initialSession.room;
	const internal = initialSession.internal;

	const emitter = new Emitter<AgentCallbacks>();

	const remoteParticipants = createRemoteParticipants({ room });

	const agentParticipant = $derived(
		remoteParticipants.current.find(
			(p) =>
				p.kind === ParticipantKind.AGENT &&
				!(ParticipantAgentAttributes.PublishOnBehalf in p.attributes)
		) ?? null
	);
	const workerParticipant = $derived.by(() => {
		if (!agentParticipant) {
			return null;
		}
		return (
			remoteParticipants.current.find(
				(p) =>
					p.kind === ParticipantKind.AGENT &&
					p.attributes[ParticipantAgentAttributes.PublishOnBehalf] === agentParticipant.identity
			) ?? null
		);
	});

	// Reactively track the agent's attributes.
	let agentParticipantAttributes = $state<Participant['attributes']>({});
	$effect(() => {
		const a = agentParticipant;
		if (!a) {
			agentParticipantAttributes = {};
			return;
		}
		agentParticipantAttributes = a.attributes ?? {};
		const subscription = participantAttributesObserver(a).subscribe((val) => {
			agentParticipantAttributes = val.attributes ?? {};
		});
		return () => subscription.unsubscribe();
	});

	// Track references for a participant, reactive to its (late-arriving) identity.
	function createTracksForIdentity(getIdentity: () => string | undefined) {
		let refs = $state<TrackReference[]>([]);
		$effect(() => {
			const id = getIdentity();
			const participant = id
				? remoteParticipants.current.find((p) => p.identity === id)
				: undefined;
			if (!participant) {
				refs = [];
				return;
			}
			const subscription = participantTracksObservable(participant, {
				sources: [Track.Source.Camera, Track.Source.Microphone]
			}).subscribe((next) => {
				refs = next;
			});
			return () => subscription.unsubscribe();
		});
		return {
			get current() {
				return refs;
			}
		};
	}

	const agentTracks = createTracksForIdentity(() => agentParticipant?.identity);
	const workerTracks = createTracksForIdentity(() => workerParticipant?.identity);

	const videoTrack = $derived(
		agentTracks.current.find((t) => t.source === Track.Source.Camera) ??
			workerTracks.current.find((t) => t.source === Track.Source.Camera)
	);
	$effect(() => {
		emitter.emit(AgentEvent.CameraChanged, videoTrack);
	});

	const audioTrack = $derived(
		agentTracks.current.find((t) => t.source === Track.Source.Microphone) ??
			workerTracks.current.find((t) => t.source === Track.Source.Microphone)
	);
	$effect(() => {
		emitter.emit(AgentEvent.MicrophoneChanged, audioTrack);
	});

	// Room connection state.
	let roomConnectionState = $state<ConnectionState>(room.state);
	$effect(() => {
		const handle = (connectionState: ConnectionState) => {
			roomConnectionState = connectionState;
		};
		room.on(RoomEvent.ConnectionStateChanged, handle);
		return () => {
			room.off(RoomEvent.ConnectionStateChanged, handle);
		};
	});

	// When the agent participant connects, reset the timeout failure state.
	$effect(() => {
		if (!agentParticipant) {
			return;
		}
		internal.clearAgentTimeoutFailureReason();
	});

	// If the agent leaves mid-conversation unexpectedly, mark that as an explicit failure.
	let agentDisconnectedFailureReason = $state<string | null>(null);
	$effect(() => {
		const a = agentParticipant;
		if (!a) {
			return;
		}
		const onParticipantDisconnect = (participant: RemoteParticipant) => {
			if (participant.identity !== a.identity) {
				return;
			}
			agentDisconnectedFailureReason = 'Agent left the room unexpectedly.';
		};
		room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnect);
		return () => {
			room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnect);
		};
	});

	$effect(() => {
		if (roomConnectionState !== ConnectionState.Disconnected) {
			return;
		}
		agentDisconnectedFailureReason = null;
	});

	// Local microphone preconnect buffer detection.
	let localMicTrack = $state<LocalTrackPublication | null>(
		room.localParticipant.getTrackPublication(Track.Source.Microphone) ?? null
	);
	$effect(() => {
		const onPublished = () => {
			localMicTrack = room.localParticipant.getTrackPublication(Track.Source.Microphone) ?? null;
		};
		const onUnpublished = () => {
			localMicTrack = null;
		};
		room.localParticipant.on(ParticipantEvent.LocalTrackPublished, onPublished);
		room.localParticipant.on(ParticipantEvent.LocalTrackUnpublished, onUnpublished);
		return () => {
			room.localParticipant.off(ParticipantEvent.LocalTrackPublished, onPublished);
			room.localParticipant.off(ParticipantEvent.LocalTrackUnpublished, onUnpublished);
		};
	});

	const failureReasons = $derived.by(() => {
		const reasons: string[] = [];
		if (internal.agentTimeoutFailureReason) {
			reasons.push(internal.agentTimeoutFailureReason);
		}
		if (agentDisconnectedFailureReason) {
			reasons.push(agentDisconnectedFailureReason);
		}
		return reasons;
	});

	const state = $derived.by<AgentState>(() => {
		if (failureReasons.length > 0) {
			return 'failed';
		}
		let next: AgentState = 'disconnected';
		if (roomConnectionState !== ConnectionState.Disconnected) {
			next = 'connecting';
		}
		if (localMicTrack) {
			next = 'pre-connect-buffering';
		}
		if (agentParticipant && agentParticipantAttributes[ParticipantAgentAttributes.AgentState]) {
			next = agentParticipantAttributes[ParticipantAgentAttributes.AgentState] as AgentSdkStates;
		}
		return next;
	});

	// Keep a non-reactive mirror of the latest state for the waitUntil* helpers.
	let stateRef: AgentState = state;
	$effect(() => {
		stateRef = state;
		emitter.emit(AgentEvent.StateChanged, state);
		internal.updateAgentTimeoutState(state);
	});
	$effect(() => {
		internal.updateAgentTimeoutParticipantExists(agentParticipant !== null);
	});

	// When the session begins connecting, start the agent timeout.
	$effect(() => {
		const session = resolveSession();
		const isSessionDisconnected = session?.connectionState === ConnectionState.Disconnected;
		if (isSessionDisconnected) {
			return;
		}
		internal.startAgentTimeout(internal.agentConnectTimeoutMilliseconds);
		return () => {
			internal.clearAgentTimeout();
		};
	});

	// Agent participant identity / name / metadata.
	let agentInfo = $state<{ identity?: string; name?: string; metadata?: string }>({});
	$effect(() => {
		const a = agentParticipant;
		if (!a) {
			agentInfo = {};
			return;
		}
		agentInfo = { identity: a.identity, name: a.name, metadata: a.metadata };
		const observer = participantInfoObserver(a);
		if (!observer) {
			return;
		}
		const subscription = observer.subscribe((info) => {
			agentInfo = { identity: info.identity, name: info.name, metadata: info.metadata };
		});
		return () => subscription.unsubscribe();
	});

	const agentState = $derived.by<AgentStateCases>(() => {
		const common: AgentStateCommon = {
			attributes: agentParticipantAttributes,
			internal: {
				agentParticipant,
				workerParticipant,
				emitter
			}
		};

		switch (state) {
			case 'disconnected':
			case 'connecting':
				return {
					...common,
					identity: undefined,
					name: undefined,
					metadata: undefined,
					state,
					...generateDerivedStateValues(state),
					failureReasons: null,
					cameraTrack: undefined,
					microphoneTrack: undefined
				} as AgentStateCases;

			case 'initializing':
			case 'idle':
			case 'pre-connect-buffering':
			case 'listening':
			case 'thinking':
			case 'speaking':
				return {
					...common,
					identity: agentInfo.identity!,
					name: agentInfo.name,
					metadata: agentInfo.metadata,
					state,
					...generateDerivedStateValues(state),
					failureReasons: null,
					cameraTrack: videoTrack,
					microphoneTrack: audioTrack
				} as AgentStateCases;

			case 'failed':
				return {
					...common,
					identity: undefined,
					name: undefined,
					metadata: undefined,
					state: 'failed',
					...generateDerivedStateValues('failed'),
					failureReasons,
					cameraTrack: undefined,
					microphoneTrack: undefined
				} as AgentStateCases;
		}
	});

	// waitUntil* helpers.
	function waitForState(predicate: (s: AgentState) => boolean, label: string) {
		return (signal?: AbortSignal) => {
			if (predicate(stateRef)) {
				return Promise.resolve();
			}
			return new Promise<void>((resolve, reject) => {
				const stateChangedHandler = (s: AgentState) => {
					if (!predicate(s)) {
						return;
					}
					cleanup();
					resolve();
				};
				const abortHandler = () => {
					cleanup();
					reject(new Error(`createAgent(/* ... */).${label} - signal aborted`));
				};
				const cleanup = () => {
					emitter.off(AgentEvent.StateChanged, stateChangedHandler);
					signal?.removeEventListener('abort', abortHandler);
				};
				emitter.on(AgentEvent.StateChanged, stateChangedHandler);
				signal?.addEventListener('abort', abortHandler);
			});
		};
	}

	const waitUntilConnected = waitForState(
		(s) => generateDerivedStateValues(s).isConnected,
		'waitUntilConnected'
	);
	const waitUntilCouldBeListening = waitForState(
		(s) => generateDerivedStateValues(s).canListen,
		'waitUntilCouldBeListening'
	);
	const waitUntilFinished = waitForState(
		(s) => generateDerivedStateValues(s).isFinished,
		'waitUntilFinished'
	);

	function waitForTrack(event: AgentEvent, label: string) {
		return (signal?: AbortSignal) => {
			return new Promise<TrackReference>((resolve, reject) => {
				const changedHandler = (track: TrackReference | undefined) => {
					if (!track) {
						return;
					}
					cleanup();
					resolve(track);
				};
				const abortHandler = () => {
					cleanup();
					reject(new Error(`createAgent(/* ... */).${label} - signal aborted`));
				};
				const cleanup = () => {
					emitter.off(event, changedHandler);
					signal?.removeEventListener('abort', abortHandler);
				};
				emitter.on(event, changedHandler);
				signal?.addEventListener('abort', abortHandler);
			});
		};
	}

	const waitUntilCamera = waitForTrack(AgentEvent.CameraChanged, 'waitUntilCamera');
	const waitUntilMicrophone = waitForTrack(AgentEvent.MicrophoneChanged, 'waitUntilMicrophone');

	const actions: AgentActions = {
		waitUntilConnected,
		waitUntilCouldBeListening,
		waitUntilFinished,
		waitUntilCamera,
		waitUntilMicrophone
	};

	return new Proxy(actions as UseAgentReturn, {
		get(target, prop, receiver) {
			if (prop in actions) {
				return Reflect.get(target, prop, receiver);
			}
			return (agentState as unknown as Record<string | symbol, unknown>)[prop];
		},
		has(target, prop) {
			return prop in actions || prop in (agentState as object);
		}
	});
}
