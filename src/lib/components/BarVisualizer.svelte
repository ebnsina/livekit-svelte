<script lang="ts">
	import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
	import type { LocalAudioTrack, RemoteAudioTrack } from 'livekit-client';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getMaybeTrackRefContext } from '../context/track-reference-context.js';
	import { createBarAnimator, type AgentState } from '../state/createBarAnimator.svelte.js';
	import { createMultibandTrackVolume } from '../state/createTrackVolume.svelte.js';

	/** Bar sizing options (percentages). */
	interface BarVisualizerOptions {
		/** In percentage. */
		maxHeight?: number;
		/** In percentage. */
		minHeight?: number;
	}

	/** Per-bar props passed to a custom bar template snippet. */
	interface BarSnippetProps {
		highlighted: boolean;
		index: number;
		/** `height: …%` CSS value to apply to the bar. */
		style: string;
	}

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** If set, the visualizer transitions between voice-assistant states. */
		state?: AgentState;
		/** Number of bars that show up in the visualizer. */
		barCount?: number;
		/** @deprecated use `track` instead */
		trackRef?: TrackReferenceOrPlaceholder;
		track?: TrackReferenceOrPlaceholder | LocalAudioTrack | RemoteAudioTrack;
		options?: BarVisualizerOptions;
		/** Custom bar template, rendered once per bar. */
		children?: Snippet<[BarSnippetProps]>;
	}

	let {
		state,
		barCount = 15,
		trackRef,
		track,
		options,
		children,
		class: className,
		...rest
	}: Props = $props();

	const sequencerIntervals = new Map<AgentState, number>([
		['connecting', 2000],
		['initializing', 2000],
		['listening', 500],
		['thinking', 150]
	]);

	function getSequencerInterval(agentState: AgentState | undefined, bars: number): number | undefined {
		if (agentState === undefined) {
			return 1000;
		}
		let interval = sequencerIntervals.get(agentState);
		if (interval) {
			switch (agentState) {
				case 'connecting':
					interval /= bars;
					break;
				default:
					break;
			}
		}
		return interval;
	}

	// Track can come from props or the surrounding track-reference context (init-only lookup).
	// svelte-ignore state_referenced_locally
	const contextTrack = getMaybeTrackRefContext();
	const getTrack = () => trackRef ?? track ?? contextTrack;

	const volumeBands = createMultibandTrackVolume(getTrack, () => ({
		bands: barCount,
		loPass: 100,
		hiPass: 200
	}));

	// svelte-ignore state_referenced_locally
	const columns = barCount;
	const highlightedIndices = createBarAnimator(
		() => state,
		columns,
		() => getSequencerInterval(state, barCount) ?? 100
	);

	const minHeight = $derived(options?.minHeight ?? 20);
	const maxHeight = $derived(options?.maxHeight ?? 100);

	function barHeight(volume: number): number {
		return Math.min(maxHeight, Math.max(minHeight, volume * 100 + 5));
	}
</script>

<div class={['lk-audio-bar-visualizer', className]} data-lk-va-state={state} {...rest}>
	{#each volumeBands.current as volume, idx (idx)}
		{@const highlighted = highlightedIndices.current.includes(idx)}
		{#if children}
			{@render children({ highlighted, index: idx, style: `height: ${barHeight(volume)}%;` })}
		{:else}
			<span
				data-lk-highlighted={highlighted}
				data-lk-bar-index={idx}
				class={['lk-audio-bar', highlighted && 'lk-highlighted']}
				style="height: {barHeight(volume)}%;"
			></span>
		{/if}
	{/each}
</div>
