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
export {
	createTrackToggle,
	type CreateTrackToggleProps,
	type TrackToggleState
} from './state/createTrackToggle.svelte.js';
export {
	createMediaDevices,
	type CreateMediaDevicesProps
} from './state/createMediaDevices.svelte.js';
export {
	createMediaDeviceSelect,
	type CreateMediaDeviceSelectProps,
	type MediaDeviceSelectState
} from './state/createMediaDeviceSelect.svelte.js';
export {
	createLocalParticipant,
	type LocalParticipantState
} from './state/createLocalParticipant.svelte.js';
export {
	createRemoteParticipants,
	type CreateRemoteParticipantsOptions
} from './state/createRemoteParticipants.svelte.js';
export {
	createParticipants,
	type CreateParticipantsOptions
} from './state/createParticipants.svelte.js';
export {
	createParticipantPermissions,
	type ParticipantPermissions
} from './state/createParticipantPermissions.svelte.js';
export { createLocalParticipantPermissions } from './state/createLocalParticipantPermissions.svelte.js';
export {
	createTrackMutedIndicator,
	type TrackMutedIndicatorState
} from './state/createTrackMutedIndicator.svelte.js';
export {
	createConnectionQualityIndicator,
	type ConnectionQualityIndicatorState
} from './state/createConnectionQualityIndicator.svelte.js';
export { createIsMuted } from './state/createIsMuted.svelte.js';
export { createIsSpeaking } from './state/createIsSpeaking.svelte.js';
export { facingMode, type FacingMode } from './state/facingMode.js';
export {
	createParticipantTile,
	type CreateParticipantTileOptions,
	type ParticipantTileState
} from './state/createParticipantTile.svelte.js';

// Components
export { default as LiveKitRoom } from './components/LiveKitRoom.svelte';
export type { LiveKitRoomProps } from './components/LiveKitRoom.types.js';
export { default as ConnectionState } from './components/ConnectionState.svelte';
export { default as RoomName } from './components/RoomName.svelte';
export { default as ParticipantName } from './components/ParticipantName.svelte';
export { default as TrackMutedIndicator } from './components/TrackMutedIndicator.svelte';
export { default as ConnectionQualityIndicator } from './components/ConnectionQualityIndicator.svelte';
export { default as ParticipantTile } from './components/ParticipantTile.svelte';
export { default as ParticipantContextIfNeeded } from './components/ParticipantContextIfNeeded.svelte';
export { default as TrackRefContextIfNeeded } from './components/TrackRefContextIfNeeded.svelte';
export { default as VideoTrack } from './components/VideoTrack.svelte';
export { default as AudioTrack } from './components/AudioTrack.svelte';
export { default as RoomAudioRenderer } from './components/RoomAudioRenderer.svelte';
export { default as DisconnectButton } from './components/DisconnectButton.svelte';
export { default as TrackToggle } from './components/TrackToggle.svelte';
export { default as MediaDeviceSelect } from './components/MediaDeviceSelect.svelte';
export { default as MediaDeviceMenu } from './components/MediaDeviceMenu.svelte';

// Icons
export { icons, getSourceIcon } from './icons/index.js';
export { default as TrackLoop } from './components/TrackLoop.svelte';
export { default as TrackRefContextProvider } from './components/TrackRefContextProvider.svelte';
export { default as ParticipantLoop } from './components/ParticipantLoop.svelte';
export { default as ParticipantContextProvider } from './components/ParticipantContextProvider.svelte';

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
