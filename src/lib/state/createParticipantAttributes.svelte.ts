import { participantAttributesObserver } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import type { Observable } from 'rxjs';
import { ensureParticipant, getMaybeParticipantContext } from '../context/participant-context.js';
import { observableState, type ObservableState } from '../reactivity/observableState.svelte.js';

/** Options for {@link createParticipantAttributes} and {@link createParticipantAttribute}. */
export interface CreateParticipantAttributesOptions {
	/** The participant whose attributes to observe; falls back to the participant context. */
	participant?: Participant;
}

/** The reactive attribute state of a participant. */
export interface ParticipantAttributes {
	/** All current attributes of the participant. */
	attributes?: Readonly<Record<string, string>>;
	/** The subset of attributes that changed in the latest update. */
	changed?: Readonly<Record<string, string>>;
}

/**
 * Reactively returns the attributes of a given participant.
 *
 * Requires a {@link Participant} passed via options or provided through the participant context.
 *
 * @param options - the participant to observe.
 * @returns a reactive holder whose `.current` is the participant's attribute state.
 */
export function createParticipantAttributes(
	options: CreateParticipantAttributesOptions = {}
): ObservableState<ParticipantAttributes> {
	const participantContext = getMaybeParticipantContext();
	const p = options.participant ?? participantContext;

	const attributeObserver = (
		p ? participantAttributesObserver(p) : participantAttributesObserver(p)
	) as Observable<ParticipantAttributes>;

	return observableState<ParticipantAttributes>(attributeObserver, {
		attributes: p?.attributes
	});
}

/**
 * Reactively returns the latest value of a single attribute key of a participant.
 *
 * Requires a {@link Participant} passed via options or provided through the participant context.
 *
 * @param attributeKey - the attribute key to read.
 * @param options - the participant to observe.
 * @returns a reactive holder whose `.current` is the attribute value (or `undefined`).
 */
export function createParticipantAttribute(
	attributeKey: string,
	options: CreateParticipantAttributesOptions = {}
): { readonly current: string | undefined } {
	const p = ensureParticipant(options.participant);
	let attribute = $state<string | undefined>(p.attributes[attributeKey]);

	$effect(() => {
		const subscription = participantAttributesObserver(p).subscribe((val) => {
			if (val.changed[attributeKey] !== undefined) {
				attribute = val.attributes[attributeKey];
			}
		});
		return () => subscription.unsubscribe();
	});

	return {
		get current() {
			return attribute;
		}
	};
}
