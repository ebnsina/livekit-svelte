import { setupTextStream, type TextStreamData } from '@livekit/components-core';
import { ConnectionState, type Room } from 'livekit-client';
import { ensureRoom } from '../context/room-context.js';
import { createConnectionState } from './createConnectionState.svelte.js';

/** Options for {@link createTextStream}. */
export interface CreateTextStreamOptions {
	/** The room to use; falls back to the room from context. */
	room?: Room;
}

/** Reactive text-stream state returned by {@link createTextStream}. */
export interface TextStreamState {
	/** The received text streams for the topic (reactive). */
	readonly textStreams: TextStreamData[];
}

/**
 * Reactively subscribes to incoming text streams on a given topic.
 *
 * Port of React's `useTextStream`. While the room is disconnected no stream is
 * observed; the last known list is retained (matching `useObservableState`).
 *
 * @param topic - the topic to listen to.
 * @param options - optional explicit room.
 */
export function createTextStream(topic: string, options?: CreateTextStreamOptions): TextStreamState {
	const room = ensureRoom(options?.room);
	const connection = createConnectionState(room);

	let textStreams = $state<TextStreamData[]>([]);

	$effect(() => {
		const isDisconnected = connection.current === ConnectionState.Disconnected;
		if (isDisconnected) {
			return;
		}
		// Re-run whenever the topic changes.
		void topic;
		const subscription = setupTextStream(room, topic).subscribe((streams) => {
			textStreams = streams;
		});
		return () => subscription.unsubscribe();
	});

	return {
		get textStreams() {
			return textStreams;
		}
	};
}
