import {
	getTrackByIdentifier,
	log,
	setupMediaTrack,
	type TrackReferenceOrPlaceholder
} from '@livekit/components-core';
import type { Track, TrackPublication } from 'livekit-client';

/** Reactive state and element props for rendering a single media track. */
export interface MediaTrackState {
	readonly publication: TrackPublication | undefined;
	readonly track: Track | undefined;
	readonly isMuted: boolean | undefined;
	readonly isSubscribed: boolean | undefined;
	/** Class name provided by the core setup helper. */
	readonly className: string;
	/** `data-lk-*` attributes to spread onto the media element. */
	readonly dataAttributes: Record<string, string | boolean | undefined>;
}

/**
 * Wires a track reference to a media element: subscribes to publication changes and
 * attaches/detaches the underlying track to the element returned by `getElement`.
 *
 * @param trackRef - the track (or placeholder) to render.
 * @param getElement - accessor for the `<video>`/`<audio>` element (via `bind:this`).
 */
export function createMediaTrack(
	trackRef: TrackReferenceOrPlaceholder,
	getElement: () => HTMLMediaElement | null | undefined
): MediaTrackState {
	const initial = getTrackByIdentifier(trackRef);
	let publication = $state<TrackPublication | undefined>(initial);
	let track = $state(initial?.track);
	let isMuted = $state(initial?.isMuted);
	let isSubscribed = $state(initial?.isSubscribed);
	let orientation = $state<'landscape' | 'portrait'>('landscape');

	const { className, trackObserver } = setupMediaTrack(trackRef);

	$effect(() => {
		const subscription = trackObserver.subscribe((pub) => {
			log.debug('update track', pub);
			publication = pub;
			track = pub?.track;
			isMuted = pub?.isMuted;
			isSubscribed = pub?.isSubscribed;
		});
		return () => subscription?.unsubscribe();
	});

	// Attach the track to the element; detach on teardown or when the track changes.
	$effect(() => {
		const el = getElement();
		const t = track;
		if (!t || !el) return;
		// Never attach the local participant's own audio (would echo).
		if (trackRef.participant.isLocal && t.kind === 'audio') return;
		t.attach(el);
		return () => t.detach(el);
	});

	// Derive orientation from the publication dimensions.
	$effect(() => {
		const dim = publication?.dimensions;
		if (typeof dim?.width === 'number' && typeof dim?.height === 'number') {
			orientation = dim.width > dim.height ? 'landscape' : 'portrait';
		}
	});

	return {
		get publication() {
			return publication;
		},
		get track() {
			return track;
		},
		get isMuted() {
			return isMuted;
		},
		get isSubscribed() {
			return isSubscribed;
		},
		get className() {
			return className;
		},
		get dataAttributes() {
			return {
				'data-lk-local-participant': trackRef.participant.isLocal,
				'data-lk-source': publication?.source,
				...(publication?.kind === 'video' && { 'data-lk-orientation': orientation })
			};
		}
	};
}
