import {
	ParticipantAgentAttributes,
	participantTracksObservable,
	type ReceivedTranscriptionSegment,
	type TrackReference
} from '@livekit/components-core';
import { ConnectionState, ParticipantKind, Track, type RemoteParticipant } from 'livekit-client';
import { createConnectionState } from './createConnectionState.svelte.js';
import { createRemoteParticipants } from './createRemoteParticipants.svelte.js';
import { createTrackTranscription } from './createTrackTranscription.svelte.js';
import type { AgentState } from './createBarAnimator.svelte.js';

/** Reactive voice-assistant state returned by {@link createVoiceAssistant}. */
export interface VoiceAssistant {
	/** The agent participant. */
	readonly agent: RemoteParticipant | undefined;
	/** The current state of the agent. */
	readonly state: AgentState;
	/** The microphone track published by the agent or associated avatar worker (if any). */
	readonly audioTrack: TrackReference | undefined;
	/** The camera track published by the agent or associated avatar worker (if any). */
	readonly videoTrack: TrackReference | undefined;
	/** The transcriptions of the agent's microphone track (if any). */
	readonly agentTranscriptions: ReceivedTranscriptionSegment[];
	/** The agent's participant attributes. */
	readonly agentAttributes: RemoteParticipant['attributes'] | undefined;
}

const state_attribute = ParticipantAgentAttributes.AgentState;

/**
 * Looks for the first agent-participant in the room and exposes its state, tracks,
 * transcriptions and attributes reactively.
 *
 * Port of React's `useVoiceAssistant`.
 *
 * @remarks Requires an agent running with livekit-agents \>= 0.9.0.
 */
export function createVoiceAssistant(): VoiceAssistant {
	const remoteParticipants = createRemoteParticipants();
	const connectionState = createConnectionState();

	const agent = $derived(
		remoteParticipants.current.find(
			(p) =>
				p.kind === ParticipantKind.AGENT &&
				!(ParticipantAgentAttributes.PublishOnBehalf in p.attributes)
		)
	);
	const worker = $derived(
		remoteParticipants.current.find(
			(p) =>
				p.kind === ParticipantKind.AGENT &&
				p.attributes[ParticipantAgentAttributes.PublishOnBehalf] === agent?.identity
		)
	);

	// Track references for a participant, reactive to the (late-arriving) agent/worker identity.
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
				sources: [Track.Source.Microphone, Track.Source.Camera]
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

	const agentTracks = createTracksForIdentity(() => agent?.identity);
	const workerTracks = createTracksForIdentity(() => worker?.identity);

	const audioTrack = $derived(
		agentTracks.current.find((t) => t.source === Track.Source.Microphone) ??
			workerTracks.current.find((t) => t.source === Track.Source.Microphone)
	);
	const videoTrack = $derived(
		agentTracks.current.find((t) => t.source === Track.Source.Camera) ??
			workerTracks.current.find((t) => t.source === Track.Source.Camera)
	);

	const transcription = createTrackTranscription(() => audioTrack);

	// Reactively track the agent's attributes (the agent may connect after init).
	let agentAttributes = $state<RemoteParticipant['attributes'] | undefined>(undefined);
	$effect(() => {
		const a = agent;
		agentAttributes = a?.attributes;
	});

	const state = $derived.by<AgentState>(() => {
		if (connectionState.current === ConnectionState.Disconnected) {
			return 'disconnected';
		} else if (
			connectionState.current === ConnectionState.Connecting ||
			!agent ||
			!agentAttributes?.[state_attribute]
		) {
			return 'connecting';
		} else {
			return agentAttributes[state_attribute] as AgentState;
		}
	});

	return {
		get agent() {
			return agent;
		},
		get state() {
			return state;
		},
		get audioTrack() {
			return audioTrack;
		},
		get videoTrack() {
			return videoTrack;
		},
		get agentTranscriptions() {
			return transcription.segments;
		},
		get agentAttributes() {
			return agentAttributes;
		}
	};
}
