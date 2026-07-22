/* eslint-disable @typescript-eslint/no-explicit-any */

/** A minimal event-emitter surface (subset of Node's `EventEmitter`). */
export interface EventEmitterLike {
	on(event: string | symbol, listener: (...args: any[]) => void): unknown;
	off(event: string | symbol, listener: (...args: any[]) => void): unknown;
}

/** An object exposing an emitter through `internal.emitter` (e.g. the session/agent/messages states). */
export interface WithInternalEmitter<E extends EventEmitterLike> {
	internal: { emitter: E };
}

type EventInstance<E extends EventEmitterLike> = E | WithInternalEmitter<E> | null | undefined;

function resolveEmitter<E extends EventEmitterLike>(instance: EventInstance<E>): E | null {
	if (!instance) {
		return null;
	}
	if ('internal' in instance) {
		return instance.internal.emitter;
	}
	return instance;
}

/**
 * Reactively binds a handler to an event on a typed emitter (or an object exposing
 * one via `internal.emitter`), cleaning up when the instance or handler changes.
 *
 * Port of React's `useEvents`. Instance and handler are passed as accessors so the
 * subscription re-binds reactively (the equivalent of React's dependency array).
 *
 * @param getInstance - accessor for the emitter (or emitter-holder, or nullish).
 * @param event - the event name to listen to.
 * @param getHandler - accessor for the handler (or `undefined` to bind nothing).
 */
export function createEvents<E extends EventEmitterLike>(
	getInstance: () => EventInstance<E>,
	event: string | symbol,
	getHandler: () => ((...args: any[]) => void) | undefined
): void {
	$effect(() => {
		const emitter = resolveEmitter(getInstance());
		const handler = getHandler();
		if (!emitter || !handler) {
			return;
		}
		emitter.on(event, handler);
		return () => {
			emitter.off(event, handler);
		};
	});
}
