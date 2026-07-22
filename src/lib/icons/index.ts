import type { Component } from 'svelte';
import { ConnectionQuality, Track } from 'livekit-client';
import Mic from '@lucide/svelte/icons/mic';
import MicOff from '@lucide/svelte/icons/mic-off';
import Video from '@lucide/svelte/icons/video';
import VideoOff from '@lucide/svelte/icons/video-off';
import ScreenShare from '@lucide/svelte/icons/screen-share';
import ScreenShareOff from '@lucide/svelte/icons/screen-share-off';
import PhoneOff from '@lucide/svelte/icons/phone-off';
import MessageSquare from '@lucide/svelte/icons/message-square';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Maximize from '@lucide/svelte/icons/maximize';
import Minimize from '@lucide/svelte/icons/minimize';
import SignalHigh from '@lucide/svelte/icons/signal-high';
import SignalMedium from '@lucide/svelte/icons/signal-medium';
import SignalLow from '@lucide/svelte/icons/signal-low';
import WifiOff from '@lucide/svelte/icons/wifi-off';
import Signal from '@lucide/svelte/icons/signal';

/**
 * Centralized icon set (backed by `@lucide/svelte`). Import icons from here so the
 * icon library can be swapped in one place.
 */
export const icons = {
	Mic,
	MicOff,
	Video,
	VideoOff,
	ScreenShare,
	ScreenShareOff,
	PhoneOff,
	MessageSquare,
	ChevronDown,
	Maximize,
	Minimize,
	SignalHigh,
	SignalMedium,
	SignalLow,
	WifiOff,
	Signal
} as const;

/** Returns the icon component representing a participant's connection quality. */
export function getConnectionQualityIcon(quality: ConnectionQuality): Component {
	switch (quality) {
		case ConnectionQuality.Excellent:
			return SignalHigh;
		case ConnectionQuality.Good:
			return SignalMedium;
		case ConnectionQuality.Poor:
			return SignalLow;
		case ConnectionQuality.Lost:
			return WifiOff;
		default:
			return Signal;
	}
}

/** Returns the icon component for a track source given its enabled state. */
export function getSourceIcon(source: Track.Source, enabled: boolean): Component {
	switch (source) {
		case Track.Source.Microphone:
			return enabled ? Mic : MicOff;
		case Track.Source.Camera:
			return enabled ? Video : VideoOff;
		case Track.Source.ScreenShare:
			// When sharing, the button stops the share; otherwise it starts one.
			return enabled ? ScreenShareOff : ScreenShare;
		default:
			return enabled ? Mic : MicOff;
	}
}
