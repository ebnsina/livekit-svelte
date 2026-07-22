import { roomAudioPlaybackAllowedObservable } from '@livekit/components-core';
import type { Room } from 'livekit-client';
import { ensureRoom } from '../context/room-context.js';
import { observableState } from '../reactivity/observableState.svelte.js';

/** Reactive state for audio-playback permission. */
export interface AudioPlaybackState {
	/** Whether audio playback is currently allowed by the browser's autoplay policy. */
	readonly canPlayAudio: boolean;
	/** Start audio playback; call from a user-initiated event (e.g. a click handler). */
	startAudio: () => Promise<void>;
}

/**
 * Reactively tracks whether audio playback is allowed in the current context and exposes a
 * `startAudio` action. Many browsers block audio until a user-initiated event occurs.
 *
 * Port of `useAudioPlayback`. Wires `roomAudioPlaybackAllowedObservable` (from
 * @livekit/components-core) to a rune.
 *
 * @param room - the room; falls back to the room context.
 */
export function createAudioPlayback(room?: Room): AudioPlaybackState {
	const r = ensureRoom(room);
	const state = observableState(roomAudioPlaybackAllowedObservable(r), {
		canPlayAudio: r.canPlaybackAudio
	});

	return {
		get canPlayAudio() {
			return state.current.canPlayAudio;
		},
		startAudio: async () => {
			await r.startAudio();
		}
	};
}
