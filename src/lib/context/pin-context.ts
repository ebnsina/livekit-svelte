import type { PinState, TrackReferenceOrPlaceholder } from '@livekit/components-core';

/** Actions for the pin state. */
export type PinAction =
	| { msg: 'set_pin'; trackReference: TrackReferenceOrPlaceholder }
	| { msg: 'clear_pin' };

/** Pin slice of the layout context. */
export type PinContextType = {
	dispatch?: (action: PinAction) => void;
	state?: PinState;
};

/** Pure reducer for the pin state. */
export function pinReducer(state: PinState, action: PinAction): PinState {
	if (action.msg === 'set_pin') {
		return [action.trackReference];
	} else if (action.msg === 'clear_pin') {
		return [];
	}
	return [...state];
}
