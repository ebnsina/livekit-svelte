import type { TrackReference } from '@livekit/components-core';
import { participantTracksObservable } from '@livekit/components-core';
import type { Room, Track } from 'livekit-client';
import { getMaybeParticipantContext } from '../context/participant-context.js';
import { createParticipants } from './createParticipants.svelte.js';

/** Options for {@link createParticipantTracks}. */
export interface CreateParticipantTracksOptions {
	/** Identity of the participant whose tracks to return; falls back to the participant context. */
	participantIdentity?: string;
	/** The room to use; falls back to the room from context. */
	room?: Room;
}

/**
 * Reactively returns the tracks of a single participant for the requested `sources`.
 *
 * If `participantIdentity` is not provided, the participant is resolved from the participant context.
 *
 * @param sources - the track sources to include.
 * @param optionsOrParticipantIdentity - options object, or a participant identity string.
 * @returns a reactive holder whose `.current` is the participant's track references.
 */
export function createParticipantTracks<TrackSource extends Track.Source>(
	sources: TrackSource[],
	optionsOrParticipantIdentity: CreateParticipantTracksOptions | string = {}
): { readonly current: TrackReference[] } {
	let participantIdentity: string | undefined;
	let room: Room | undefined;
	if (typeof optionsOrParticipantIdentity === 'string') {
		participantIdentity = optionsOrParticipantIdentity;
	} else {
		participantIdentity = optionsOrParticipantIdentity.participantIdentity;
		room = optionsOrParticipantIdentity.room;
	}

	const participantContext = getMaybeParticipantContext();
	const participants = createParticipants({ room, updateOnlyOn: [] });

	const participant = $derived.by(() => {
		if (participantIdentity) {
			return participants.current.find((p) => p.identity === participantIdentity);
		}
		return participantContext;
	});

	let trackRefs = $state<TrackReference[]>([]);

	$effect(() => {
		const p = participant;
		if (!p) {
			trackRefs = [];
			return;
		}
		const subscription = participantTracksObservable(p, { sources }).subscribe((refs) => {
			trackRefs = refs;
		});
		return () => subscription.unsubscribe();
	});

	return {
		get current() {
			return trackRefs;
		}
	};
}
