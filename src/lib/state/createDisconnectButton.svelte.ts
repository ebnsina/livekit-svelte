import { setupDisconnectButton } from '@livekit/components-core';
import { ConnectionState } from 'livekit-client';
import { getRoomContext } from '../context/room-context.js';
import { createConnectionState } from './createConnectionState.svelte.js';

/** Options for {@link createDisconnectButton}. */
export interface CreateDisconnectButtonProps {
	/** Whether to stop local tracks on disconnect. Defaults to `true`. */
	stopTracks?: boolean;
}

/** Reactive button state for disconnecting from the room. */
export interface DisconnectButtonState {
	readonly className: string;
	readonly disabled: boolean;
	/** Disconnect from the room. */
	disconnect: () => void;
}

/**
 * Provides the state for a button that disconnects from the room: a class name, a
 * `disabled` flag (true once disconnected), and a `disconnect` action.
 */
export function createDisconnectButton(
	getProps: () => CreateDisconnectButtonProps = () => ({})
): DisconnectButtonState {
	const room = getRoomContext();
	const connectionState = createConnectionState(room);
	const { className, disconnect } = setupDisconnectButton(room);

	return {
		get className() {
			return className;
		},
		get disabled() {
			return connectionState.current === ConnectionState.Disconnected;
		},
		disconnect: () => disconnect(getProps().stopTracks ?? true)
	};
}
