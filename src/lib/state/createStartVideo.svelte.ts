import { setupStartVideo } from '@livekit/components-core';
import type { Room } from 'livekit-client';
import { ensureRoom } from '../context/room-context.js';
import { observableState } from '../reactivity/observableState.svelte.js';

/** Options for {@link createStartVideo}. */
export interface CreateStartVideoProps {
	/** The room to start video for; falls back to the room context. */
	room?: Room;
}

/** Reactive state for a start-video button. */
export interface StartVideoState {
	/** Whether video playback is currently allowed. */
	readonly canPlayVideo: boolean;
	/** Class name provided by the core setup helper. */
	readonly className: string;
	/** CSS `display` value: hidden once video can play. */
	readonly display: 'none' | 'block';
	/** Start video playback; call from a user-initiated event. */
	handleStartVideo: () => void;
}

/**
 * Provides the state and action for a button that unblocks video playback.
 *
 * Port of `useStartVideo`. Reuses `setupStartVideo` (from @livekit/components-core) for the
 * class name, the playback-allowed observable, and the start handler.
 *
 * @param getProps - accessor for the reactive props.
 */
export function createStartVideo(getProps: () => CreateStartVideoProps): StartVideoState {
	const props = getProps();
	const room = ensureRoom(props.room);
	const { className, roomVideoPlaybackAllowedObservable, handleStartVideoPlayback } =
		setupStartVideo();
	const state = observableState(roomVideoPlaybackAllowedObservable(room), {
		canPlayVideo: room.canPlaybackVideo
	});

	return {
		get canPlayVideo() {
			return state.current.canPlayVideo;
		},
		get className() {
			return className;
		},
		get display() {
			return state.current.canPlayVideo ? 'none' : 'block';
		},
		handleStartVideo: () => {
			void handleStartVideoPlayback(room);
		}
	};
}
