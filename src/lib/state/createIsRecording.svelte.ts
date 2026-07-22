import { recordingStatusObservable } from '@livekit/components-core';
import type { Room } from 'livekit-client';
import { ensureRoom } from '../context/room-context.js';
import { createConnectionState } from './createConnectionState.svelte.js';

/**
 * Reactively tracks whether the room is currently being recorded.
 *
 * @param room - the room to observe; falls back to the room from context.
 * @returns a reactive holder whose `.current` is `true` while the room is being recorded.
 */
export function createIsRecording(room?: Room): { readonly current: boolean } {
	const r = ensureRoom(room);
	const connectionState = createConnectionState(r);

	let isRecording = $state(r.isRecording);

	$effect(() => {
		// Re-subscribe when the connection state changes (mirrors the React dependency).
		void connectionState.current;
		const subscription = recordingStatusObservable(r).subscribe((value) => {
			isRecording = value;
		});
		return () => subscription.unsubscribe();
	});

	return {
		get current() {
			return isRecording;
		}
	};
}
