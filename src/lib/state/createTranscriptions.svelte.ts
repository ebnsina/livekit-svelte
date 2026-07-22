import { DataTopic, ParticipantAgentAttributes, type TextStreamData } from '@livekit/components-core';
import type { Room } from 'livekit-client';
import { createTextStream } from './createTextStream.svelte.js';

/** Options for {@link createTranscriptions}. */
export interface CreateTranscriptionsOptions {
	/** The room to use; falls back to the room from context. */
	room?: Room;
	/** Only include transcriptions from these participant identities. */
	participantIdentities?: string[];
	/** Only include transcriptions for these track sids. */
	trackSids?: string[];
}

/** Reactive transcription state returned by {@link createTranscriptions}. */
export interface TranscriptionsState {
	/** The filtered transcription text streams (reactive). */
	readonly current: TextStreamData[];
}

/**
 * Reactively returns the transcriptions for the given participant identities and
 * track sids. If no filters are provided, all transcriptions are returned.
 *
 * Port of React's `useTranscriptions`.
 */
export function createTranscriptions(options: CreateTranscriptionsOptions = {}): TranscriptionsState {
	const { participantIdentities, trackSids } = options;
	const stream = createTextStream(DataTopic.TRANSCRIPTION, { room: options.room });

	const filtered = $derived(
		stream.textStreams
			.filter((s) =>
				participantIdentities ? participantIdentities.includes(s.participantInfo.identity) : true
			)
			.filter((s) =>
				trackSids
					? trackSids.includes(
							s.streamInfo.attributes?.[ParticipantAgentAttributes.TranscribedTrackId] ?? ''
						)
					: true
			)
	);

	return {
		get current() {
			return filtered;
		}
	};
}
