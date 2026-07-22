import { sortParticipants } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import { createSpeakingParticipants } from './createSpeakingParticipants.svelte.js';

/**
 * Reactively returns the given participants sorted by importance.
 *
 * The sort re-runs whenever the active speakers change or the input participants change.
 *
 * @param participants - the participants to sort, either as an array or a reactive accessor.
 *   Pass an accessor (`() => participants`) to keep the result reactive when the input changes.
 * @returns a reactive holder whose `.current` is the sorted participant array.
 */
export function createSortedParticipants(
	participants: Participant[] | (() => Participant[])
): { readonly current: Participant[] } {
	const speaking = createSpeakingParticipants();
	const getParticipants = typeof participants === 'function' ? participants : () => participants;

	const sorted = $derived.by(() => {
		// Reference the active speakers so the sort re-runs when they change.
		void speaking.current;
		return sortParticipants(getParticipants());
	});

	return {
		get current() {
			return sorted;
		}
	};
}
