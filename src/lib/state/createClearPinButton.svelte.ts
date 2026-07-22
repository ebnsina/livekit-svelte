import { setupClearPinButton } from '@livekit/components-core';
import { getLayoutContext } from '../context/layout-context.svelte.js';

/** Reactive state for a button that clears the focused (pinned) track. */
export interface ClearPinButtonState {
	readonly className: string;
	readonly disabled: boolean;
	/** Clear the pin, returning to grid view. */
	clear: () => void;
}

/**
 * Provides the state for a button that clears the layout context's pin.
 * Must be used within a layout context.
 */
export function createClearPinButton(): ClearPinButtonState {
	const pin = getLayoutContext().pin;
	const { className } = setupClearPinButton();

	return {
		className,
		get disabled() {
			return !pin.state?.length;
		},
		clear: () => pin.dispatch?.({ msg: 'clear_pin' })
	};
}
