import {
	log,
	setupManualToggle,
	setupMediaToggle,
	type CaptureOptionsBySource,
	type ToggleSource
} from '@livekit/components-core';
import type { Room, TrackPublication, TrackPublishOptions } from 'livekit-client';
import { getMaybeRoomContext } from '../context/room-context.js';
import { observableState } from '../reactivity/observableState.svelte.js';

/** Options for {@link createTrackToggle}. */
export interface CreateTrackToggleProps<T extends ToggleSource> {
	source: T;
	/** Force an initial enabled state on mount. */
	initialState?: boolean;
	/** Called when the enabled state changes; second arg is whether it was user-initiated. */
	onChange?: (enabled: boolean, isUserInitiated: boolean) => void;
	captureOptions?: CaptureOptionsBySource<T>;
	publishOptions?: TrackPublishOptions;
	onDeviceError?: (error: Error) => void;
	/** The room to toggle tracks on; falls back to the room from context. */
	room?: Room;
}

/** Reactive state for a track toggle button. */
export interface TrackToggleState<T extends ToggleSource> {
	readonly enabled: boolean;
	readonly pending: boolean;
	readonly source: T;
	readonly className: string;
	readonly track: TrackPublication | undefined;
	/** Toggle the track (optionally forcing a state). */
	toggle: (
		forceState?: boolean,
		captureOptions?: CaptureOptionsBySource<T>
	) => Promise<void | boolean | undefined>;
	/** Click handler that toggles and tracks user-initiation. */
	onclick: () => void;
}

/**
 * Provides the state and actions for muting/unmuting a local track (camera,
 * microphone, or screen share). Uses the room's media toggle when a room is
 * available, otherwise a manual (roomless) toggle.
 */
export function createTrackToggle<T extends ToggleSource>(
	getProps: () => CreateTrackToggleProps<T>
): TrackToggleState<T> {
	const props = getProps();
	const room = props.room ?? getMaybeRoomContext();
	const source = props.source;
	const track = room?.localParticipant?.getTrackPublication(source);

	let userInteraction = false;

	const setup = room
		? setupMediaToggle<T>(source, room, props.captureOptions, props.publishOptions, props.onDeviceError)
		: setupManualToggle();
	const { toggle, className, pendingObserver, enabledObserver } = setup;

	const pending = observableState(pendingObserver, false);
	const enabled = observableState(enabledObserver, props.initialState ?? !!track?.isEnabled);

	// Notify on enabled changes.
	$effect(() => {
		getProps().onChange?.(enabled.current, userInteraction);
		userInteraction = false;
	});

	// Force the initial state once on mount, if requested.
	$effect(() => {
		if (props.initialState !== undefined) {
			log.debug('forcing initial toggle state', source, props.initialState);
			void toggle(props.initialState);
		}
	});

	return {
		get enabled() {
			return enabled.current;
		},
		get pending() {
			return pending.current;
		},
		get source() {
			return source;
		},
		get className() {
			return className;
		},
		get track() {
			return track;
		},
		toggle,
		onclick: () => {
			userInteraction = true;
			Promise.resolve(toggle()).catch(() => (userInteraction = false));
		}
	};
}
