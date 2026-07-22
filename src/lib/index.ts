// Reactivity primitives
export { observableState, toReadable, type ObservableState } from './reactivity/observableState.svelte.js';

// Contexts
export {
	setRoomContext,
	getRoomContext,
	getMaybeRoomContext,
	ensureRoom
} from './context/room-context.js';
export {
	setParticipantContext,
	getParticipantContext,
	getMaybeParticipantContext,
	ensureParticipant
} from './context/participant-context.js';
export {
	setTrackRefContext,
	getTrackRefContext,
	getMaybeTrackRefContext,
	ensureTrackRef
} from './context/track-reference-context.js';

// State factories (reactive helpers built on the core observables)
export { createLiveKitRoom, type LiveKitRoomState } from './state/createLiveKitRoom.svelte.js';
export { createConnectionState } from './state/createConnectionState.svelte.js';
export { createRoomInfo, type RoomInfo } from './state/createRoomInfo.svelte.js';
export { createParticipantInfo, type ParticipantInfo } from './state/createParticipantInfo.svelte.js';
export {
	createTracks,
	type CreateTracksOptions,
	type CreateTracksReturnType
} from './state/createTracks.svelte.js';
export { createMediaTrack, type MediaTrackState } from './state/createMediaTrack.svelte.js';
export {
	createDisconnectButton,
	type CreateDisconnectButtonProps,
	type DisconnectButtonState
} from './state/createDisconnectButton.svelte.js';

// Components
export { default as LiveKitRoom } from './components/LiveKitRoom.svelte';
export type { LiveKitRoomProps } from './components/LiveKitRoom.types.js';
export { default as ConnectionState } from './components/ConnectionState.svelte';
export { default as RoomName } from './components/RoomName.svelte';
export { default as ParticipantName } from './components/ParticipantName.svelte';
export { default as VideoTrack } from './components/VideoTrack.svelte';
export { default as AudioTrack } from './components/AudioTrack.svelte';
export { default as RoomAudioRenderer } from './components/RoomAudioRenderer.svelte';
export { default as DisconnectButton } from './components/DisconnectButton.svelte';
export { default as TrackLoop } from './components/TrackLoop.svelte';
export { default as TrackRefContextProvider } from './components/TrackRefContextProvider.svelte';

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
