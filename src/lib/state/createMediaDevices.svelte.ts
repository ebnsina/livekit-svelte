import { createMediaDeviceObserver } from '@livekit/components-core';
import { observableState, type ObservableState } from '../reactivity/observableState.svelte.js';

/** Options for {@link createMediaDevices}. */
export interface CreateMediaDevicesProps {
	kind: MediaDeviceKind;
	onError?: (e: Error) => void;
	requestPermissions?: boolean;
}

/**
 * Reactively returns the list of media devices of a given kind
 * (`audioinput` | `audiooutput` | `videoinput`).
 */
export function createMediaDevices(
	props: CreateMediaDevicesProps
): ObservableState<MediaDeviceInfo[]> {
	return observableState(
		createMediaDeviceObserver(props.kind, props.onError, props.requestPermissions),
		[] as MediaDeviceInfo[]
	);
}
