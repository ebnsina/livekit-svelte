import type {
	ReceivedAgentTranscriptionMessage,
	ReceivedChatMessage,
	ReceivedMessage,
	ReceivedUserTranscriptionMessage
} from '@livekit/components-core';
import type { SendTextOptions } from 'livekit-client';
import { ensureSession } from '../context/session-context.svelte.js';
import { Emitter, type TypedEmitter } from './createAgent.svelte.js';
import { createAgent } from './createAgent.svelte.js';
import { createChat } from './createChat.svelte.js';
import { createTranscriptions } from './createTranscriptions.svelte.js';
import type { UseSessionReturn } from './createSession.svelte.js';

/** Message events. */
export enum MessagesEvent {
	/** Emits when a new message is received from a participant. */
	MessageReceived = 'messageReceived'
}

/** Callback signatures for {@link MessagesEvent}. */
export type MessagesCallbacks = {
	[MessagesEvent.MessageReceived]: (message: ReceivedMessage) => void;
};

/** The reactive shape returned by {@link createSessionMessages}. */
export type SessionMessagesState = {
	/** All received messages (transcriptions + chat), sorted by first-received time. */
	readonly messages: Array<ReceivedMessage>;
	/** Whether a send operation is currently in progress. */
	readonly isSending: boolean;
	/** Send a chat message. */
	send: (message: string, options?: SendTextOptions) => Promise<ReceivedChatMessage>;
	internal: { emitter: TypedEmitter<MessagesCallbacks> };
};

/**
 * Merges agent/user transcriptions with chat messages into a single, time-ordered
 * message list and emits an event whenever a new message arrives.
 *
 * Port of React's `useSessionMessages`.
 *
 * @param session - the session (or `undefined` to use context).
 */
export function createSessionMessages(session?: UseSessionReturn): SessionMessagesState {
	const resolvedSession = ensureSession(session);
	const room = resolvedSession.room;

	const emitter = new Emitter<MessagesCallbacks>();

	const agent = createAgent(() => resolvedSession);
	const transcriptions = createTranscriptions({ room });
	const chat = createChat(() => ({ room }));

	const transcriptionMessages = $derived.by<
		Array<ReceivedUserTranscriptionMessage | ReceivedAgentTranscriptionMessage>
	>(() => {
		return transcriptions.current.map((transcription) => {
			const agentParticipant = agent.internal.agentParticipant;
			const workerParticipant = agent.internal.workerParticipant;

			switch (transcription.participantInfo.identity) {
				case room.localParticipant.identity:
					return {
						type: 'userTranscript',
						message: transcription.text,
						id: transcription.streamInfo.id,
						timestamp: transcription.streamInfo.timestamp,
						from: room.localParticipant
					};

				case agentParticipant?.identity:
				case workerParticipant?.identity:
					return {
						type: 'agentTranscript',
						message: transcription.text,
						id: transcription.streamInfo.id,
						timestamp: transcription.streamInfo.timestamp,
						from:
							agentParticipant?.identity === transcription.participantInfo.identity
								? agentParticipant
								: workerParticipant!
					};

				default:
					// If an associated participant is not found, assume it is an agent transcription
					// (e.g. from an agent that has since disconnected from the room).
					return {
						type: 'agentTranscript',
						message: transcription.text,
						id: transcription.streamInfo.id,
						timestamp: transcription.streamInfo.timestamp,
						from: Array.from(room.remoteParticipants.values()).find(
							(p) => p.identity === transcription.participantInfo.identity
						)
					};
			}
		});
	});

	const receivedMessages = $derived<Array<ReceivedMessage>>([
		...transcriptionMessages,
		...chat.chatMessages
	]);

	const messageFirstReceivedTimeMap = new Map<ReceivedMessage['id'], Date>();
	const sortedReceivedMessages = $derived.by(() => {
		const now = new Date();
		for (const message of receivedMessages) {
			if (messageFirstReceivedTimeMap.has(message.id)) {
				continue;
			}
			messageFirstReceivedTimeMap.set(message.id, now);
		}

		return [...receivedMessages].sort((a, b) => {
			const aFirstReceivedAt = messageFirstReceivedTimeMap.get(a.id);
			const bFirstReceivedAt = messageFirstReceivedTimeMap.get(b.id);
			if (typeof aFirstReceivedAt === 'undefined' || typeof bFirstReceivedAt === 'undefined') {
				return 0;
			}
			return aFirstReceivedAt.getTime() - bFirstReceivedAt.getTime();
		});
	});

	const previouslyReceivedMessageIds = new Set<ReceivedMessage['id']>();
	$effect(() => {
		for (const message of sortedReceivedMessages) {
			if (previouslyReceivedMessageIds.has(message.id)) {
				continue;
			}
			previouslyReceivedMessageIds.add(message.id);
			emitter.emit(MessagesEvent.MessageReceived, message);
		}
	});

	return {
		get messages() {
			return sortedReceivedMessages;
		},
		get isSending() {
			return chat.isSending;
		},
		send: (message, options) => chat.send(message, options),
		internal: { emitter }
	};
}
