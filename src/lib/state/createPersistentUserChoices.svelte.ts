import { loadUserChoices, saveUserChoices, type LocalUserChoices } from '@livekit/components-core';

/** Options for {@link createPersistentUserChoices}. */
export interface CreatePersistentUserChoicesOptions {
	/** Defaults to use if local storage is empty or fails. */
	defaults?: Partial<LocalUserChoices>;
	/** Prevent saving to persistent storage. Defaults to `false`. */
	preventSave?: boolean;
	/** Prevent loading from persistent storage (use `defaults`). Defaults to `false`. */
	preventLoad?: boolean;
}

/** Reactive persisted user choices plus setters. */
export interface PersistentUserChoicesState {
	readonly userChoices: LocalUserChoices;
	saveAudioInputEnabled: (isEnabled: boolean) => void;
	saveVideoInputEnabled: (isEnabled: boolean) => void;
	saveAudioInputDeviceId: (deviceId: string) => void;
	saveVideoInputDeviceId: (deviceId: string) => void;
	saveUsername: (username: string) => void;
}

/**
 * Persists user choices (selected devices, their on/off state, and username) to
 * local storage and exposes them reactively.
 */
export function createPersistentUserChoices(
	options: CreatePersistentUserChoicesOptions = {}
): PersistentUserChoicesState {
	let userChoices = $state<LocalUserChoices>(
		loadUserChoices(options.defaults, options.preventLoad ?? false)
	);

	// Persist whenever the choices change (browser only; saveUserChoices is a no-op on the server).
	$effect(() => {
		saveUserChoices(userChoices, options.preventSave ?? false);
	});

	return {
		get userChoices() {
			return userChoices;
		},
		saveAudioInputEnabled: (isEnabled) => (userChoices = { ...userChoices, audioEnabled: isEnabled }),
		saveVideoInputEnabled: (isEnabled) => (userChoices = { ...userChoices, videoEnabled: isEnabled }),
		saveAudioInputDeviceId: (deviceId) => (userChoices = { ...userChoices, audioDeviceId: deviceId }),
		saveVideoInputDeviceId: (deviceId) => (userChoices = { ...userChoices, videoDeviceId: deviceId }),
		saveUsername: (username) => (userChoices = { ...userChoices, username })
	};
}
