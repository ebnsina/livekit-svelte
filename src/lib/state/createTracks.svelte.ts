import type {
	SourcesArray,
	TrackReference,
	TrackReferenceOrPlaceholder,
	TrackReferencePlaceholder,
	TrackSourceWithOptions
} from '@livekit/components-core';
import {
	isSourcesWithOptions,
	isSourceWitOptions,
	log,
	trackReferencesObservable
} from '@livekit/components-core';
import { Track, type Participant, type Room, type RoomEvent } from 'livekit-client';
import { ensureRoom } from '../context/room-context.js';

/** Options for {@link createTracks}. */
export type CreateTracksOptions = {
	/** Additional room events that should trigger an update. */
	updateOnlyOn?: RoomEvent[];
	/** Only include tracks that are actually subscribed. */
	onlySubscribed?: boolean;
	/** The room to read tracks from; falls back to the room from context. */
	room?: Room;
};

/** Return type of {@link createTracks}, narrowed by the shape of `sources`. */
export type CreateTracksReturnType<T> = T extends Track.Source[]
	? TrackReference[]
	: T extends TrackSourceWithOptions[]
		? TrackReferenceOrPlaceholder[]
		: never;

const DEFAULT_SOURCES = [
	Track.Source.Camera,
	Track.Source.Microphone,
	Track.Source.ScreenShare,
	Track.Source.ScreenShareAudio,
	Track.Source.Unknown
];

/**
 * Reactively returns the track references in a room for the requested `sources`.
 *
 * Pass plain `Track.Source[]` for subscribed tracks only, or
 * `{ source, withPlaceholder: true }[]` to also get placeholders for participants
 * that have no matching subscription yet.
 *
 * @returns a reactive holder whose `.current` is the up-to-date track reference array.
 */
export function createTracks<T extends SourcesArray = Track.Source[]>(
	sources: T = DEFAULT_SOURCES as T,
	options: CreateTracksOptions = {}
): { readonly current: CreateTracksReturnType<T> } {
	const room = ensureRoom(options.room);
	const sources_ = sources.map((s) => (isSourceWitOptions(s) ? s.source : s));

	let trackReferences = $state<TrackReference[]>([]);
	let participants = $state<Participant[]>([]);

	$effect(() => {
		const subscription = trackReferencesObservable(room, sources_, {
			additionalRoomEvents: options.updateOnlyOn,
			onlySubscribed: options.onlySubscribed
		}).subscribe(({ trackReferences: tr, participants: p }) => {
			log.debug('setting track bundles', tr, p);
			trackReferences = tr;
			participants = p;
		});
		return () => subscription.unsubscribe();
	});

	const current = $derived.by(() => {
		if (!isSourcesWithOptions(sources)) {
			return trackReferences;
		}
		const requirePlaceholder = requiredPlaceholders(sources, participants);
		const withPlaceholders: TrackReferenceOrPlaceholder[] = Array.from(trackReferences);
		participants.forEach((participant) => {
			if (!requirePlaceholder.has(participant.identity)) return;
			const sourcesToAdd = requirePlaceholder.get(participant.identity) ?? [];
			sourcesToAdd.forEach((placeholderSource) => {
				const alreadyPresent = trackReferences.find(
					({ participant: p, publication }) =>
						participant.identity === p.identity && publication.source === placeholderSource
				);
				if (alreadyPresent) return;
				log.debug(`Add ${placeholderSource} placeholder for participant ${participant.identity}.`);
				const placeholder: TrackReferencePlaceholder = {
					participant,
					source: placeholderSource
				};
				withPlaceholders.push(placeholder);
			});
		});
		return withPlaceholders;
	});

	return {
		get current() {
			return current as CreateTracksReturnType<T>;
		}
	};
}

function difference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
	const result = new Set(setA);
	for (const elem of setB) result.delete(elem);
	return result;
}

/** Computes, per participant, which requested sources need a placeholder track reference. */
export function requiredPlaceholders<T extends SourcesArray>(
	sources: T,
	participants: Participant[]
): Map<Participant['identity'], Track.Source[]> {
	const placeholderMap = new Map<Participant['identity'], Track.Source[]>();
	if (!isSourcesWithOptions(sources)) return placeholderMap;

	const sourcesThatNeedPlaceholder = sources
		.filter((s) => s.withPlaceholder)
		.map((s) => s.source);

	participants.forEach((participant) => {
		const subscribedSources = participant
			.getTrackPublications()
			.map((pub) => pub.track?.source)
			.filter((s): s is Track.Source => s !== undefined);
		const needed = Array.from(
			difference(new Set(sourcesThatNeedPlaceholder), new Set(subscribedSources))
		);
		if (needed.length > 0) {
			placeholderMap.set(participant.identity, needed);
		}
	});
	return placeholderMap;
}
