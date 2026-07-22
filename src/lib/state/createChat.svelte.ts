import { setupChat, type ChatOptions, type ReceivedChatMessage } from '@livekit/components-core';
import { ConnectionState, type Room, type SendTextOptions } from 'livekit-client';
import { ensureRoom } from '../context/room-context.js';
import { createConnectionState } from './createConnectionState.svelte.js';

/** Options for {@link createChat}. */
export interface CreateChatOptions extends ChatOptions {
	/** The room to attach chat to; falls back to the room from context. */
	room?: Room;
}

/** Reactive chat state backed by the core `setupChat` observables. */
export interface ChatState {
	/** The list of received chat messages (reactive). */
	readonly chatMessages: ReceivedChatMessage[];
	/** Whether a message is currently being sent (reactive). */
	readonly isSending: boolean;
	/** Send a chat message to the room. */
	send: (message: string, options?: SendTextOptions) => Promise<ReceivedChatMessage>;
}

/**
 * Provides chat functionality for a LiveKit room. Reuses the core `setupChat`
 * helper unchanged. Message history is not persisted and resets when the room
 * disconnects, matching `@livekit/components-react`'s `useChat`.
 */
export function createChat(getOptions?: () => CreateChatOptions): ChatState {
	const options = getOptions?.() ?? {};
	const room = ensureRoom(options.room);
	const connection = createConnectionState(room);

	const chatOptions: ChatOptions = {
		messageDecoder: options.messageDecoder,
		messageEncoder: options.messageEncoder,
		channelTopic: options.channelTopic
	};

	let chatMessages = $state<ReceivedChatMessage[]>([]);
	let isSending = $state(false);

	// Recreate the chat setup whenever the room transitions in/out of the
	// disconnected state; this resets the message history on disconnect.
	const isDisconnected = $derived(connection.current === ConnectionState.Disconnected);
	const setup = $derived.by(() => {
		void isDisconnected;
		return setupChat(room, chatOptions);
	});

	$effect(() => {
		const s = setup;
		const messageSub = s.messageObservable.subscribe((v) => (chatMessages = v));
		const sendingSub = s.isSendingObservable.subscribe((v) => (isSending = v));
		return () => {
			messageSub.unsubscribe();
			sendingSub.unsubscribe();
		};
	});

	return {
		get chatMessages() {
			return chatMessages;
		},
		get isSending() {
			return isSending;
		},
		send: (message, sendOptions) => setup.send(message, sendOptions)
	};
}
