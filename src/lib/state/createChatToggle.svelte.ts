import { setupChatToggle } from '@livekit/components-core';
import { getLayoutContext } from '../context/layout-context.svelte.js';

/** Reactive state and actions for a chat toggle button. */
export interface ChatToggleState {
	/** The core class name for the toggle button. */
	readonly className: string;
	/** `aria-pressed` value reflecting whether the chat is shown. */
	readonly ariaPressed: 'true' | 'false';
	/** The `data-lk-unread-msgs` value (unread count, capped at `9+`). */
	readonly unreadMsgs: string;
	/** Toggle the chat widget's visibility. */
	onclick: () => void;
}

/**
 * Provides state and actions for toggling the chat window. Depends on the
 * layout context to work, mirroring `@livekit/components-react`'s `useChatToggle`.
 */
export function createChatToggle(): ChatToggleState {
	const { widget } = getLayoutContext();
	const { className } = setupChatToggle();

	return {
		get className() {
			return className;
		},
		get ariaPressed() {
			return widget.state?.showChat ? 'true' : 'false';
		},
		get unreadMsgs() {
			const s = widget.state;
			return s ? (s.unreadMessages < 10 ? s.unreadMessages.toFixed(0) : '9+') : '0';
		},
		onclick: () => {
			widget.dispatch?.({ msg: 'toggle_chat' });
		}
	};
}
