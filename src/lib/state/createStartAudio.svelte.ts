import { setupStartAudio } from '@livekit/components-core';
import type { Room } from 'livekit-client';
import { ensureRoom } from '../context/room-context.js';
import { observableState } from '../reactivity/observableState.svelte.js';

/** Options for {@link createStartAudio}. */
export interface CreateStartAudioProps {
	/** The room to start audio for; falls back to the room context. */
	room?: Room;
}

/** Reactive state for a start-audio button. */
export interface StartAudioState {
	/** Whether audio playback is currently allowed. */
	readonly canPlayAudio: boolean;
	/** Class name provided by the core setup helper. */
	readonly className: string;
	/** CSS `display` value: hidden once audio can play. */
	readonly display: 'none' | 'block';
	/** Start audio playback; call from a user-initiated event. */
	handleStartAudio: () => void;
}

/**
 * Provides the state and action for a button that unblocks audio playback.
 *
 * Port of `useStartAudio`. Reuses `setupStartAudio` (from @livekit/components-core) for the
 * class name, the playback-allowed observable, and the start handler.
 *
 * @param getProps - accessor for the reactive props.
 */
export function createStartAudio(getProps: () => CreateStartAudioProps): StartAudioState {
	const props = getProps();
	const room = ensureRoom(props.room);
	const { className, roomAudioPlaybackAllowedObservable, handleStartAudioPlayback } =
		setupStartAudio();
	const state = observableState(roomAudioPlaybackAllowedObservable(room), {
		canPlayAudio: room.canPlaybackAudio
	});

	return {
		get canPlayAudio() {
			return state.current.canPlayAudio;
		},
		get className() {
			return className;
		},
		get display() {
			return state.current.canPlayAudio ? 'none' : 'block';
		},
		handleStartAudio: () => {
			void handleStartAudioPlayback(room);
		}
	};
}
