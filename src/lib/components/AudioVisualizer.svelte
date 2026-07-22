<script lang="ts">
	import type { TrackReference } from '@livekit/components-core';
	import type { SVGAttributes } from 'svelte/elements';
	import { ensureTrackRef } from '../context/track-reference-context.js';
	import { createMultibandTrackVolume } from '../state/createTrackVolume.svelte.js';

	interface Props extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
		/** The track reference to visualize; falls back to the track reference context. */
		trackRef?: TrackReference;
	}

	let { trackRef, class: className, ...rest }: Props = $props();

	const svgWidth = 200;
	const svgHeight = 90;
	const barWidth = 6;
	const barSpacing = 4;
	const volMultiplier = 50;
	const barCount = 7;

	// Track reference is resolved once at init (context lookup is init-only).
	// svelte-ignore state_referenced_locally
	const tr = ensureTrackRef(trackRef);

	const volumes = createMultibandTrackVolume(
		() => tr,
		() => ({ bands: 7, loPass: 300 })
	);

	const groupTransform = `translate(${(svgWidth - barCount * (barWidth + barSpacing)) / 2}px, 0)`;
</script>

<svg
	width="100%"
	height="100%"
	viewBox="0 0 {svgWidth} {svgHeight}"
	{...rest}
	class={['lk-audio-visualizer', className]}
>
	<rect x="0" y="0" width="100%" height="100%" />
	<g style="transform: {groupTransform};">
		{#each volumes.current as vol, idx (idx)}
			<rect
				x={idx * (barWidth + barSpacing)}
				y={svgHeight / 2 - (vol * volMultiplier) / 2}
				width={barWidth}
				height={vol * volMultiplier}
			></rect>
		{/each}
	</g>
</svg>
