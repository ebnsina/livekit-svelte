import { PIN_DEFAULT_STATE, WIDGET_DEFAULT_STATE, type PinState, type WidgetState } from '@livekit/components-core';
import { getContext, setContext } from 'svelte';
import { chatReducer, type ChatContextAction, type WidgetContextType } from './chat-context.js';
import { pinReducer, type PinAction, type PinContextType } from './pin-context.js';

/** The layout context: pin (focused track) and widget (chat/settings) state. */
export type LayoutContextType = {
	pin: PinContextType;
	widget: WidgetContextType;
};

const LAYOUT_CONTEXT_KEY = Symbol('lk-layout');

/**
 * Creates a reactive layout context with runes-backed pin and widget state plus
 * reducer-style `dispatch` functions. Call during component init.
 */
export function createLayoutContext(): LayoutContextType {
	let pinState = $state<PinState>(PIN_DEFAULT_STATE);
	let widgetState = $state<WidgetState>(WIDGET_DEFAULT_STATE);

	return {
		pin: {
			get state() {
				return pinState;
			},
			dispatch: (action: PinAction) => {
				pinState = pinReducer(pinState, action);
			}
		},
		widget: {
			get state() {
				return widgetState;
			},
			dispatch: (action: ChatContextAction) => {
				widgetState = chatReducer(widgetState, action);
			}
		}
	};
}

/** Provide a layout context to descendants. Call during init. */
export function setLayoutContext(context: LayoutContextType): LayoutContextType {
	setContext(LAYOUT_CONTEXT_KEY, context);
	return context;
}

/** Get the layout context, or `undefined` if none was provided. */
export function getMaybeLayoutContext(): LayoutContextType | undefined {
	return getContext<LayoutContextType | undefined>(LAYOUT_CONTEXT_KEY);
}

/** Get the layout context, throwing if it is missing. */
export function getLayoutContext(): LayoutContextType {
	const ctx = getMaybeLayoutContext();
	if (!ctx) {
		throw new Error(
			'[livekit-svelte] tried to access layout context outside of a <LayoutContextProvider>'
		);
	}
	return ctx;
}

/** Resolve a layout context from an explicit argument or from context. */
export function ensureLayoutContext(context?: LayoutContextType): LayoutContextType {
	const ctx = context ?? getMaybeLayoutContext();
	if (!ctx) {
		throw new Error(
			'[livekit-svelte] no layout context — render inside a <LayoutContextProvider> or pass one explicitly'
		);
	}
	return ctx;
}
