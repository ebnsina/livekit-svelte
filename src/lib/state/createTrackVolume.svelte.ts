import {
	isTrackReference,
	type TrackReference,
	type TrackReferenceOrPlaceholder
} from '@livekit/components-core';
import {
	Track,
	createAudioAnalyser,
	type AudioAnalyserOptions,
	type LocalAudioTrack,
	type RemoteAudioTrack
} from 'livekit-client';

/** Reactive scalar holder returned by {@link createTrackVolume}. */
export interface TrackVolumeState {
	readonly current: number;
}

/**
 * Reactively tracks the overall volume (RMS, 0–1) of an audio track using the Web Audio API.
 *
 * Port of `useTrackVolume`. Wires `createAudioAnalyser` (from livekit-client) to a rune, polling
 * the frequency data on an interval and cleaning up on teardown.
 *
 * @param getTrack - accessor for the audio track (or a {@link TrackReference}); may be `undefined`.
 * @param options - analyser options (fft size / smoothing).
 */
export function createTrackVolume(
	getTrack: () => LocalAudioTrack | RemoteAudioTrack | TrackReference | undefined,
	options: AudioAnalyserOptions = { fftSize: 32, smoothingTimeConstant: 0 }
): TrackVolumeState {
	let volume = $state(0);

	$effect(() => {
		const source = getTrack();
		const track = isTrackReference(source)
			? (source.publication.track as LocalAudioTrack | RemoteAudioTrack | undefined)
			: source;
		if (!track || !track.mediaStream) return;

		const { cleanup, analyser } = createAudioAnalyser(track, options);

		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);

		const updateVolume = () => {
			analyser.getByteFrequencyData(dataArray);
			let sum = 0;
			for (let i = 0; i < dataArray.length; i++) {
				const a = dataArray[i];
				sum += a * a;
			}
			volume = Math.sqrt(sum / dataArray.length) / 255;
		};

		const interval = setInterval(updateVolume, 1000 / 30);

		return () => {
			cleanup();
			clearInterval(interval);
		};
	});

	return {
		get current() {
			return volume;
		}
	};
}

const normalizeFrequencies = (frequencies: Float32Array) => {
	const normalizeDb = (value: number) => {
		const minDb = -100;
		const maxDb = -10;
		let db = 1 - (Math.max(minDb, Math.min(maxDb, value)) * -1) / 100;
		db = Math.sqrt(db);
		return db;
	};

	// Normalize all frequency values.
	return frequencies.map((value) => {
		if (value === -Infinity) {
			return 0;
		}
		return normalizeDb(value);
	});
};

/** Options for {@link createMultibandTrackVolume}. */
export interface MultiBandTrackVolumeOptions {
	bands?: number;
	/**
	 * Cut off of frequency bins on the lower end.
	 * Note: this is not a frequency measure, but in relation to `analyserOptions.fftSize`.
	 */
	loPass?: number;
	/**
	 * Cut off of frequency bins on the higher end.
	 * Note: this is not a frequency measure, but in relation to `analyserOptions.fftSize`.
	 */
	hiPass?: number;
	/** Update should run every x ms. */
	updateInterval?: number;
	analyserOptions?: AnalyserOptions;
}

const multibandDefaults = {
	bands: 5,
	loPass: 100,
	hiPass: 600,
	updateInterval: 32,
	analyserOptions: { fftSize: 2048 }
} as const satisfies MultiBandTrackVolumeOptions;

/** Reactive array holder returned by {@link createMultibandTrackVolume}. */
export interface MultibandTrackVolumeState {
	readonly current: number[];
}

/**
 * Reactively tracks the volume of an audio track across multiple frequency bands.
 *
 * Port of `useMultibandTrackVolume`. Reuses `createAudioAnalyser` (from livekit-client) and
 * the same band-chunking maths as the React hook.
 *
 * @param getTrack - accessor for the audio track (or a track reference / placeholder).
 * @param getOptions - accessor for the band options (reactive, so `barCount` can change).
 */
export function createMultibandTrackVolume(
	getTrack: () =>
		| LocalAudioTrack
		| RemoteAudioTrack
		| TrackReferenceOrPlaceholder
		| undefined,
	getOptions: () => MultiBandTrackVolumeOptions = () => ({})
): MultibandTrackVolumeState {
	// svelte-ignore state_referenced_locally
	const initialBands = { ...multibandDefaults, ...getOptions() }.bands;
	let frequencyBands = $state<number[]>(new Array(initialBands).fill(0));

	$effect(() => {
		const opts = { ...multibandDefaults, ...getOptions() };
		const source = getTrack();
		const track =
			source instanceof Track
				? source
				: (source?.publication?.track as LocalAudioTrack | RemoteAudioTrack | undefined);

		if (!track || !track.mediaStream) {
			frequencyBands = new Array(opts.bands).fill(0);
			return;
		}

		const { analyser, cleanup } = createAudioAnalyser(track, opts.analyserOptions);

		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Float32Array(bufferLength);

		const updateVolume = () => {
			analyser.getFloatFrequencyData(dataArray);
			let frequencies: Float32Array = new Float32Array(dataArray.length);
			for (let i = 0; i < dataArray.length; i++) {
				frequencies[i] = dataArray[i];
			}
			frequencies = frequencies.slice(opts.loPass, opts.hiPass);

			const normalizedFrequencies = normalizeFrequencies(frequencies);
			const totalBins = normalizedFrequencies.length;
			const chunks: Array<number> = [];
			for (let i = 0; i < opts.bands; i++) {
				// Use proportional distribution to evenly divide bins across bands.
				const startIndex = Math.floor((i * totalBins) / opts.bands);
				const endIndex = Math.floor(((i + 1) * totalBins) / opts.bands);
				const chunk = normalizedFrequencies.slice(startIndex, endIndex);
				const chunkLength = chunk.length;
				if (chunkLength === 0) {
					chunks.push(0);
				} else {
					const summedVolumes = chunk.reduce((acc, val) => (acc += val), 0);
					chunks.push(summedVolumes / chunkLength);
				}
			}

			frequencyBands = chunks;
		};

		const interval = setInterval(updateVolume, opts.updateInterval);

		return () => {
			cleanup();
			clearInterval(interval);
		};
	});

	return {
		get current() {
			return frequencyBands;
		}
	};
}
