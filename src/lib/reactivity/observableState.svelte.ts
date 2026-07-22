import { readable, type Readable } from 'svelte/store';
import type { Observable, Subscription } from 'rxjs';

/**
 * Reactive holder backed by a Svelte 5 rune.
 * `.current` is reactive when read inside a component / `$derived` / template.
 */
export interface ObservableState<T> {
	readonly current: T;
}

/**
 * Bridges an RxJS `Observable` to a Svelte 5 rune.
 *
 * Every `setup*` helper in `@livekit/components-core` exposes its state as an RxJS
 * observable; this adapter subscribes on mount and unsubscribes on teardown.
 *
 * Must be called during component initialization (it registers an `$effect`).
 *
 * @param observable - source observable (may be `undefined` — then value stays `startWith`)
 * @param startWith - initial value emitted synchronously before the first push
 */
export function observableState<T>(
	observable: Observable<T> | undefined,
	startWith: T
): ObservableState<T> {
	let value = $state(startWith);

	$effect(() => {
		if (!observable) return;
		let sub: Subscription | undefined;
		try {
			sub = observable.subscribe({
				next: (v) => {
					value = v;
				},
				// Swallow observable errors so a single stream failure never crashes the tree.
				error: (err) => console.error('[livekit-svelte] observable error:', err)
			});
		} catch (err) {
			console.error('[livekit-svelte] failed to subscribe to observable:', err);
		}
		return () => sub?.unsubscribe();
	});

	return {
		get current() {
			return value;
		}
	};
}

/**
 * Classic-store variant of {@link observableState} for `$`-prefixed template usage.
 *
 * RxJS observables can't be consumed by Svelte's `$store` syntax directly because
 * `Observable.subscribe()` returns a `Subscription` (with `.unsubscribe`) rather than
 * the bare teardown function Svelte's store contract expects. This adapts that contract.
 */
export function toReadable<T>(observable: Observable<T> | undefined, startWith: T): Readable<T> {
	return readable(startWith, (set) => {
		if (!observable) return;
		const sub = observable.subscribe({
			next: set,
			error: (err) => console.error('[livekit-svelte] observable error:', err)
		});
		return () => sub.unsubscribe();
	});
}
