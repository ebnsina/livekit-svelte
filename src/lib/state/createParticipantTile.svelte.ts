import { setupParticipantTile, type TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { Track } from 'livekit-client';
import { ensureTrackRef } from '../context/track-reference-context.js';
import { createIsMuted } from './createIsMuted.svelte.js';
import { createIsSpeaking } from './createIsSpeaking.svelte.js';
import { facingMode } from './facingMode.js';

/** Options for {@link createParticipantTile}. */
export interface CreateParticipantTileOptions {
	disableSpeakingIndicator?: boolean;
}

/** Reactive tile state: class name and the `data-lk-*` attributes to spread on the root. */
export interface ParticipantTileState {
	readonly trackRef: TrackReferenceOrPlaceholder;
	readonly className: string;
	readonly dataAttributes: Record<string, string | boolean | undefined>;
}

/**
 * Provides the class name and reactive `data-lk-*` attributes for a participant tile
 * (audio/video muted, speaking, local, source, facing mode).
 *
 * @param trackRef - the track reference to display; falls back to the track ref context.
 */
export function createParticipantTile(
	trackRef?: TrackReferenceOrPlaceholder,
	options: CreateParticipantTileOptions = {}
): ParticipantTileState {
	const tr = ensureTrackRef(trackRef);
	const { className } = setupParticipantTile();

	const micRef: TrackReferenceOrPlaceholder = {
		participant: tr.participant,
		source: Track.Source.Microphone,
		publication: tr.participant.getTrackPublication(Track.Source.Microphone)
	};

	const isVideoMuted = createIsMuted(tr);
	const isAudioMuted = createIsMuted(micRef);
	const isSpeaking = createIsSpeaking(tr.participant);

	return {
		trackRef: tr,
		className,
		get dataAttributes() {
			return {
				'data-lk-audio-muted': isAudioMuted.current,
				'data-lk-video-muted': isVideoMuted.current,
				'data-lk-speaking': options.disableSpeakingIndicator === true ? false : isSpeaking.current,
				'data-lk-local-participant': tr.participant.isLocal,
				'data-lk-source': tr.source,
				'data-lk-facing-mode': facingMode(tr)
			};
		}
	};
}
