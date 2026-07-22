/**
 * Voice-assistant agent state that drives the bar visualizer animation.
 * Mirrors the `AgentState` string union used by the React components.
 */
export type AgentState =
	| 'disconnected'
	| 'connecting'
	| 'initializing'
	| 'listening'
	| 'thinking'
	| 'speaking';

const generateConnectingSequenceBar = (columns: number): number[][] => {
	const seq = [];
	for (let x = 0; x < columns; x++) {
		seq.push([x, columns - 1 - x]);
	}
	return seq;
};

const generateListeningSequenceBar = (columns: number): number[][] => {
	const center = Math.floor(columns / 2);
	const noIndex = -1;
	return [[center], [noIndex]];
};

/** Reactive holder for the currently highlighted bar indices. */
export interface BarAnimatorState {
	readonly current: number[];
}

/**
 * Cycles through an animation sequence of highlighted bar indices based on the agent state.
 *
 * Port of `useBarAnimator`. Uses the same connecting/listening sequence generators as React and
 * drives the frame advance with `requestAnimationFrame` inside an `$effect` (browser only).
 *
 * @param getState - accessor for the current agent state (or `undefined`).
 * @param columns - number of bars.
 * @param getInterval - accessor for the per-frame interval in ms.
 */
export function createBarAnimator(
	getState: () => AgentState | undefined,
	columns: number,
	getInterval: () => number
): BarAnimatorState {
	let index = $state(0);
	let sequence = $state<number[][]>([[]]);

	// Rebuild the sequence whenever the state (or column count) changes.
	$effect(() => {
		const state = getState();
		if (state === 'thinking') {
			sequence = generateListeningSequenceBar(columns);
		} else if (state === 'connecting' || state === 'initializing') {
			sequence = [...generateConnectingSequenceBar(columns)];
		} else if (state === 'listening') {
			sequence = generateListeningSequenceBar(columns);
		} else if (state === undefined || state === 'speaking') {
			sequence = [new Array(columns).fill(0).map((_, idx) => idx)];
		} else {
			sequence = [[]];
		}
		index = 0;
	});

	// Advance the frame index on an interval driven by requestAnimationFrame.
	$effect(() => {
		const interval = getInterval();
		// Re-subscribe when the sequence length or state changes.
		void sequence.length;
		void getState();

		let startTime = performance.now();
		let frameId: number;

		const animate = (time: number) => {
			const timeElapsed = time - startTime;
			if (timeElapsed >= interval) {
				index = index + 1;
				startTime = time;
			}
			frameId = requestAnimationFrame(animate);
		};

		frameId = requestAnimationFrame(animate);

		return () => cancelAnimationFrame(frameId);
	});

	return {
		get current() {
			return sequence[index % sequence.length];
		}
	};
}
