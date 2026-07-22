/** Options for {@link createSwipe}. */
export interface SwipeOptions {
	/** Required distance between touch start and end to count as a swipe (default 50px). */
	minSwipeDistance?: number;
	onLeftSwipe?: () => void;
	onRightSwipe?: () => void;
}

/**
 * Detects horizontal swipe gestures on an element and invokes the given callbacks.
 *
 * Wires `touchstart`/`touchmove`/`touchend` listeners through an `$effect`, so it must
 * be called during component initialization. The listeners are re-attached whenever the
 * element getter returns a different element and torn down on cleanup.
 *
 * @param element - getter for the element to attach swipe listeners to.
 */
export function createSwipe(
	element: () => HTMLElement | undefined | null,
	options: SwipeOptions = {}
): void {
	$effect(() => {
		const el = element();
		if (!el) return;

		let touchStart: number | null = null;
		let touchEnd: number | null = null;
		const minSwipeDistance = options.minSwipeDistance ?? 50;

		const onTouchStart = (event: TouchEvent) => {
			// Otherwise the swipe is fired even with usual touch events.
			touchEnd = null;
			touchStart = event.targetTouches[0].clientX;
		};

		const onTouchMove = (event: TouchEvent) => {
			touchEnd = event.targetTouches[0].clientX;
		};

		const onTouchEnd = () => {
			if (touchStart === null || touchEnd === null) return;
			const distance = touchStart - touchEnd;
			const isLeftSwipe = distance > minSwipeDistance;
			const isRightSwipe = distance < -minSwipeDistance;
			if (isLeftSwipe) options.onLeftSwipe?.();
			if (isRightSwipe) options.onRightSwipe?.();
		};

		el.addEventListener('touchstart', onTouchStart, { passive: true });
		el.addEventListener('touchmove', onTouchMove, { passive: true });
		el.addEventListener('touchend', onTouchEnd, { passive: true });

		return () => {
			el.removeEventListener('touchstart', onTouchStart);
			el.removeEventListener('touchmove', onTouchMove);
			el.removeEventListener('touchend', onTouchEnd);
		};
	});
}
