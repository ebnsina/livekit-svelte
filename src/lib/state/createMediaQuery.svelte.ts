/**
 * Reactively evaluates a CSS media query. Returns `false` during SSR and updates
 * as the query result changes in the browser.
 *
 * @param query - accessor for the media query string (e.g. `() => '(max-width: 760px)'`).
 */
export function createMediaQuery(query: () => string): { readonly matches: boolean } {
	let matches = $state(false);

	$effect(() => {
		if (typeof window === 'undefined' || !window.matchMedia) return;
		const mql = window.matchMedia(query());
		matches = mql.matches;
		const handler = (e: MediaQueryListEvent) => (matches = e.matches);
		mql.addEventListener('change', handler);
		return () => mql.removeEventListener('change', handler);
	});

	return {
		get matches() {
			return matches;
		}
	};
}
