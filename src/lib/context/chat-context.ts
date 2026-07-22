import type { WidgetState } from '@livekit/components-core';

/** Actions for the widget (chat/settings) state. */
export type ChatContextAction =
	| { msg: 'show_chat' }
	| { msg: 'hide_chat' }
	| { msg: 'toggle_chat' }
	| { msg: 'unread_msg'; count: number }
	| { msg: 'toggle_settings' };

/** Widget slice of the layout context. */
export type WidgetContextType = {
	dispatch?: (action: ChatContextAction) => void;
	state?: WidgetState;
};

/** Pure reducer for the widget state. */
export function chatReducer(state: WidgetState, action: ChatContextAction): WidgetState {
	if (action.msg === 'show_chat') {
		return { ...state, showChat: true, unreadMessages: 0 };
	} else if (action.msg === 'hide_chat') {
		return { ...state, showChat: false };
	} else if (action.msg === 'toggle_chat') {
		const newState = { ...state, showChat: !state.showChat };
		if (newState.showChat === true) {
			newState.unreadMessages = 0;
		}
		return newState;
	} else if (action.msg === 'unread_msg') {
		return { ...state, unreadMessages: action.count };
	} else if (action.msg === 'toggle_settings') {
		return { ...state, showSettings: !state.showSettings };
	}
	return { ...state };
}
