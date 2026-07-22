import type { ReceivedDataMessage } from '@livekit/components-core';
import { setupDataMessageHandler } from '@livekit/components-core';
import type { DataPublishOptions } from 'livekit-client';
import { ensureRoom } from '../context/room-context.js';
import { observableState } from '../reactivity/observableState.svelte.js';

/** Reactive send/receive state returned by {@link createDataChannel}. */
export interface DataChannelState<T extends string = string> {
	/** The latest received message (filtered by topic when one was provided). */
	readonly message: ReceivedDataMessage<T> | undefined;
	/** Whether a message is currently being sent. */
	readonly isSending: boolean;
	/** Publish a payload over the data channel. */
	send: (payload: Uint8Array, options?: DataPublishOptions) => Promise<void>;
}

/**
 * Reactively provides the ability to send and receive messages over the room's data channel.
 * Pass an optional `topic` to narrow down which messages are surfaced.
 *
 * @remarks
 * There is only one data channel. Passing a `topic` does not open a new data channel; it is only
 * used to filter out messages with no or a different `topic`.
 */
export function createDataChannel<T extends string>(
	topic: T,
	onMessage?: (msg: ReceivedDataMessage<T>) => void
): DataChannelState<T>;
/**
 * Overload for {@link createDataChannel} without a topic.
 */
export function createDataChannel(
	onMessage?: (msg: ReceivedDataMessage) => void
): DataChannelState;
export function createDataChannel<T extends string>(
	topicOrCallback?: T | ((msg: ReceivedDataMessage) => void),
	callback?: (msg: ReceivedDataMessage<T>) => void
): DataChannelState<T> {
	const onMessage = typeof topicOrCallback === 'function' ? topicOrCallback : callback;
	const topic = typeof topicOrCallback === 'string' ? topicOrCallback : undefined;

	const room = ensureRoom();
	const { send, messageObservable, isSendingObservable } = setupDataMessageHandler<T>(
		room,
		topic,
		onMessage as ((msg: ReceivedDataMessage<T>) => void) | undefined
	);

	const message = observableState<ReceivedDataMessage<T> | undefined>(
		messageObservable as never,
		undefined
	);
	const isSending = observableState(isSendingObservable, false);

	return {
		get message() {
			return message.current;
		},
		get isSending() {
			return isSending.current;
		},
		send
	};
}
