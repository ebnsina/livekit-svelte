import { log } from '@livekit/components-core';
import {
	createLocalTracks,
	Mutex,
	type CreateLocalTracksOptions,
	type LocalAudioTrack,
	type LocalVideoTrack
} from 'livekit-client';

/** Return type of {@link createPreviewTracks}: a reactive holder of the preview tracks. */
export interface PreviewTracksState {
	readonly current: Array<LocalAudioTrack | LocalVideoTrack> | undefined;
}

/**
 * Reactively creates local preview tracks (camera / microphone) for the requested
 * options, without connecting to a room. Tracks are re-created whenever the options
 * change and are stopped on cleanup. Browser only (runs inside an `$effect`).
 *
 * This is the Svelte port of the React `usePreviewTracks` hook.
 *
 * @param optionsFn - reactive getter for the {@link CreateLocalTracksOptions}.
 * @param onError - optional callback invoked when track creation fails.
 */
export function createPreviewTracks(
	optionsFn: () => CreateLocalTracksOptions,
	onError?: (err: Error) => void
): PreviewTracksState {
	let tracks = $state<Array<LocalAudioTrack | LocalVideoTrack> | undefined>();

	const trackLock = new Mutex();

	$effect(() => {
		const options = optionsFn();
		// Track granular reactive deps (device ids / enabled flags) so the effect re-runs.
		void JSON.stringify(options);

		let needsCleanup = false;
		let localTracks: Array<LocalAudioTrack | LocalVideoTrack> = [];

		trackLock.lock().then(async (unlock) => {
			try {
				if (options.audio || options.video) {
					localTracks = (await createLocalTracks(options)) as Array<
						LocalAudioTrack | LocalVideoTrack
					>;

					if (needsCleanup) {
						localTracks.forEach((tr) => tr.stop());
					} else {
						tracks = localTracks;
					}
				}
			} catch (e: unknown) {
				if (onError && e instanceof Error) {
					onError(e);
				} else {
					log.error(e);
				}
			} finally {
				unlock();
			}
		});

		return () => {
			needsCleanup = true;
			localTracks.forEach((track) => track.stop());
		};
	});

	return {
		get current() {
			return tracks;
		}
	};
}
