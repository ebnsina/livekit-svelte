import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { getTrackByIdentifier, setupMediaTrack } from '@livekit/components-core';
import { Track, type Participant, type TrackPublication } from 'livekit-client';
import { ensureParticipant } from '../context/participant-context.js';

/**
 * Reactively returns the track of a participant referenced by its track name.
 *
 * Ensures a valid participant reference is available, either from the passed `participant`
 * argument or, if omitted, from the participant context.
 *
 * @param name - the track name to look up.
 * @param participant - the participant; falls back to the participant context.
 * @returns a reactive holder whose `.current` is the resolved track reference (or placeholder).
 */
export function createTrackByName(
	name: string,
	participant?: Participant
): { readonly current: TrackReferenceOrPlaceholder } {
	const p = ensureParticipant(participant);
	const source = { name, participant: p };

	let publication = $state<TrackPublication | undefined>(getTrackByIdentifier(source));

	const { trackObserver } = setupMediaTrack(source);

	$effect(() => {
		const subscription = trackObserver.subscribe((pub) => {
			publication = pub;
		});
		return () => subscription?.unsubscribe();
	});

	return {
		get current() {
			return {
				participant: p,
				source: Track.Source.Unknown,
				publication
			};
		}
	};
}
