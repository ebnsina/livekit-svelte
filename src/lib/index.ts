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
export {
	createLayoutContext,
	setLayoutContext,
	getLayoutContext,
	getMaybeLayoutContext,
	ensureLayoutContext,
	type LayoutContextType
} from './context/layout-context.svelte.js';
export { pinReducer, type PinAction, type PinContextType } from './context/pin-context.js';
export {
	chatReducer,
	type ChatContextAction,
	type WidgetContextType
} from './context/chat-context.js';
export { setFeatureContext, getFeatureContext, type FeatureFlags } from './context/feature-context.js';

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
export { createFocusToggle, type FocusToggleState } from './state/createFocusToggle.svelte.js';
export { createClearPinButton, type ClearPinButtonState } from './state/createClearPinButton.svelte.js';
export {
	createPersistentUserChoices,
	type CreatePersistentUserChoicesOptions,
	type PersistentUserChoicesState
} from './state/createPersistentUserChoices.svelte.js';
export { createSettingsToggle, type SettingsToggleState } from './state/createSettingsToggle.svelte.js';
export { createMediaQuery } from './state/createMediaQuery.svelte.js';
// Participant / track data factories
export {
	createRemoteParticipant,
	type CreateRemoteParticipantOptions
} from './state/createRemoteParticipant.svelte.js';
export {
	createSpeakingParticipants,
	type CreateSpeakingParticipantsOptions
} from './state/createSpeakingParticipants.svelte.js';
export { createSortedParticipants } from './state/createSortedParticipants.svelte.js';
export {
	createParticipantTracks,
	type CreateParticipantTracksOptions
} from './state/createParticipantTracks.svelte.js';
export { createTrackByName } from './state/createTrackByName.svelte.js';
export {
	createParticipantAttributes,
	createParticipantAttribute,
	type CreateParticipantAttributesOptions,
	type ParticipantAttributes
} from './state/createParticipantAttributes.svelte.js';
export { createIsEncrypted, type CreateIsEncryptedOptions } from './state/createIsEncrypted.svelte.js';
export { createIsRecording } from './state/createIsRecording.svelte.js';
export { createToken, type UserInfo, type CreateTokenOptions } from './state/createToken.svelte.js';
export { createDataChannel, type DataChannelState } from './state/createDataChannel.svelte.js';
// Layout factories
export { createPagination, type PaginationState } from './state/createPagination.svelte.js';
export {
	createVisualStableUpdate,
	type VisualStableUpdateState,
	type VisualStableUpdateOptions
} from './state/createVisualStableUpdate.svelte.js';
export {
	createGridLayout,
	type GridLayoutState,
	type CreateGridLayoutOptions
} from './state/createGridLayout.svelte.js';
export { createPinnedTracks, type PinnedTracksState } from './state/createPinnedTracks.svelte.js';
export { createSwipe, type SwipeOptions } from './state/createSwipe.svelte.js';
// Audio / visualizer factories
export {
	createTrackVolume,
	createMultibandTrackVolume,
	type TrackVolumeState,
	type MultibandTrackVolumeState,
	type MultiBandTrackVolumeOptions
} from './state/createTrackVolume.svelte.js';
export { createAudioPlayback, type AudioPlaybackState } from './state/createAudioPlayback.svelte.js';
export {
	createStartAudio,
	type CreateStartAudioProps,
	type StartAudioState
} from './state/createStartAudio.svelte.js';
export {
	createStartVideo,
	type CreateStartVideoProps,
	type StartVideoState
} from './state/createStartVideo.svelte.js';
export {
	createBarAnimator,
	type BarAnimatorState,
	type AgentState
} from './state/createBarAnimator.svelte.js';
// Chat factories
export { createChat, type CreateChatOptions, type ChatState } from './state/createChat.svelte.js';
export { createChatToggle, type ChatToggleState } from './state/createChatToggle.svelte.js';

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
export { default as LayoutContextProvider } from './components/LayoutContextProvider.svelte';
export { default as VideoTrack } from './components/VideoTrack.svelte';
export { default as AudioTrack } from './components/AudioTrack.svelte';
export { default as RoomAudioRenderer } from './components/RoomAudioRenderer.svelte';
export { default as DisconnectButton } from './components/DisconnectButton.svelte';
export { default as TrackToggle } from './components/TrackToggle.svelte';
export { default as MediaDeviceSelect } from './components/MediaDeviceSelect.svelte';
export { default as MediaDeviceMenu } from './components/MediaDeviceMenu.svelte';
export { default as FocusToggle } from './components/FocusToggle.svelte';
export { default as ClearPinButton } from './components/ClearPinButton.svelte';
export { default as SettingsMenuToggle } from './components/SettingsMenuToggle.svelte';
export { default as StartAudio } from './components/StartAudio.svelte';
export { default as StartMediaButton } from './components/StartMediaButton.svelte';
export { default as ChatToggle } from './components/ChatToggle.svelte';
export { default as TrackLoop } from './components/TrackLoop.svelte';
export { default as TrackRefContextProvider } from './components/TrackRefContextProvider.svelte';
export { default as ParticipantLoop } from './components/ParticipantLoop.svelte';
export { default as ParticipantContextProvider } from './components/ParticipantContextProvider.svelte';
// Layout components
export { default as GridLayout } from './components/GridLayout.svelte';
export { default as FocusLayout } from './components/FocusLayout.svelte';
export { default as FocusLayoutContainer } from './components/FocusLayoutContainer.svelte';
export { default as CarouselLayout } from './components/CarouselLayout.svelte';
// Visualizers / audio tiles
export { default as AudioVisualizer } from './components/AudioVisualizer.svelte';
export { default as BarVisualizer } from './components/BarVisualizer.svelte';
export { default as ParticipantAudioTile } from './components/ParticipantAudioTile.svelte';
// Chat / toasts
export {
	default as ChatEntry,
	formatChatMessageLinks,
	type MessageFormatter
} from './components/ChatEntry.svelte';
export { default as Toast } from './components/Toast.svelte';
export { default as ConnectionStateToast } from './components/ConnectionStateToast.svelte';

// Prefabs
export { default as Chat } from './prefabs/Chat.svelte';
export { default as ControlBar, type ControlBarControls } from './prefabs/ControlBar.svelte';

// Icons
export { icons, getSourceIcon } from './icons/index.js';

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
