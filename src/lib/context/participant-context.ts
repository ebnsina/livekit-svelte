import { getContext, setContext } from 'svelte';
import type { Participant } from 'livekit-client';
import { getMaybeTrackRefContext } from './track-reference-context.js';

const PARTICIPANT_CONTEXT_KEY = Symbol('lk-participant');

/** Provide a {@link Participant} to descendant components. Call during init. */
export function setParticipantContext(participant: Participant): Participant {
	setContext(PARTICIPANT_CONTEXT_KEY, participant);
	return participant;
}

/** Get the participant from context, or `undefined` if none was provided. */
export function getMaybeParticipantContext(): Participant | undefined {
	return getContext<Participant | undefined>(PARTICIPANT_CONTEXT_KEY);
}

/** Get the participant from context, throwing if it is missing. */
export function getParticipantContext(): Participant {
	const participant = getMaybeParticipantContext();
	if (!participant) {
		throw new Error(
			'[livekit-svelte] tried to access participant context outside of a participant context provider'
		);
	}
	return participant;
}

/**
 * Resolve a {@link Participant} from an explicit argument, the participant context, or the
 * participant of a surrounding track reference context (in that order).
 */
export function ensureParticipant(participant?: Participant): Participant {
	const p = participant ?? getMaybeParticipantContext() ?? getMaybeTrackRefContext()?.participant;
	if (!p) {
		throw new Error(
			'[livekit-svelte] no participant provided — render inside a participant/track context or pass one explicitly'
		);
	}
	return p;
}
