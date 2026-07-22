import { observeParticipantMedia, type ParticipantMedia } from '@livekit/components-core';
import type { LocalParticipant, Room, TrackPublication } from 'livekit-client';
import { ensureRoom } from '../context/room-context.js';

/** Reactive state of the local participant and its media. */
export interface LocalParticipantState {
	readonly localParticipant: LocalParticipant;
	readonly isMicrophoneEnabled: boolean;
	readonly isCameraEnabled: boolean;
	readonly isScreenShareEnabled: boolean;
	readonly microphoneTrack: TrackPublication | undefined;
	readonly cameraTrack: TrackPublication | undefined;
	readonly lastMicrophoneError: LocalParticipant['lastMicrophoneError'];
	readonly lastCameraError: LocalParticipant['lastCameraError'];
}

/**
 * Reactively tracks the local participant and the enabled state of its
 * microphone, camera, and screen share.
 *
 * @param room - the room to use; falls back to the room from context.
 */
export function createLocalParticipant(room?: Room): LocalParticipantState {
	const r = ensureRoom(room);
	let localParticipant = $state<LocalParticipant>(r.localParticipant);
	let isMicrophoneEnabled = $state(localParticipant.isMicrophoneEnabled);
	let isCameraEnabled = $state(localParticipant.isCameraEnabled);
	let isScreenShareEnabled = $state(localParticipant.isScreenShareEnabled);
	let microphoneTrack = $state<TrackPublication | undefined>(undefined);
	let cameraTrack = $state<TrackPublication | undefined>(undefined);
	let lastMicrophoneError = $state(localParticipant.lastMicrophoneError);
	let lastCameraError = $state(localParticipant.lastCameraError);

	$effect(() => {
		const listener = observeParticipantMedia(r.localParticipant).subscribe(
			(media: ParticipantMedia<LocalParticipant>) => {
				isCameraEnabled = media.isCameraEnabled;
				isMicrophoneEnabled = media.isMicrophoneEnabled;
				isScreenShareEnabled = media.isScreenShareEnabled;
				cameraTrack = media.cameraTrack;
				microphoneTrack = media.microphoneTrack;
				lastMicrophoneError = media.participant.lastMicrophoneError;
				lastCameraError = media.participant.lastCameraError;
				localParticipant = media.participant;
			}
		);
		return () => listener.unsubscribe();
	});

	return {
		get localParticipant() {
			return localParticipant;
		},
		get isMicrophoneEnabled() {
			return isMicrophoneEnabled;
		},
		get isCameraEnabled() {
			return isCameraEnabled;
		},
		get isScreenShareEnabled() {
			return isScreenShareEnabled;
		},
		get microphoneTrack() {
			return microphoneTrack;
		},
		get cameraTrack() {
			return cameraTrack;
		},
		get lastMicrophoneError() {
			return lastMicrophoneError;
		},
		get lastCameraError() {
			return lastCameraError;
		}
	};
}
