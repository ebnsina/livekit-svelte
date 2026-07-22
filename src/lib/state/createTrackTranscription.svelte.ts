import {
	addMediaTimestampToTranscription as addTimestampsToTranscription,
	dedupeSegments,
	trackTranscriptionObserver,
	trackSyncTimeObserver,
	type ReceivedTranscriptionSegment,
	type TrackReferenceOrPlaceholder
} from '@livekit/components-core';
import type { TranscriptionSegment } from 'livekit-client';

/**
 * Options for {@link createTrackTranscription}.
 *
 * @deprecated Mirrors the deprecated React `useTrackTranscription`. Use transcription streams instead.
 */
export interface TrackTranscriptionOptions {
	/**
	 * How many transcription segments should be buffered in state.
	 * @defaultValue 100
	 */
	bufferSize?: number;
	/** Optional callback for retrieving newly incoming transcriptions only. */
	onTranscription?: (newSegments: TranscriptionSegment[]) => void;
}

const TRACK_TRANSCRIPTION_DEFAULTS = {
	bufferSize: 100
} as const satisfies TrackTranscriptionOptions;

/** The media sync timestamps emitted by {@link trackSyncTimeObserver}. */
interface SyncTimestamps {
	timestamp: number;
	rtpTimestamp?: number;
}

/** Reactive transcription state returned by {@link createTrackTranscription}. */
export interface TrackTranscriptionState {
	/** The buffered transcription segments (at most `bufferSize`). */
	readonly segments: ReceivedTranscriptionSegment[];
}

/**
 * Reactively returns the transcription segments of a single track.
 *
 * Port of React's `useTrackTranscription`. The internal media-sync-time tracking
 * (React's `useTrackSyncTime`) is inlined here, since it is only consumed by this
 * deprecated API.
 *
 * @param getTrackRef - accessor for the track reference (or `undefined`).
 * @param options - buffering / callback options.
 */
export function createTrackTranscription(
	getTrackRef: () => TrackReferenceOrPlaceholder | undefined,
	options?: TrackTranscriptionOptions
): TrackTranscriptionState {
	const opts = { ...TRACK_TRANSCRIPTION_DEFAULTS, ...options };

	let segments = $state<ReceivedTranscriptionSegment[]>([]);
	let syncTimestamps: SyncTimestamps = { timestamp: Date.now(), rtpTimestamp: undefined };

	// Keep the latest media sync time for the current track (inlined `useTrackSyncTime`).
	$effect(() => {
		const track = getTrackRef()?.publication?.track;
		if (!track) {
			syncTimestamps = { timestamp: Date.now(), rtpTimestamp: undefined };
			return;
		}
		const subscription = trackSyncTimeObserver(track).subscribe((value) => {
			// `trackSyncTimeObserver` emits the media-sync-time payload object at runtime.
			syncTimestamps = value as unknown as SyncTimestamps;
		});
		return () => subscription.unsubscribe();
	});

	$effect(() => {
		const trackRef = getTrackRef();
		if (!trackRef?.publication) {
			return;
		}
		const subscription = trackTranscriptionObserver(trackRef.publication).subscribe((evt) => {
			const newSegments = evt[0];
			opts.onTranscription?.(newSegments);
			segments = dedupeSegments(
				segments,
				// When first receiving a segment, add the current media timestamp to it.
				newSegments.map((s) => addTimestampsToTranscription(s, syncTimestamps)),
				opts.bufferSize
			);
		});
		return () => subscription.unsubscribe();
	});

	return {
		get segments() {
			return segments;
		}
	};
}
