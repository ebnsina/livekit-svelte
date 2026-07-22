// Reactivity primitives
export { observableState, toReadable, type ObservableState } from './reactivity/observableState.svelte.js';

// Contexts
export {
	setRoomContext,
	getRoomContext,
	getMaybeRoomContext,
	ensureRoom
} from './context/room-context.js';

// State factories (reactive helpers built on the core observables)
export { createLiveKitRoom, type LiveKitRoomState } from './state/createLiveKitRoom.svelte.js';

// Components
export { default as LiveKitRoom } from './components/LiveKitRoom.svelte';
export type { LiveKitRoomProps } from './components/LiveKitRoom.types.js';

// Re-exports from the framework-agnostic core
export { setLogLevel, setLogExtension, isTrackReference } from '@livekit/components-core';
export type {
	ChatMessage,
	ReceivedChatMessage,
	MessageDecoder,
	MessageEncoder,
	LocalUserChoices,
	TrackReference,
	TrackReferenceOrPlaceholder,
	ParticipantClickEvent,
	PinState,
	WidgetState
} from '@livekit/components-core';
