<script lang="ts" generics="T extends ToggleSource">
	import type { CaptureOptionsBySource, ToggleSource } from '@livekit/components-core';
	import type { Room, TrackPublishOptions } from 'livekit-client';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getSourceIcon } from '../icons/index.js';
	import { createTrackToggle } from '../state/createTrackToggle.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'onchange'> {
		source: T;
		/** Show the built-in source icon. Defaults to `true`. */
		showIcon?: boolean;
		initialState?: boolean;
		onChange?: (enabled: boolean, isUserInitiated: boolean) => void;
		captureOptions?: CaptureOptionsBySource<T>;
		publishOptions?: TrackPublishOptions;
		onDeviceError?: (error: Error) => void;
		room?: Room;
		children?: Snippet;
	}

	let {
		source,
		showIcon = true,
		initialState,
		onChange,
		captureOptions,
		publishOptions,
		onDeviceError,
		room,
		children,
		class: className,
		onclick,
		...rest
	}: Props = $props();

	const toggle = createTrackToggle<T>(() => ({
		source,
		initialState,
		onChange,
		captureOptions,
		publishOptions,
		onDeviceError,
		room
	}));

	// Toggle state depends on the browser room; render after mount to avoid SSR mismatch.
	let mounted = $state(false);
	$effect(() => {
		mounted = true;
	});

	function handleClick(evt: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(evt);
		toggle.onclick();
	}
</script>

{#if mounted}
	<button
		class={[toggle.className, className]}
		aria-pressed={toggle.enabled}
		data-lk-source={source}
		data-lk-enabled={toggle.enabled}
		disabled={toggle.pending}
		onclick={handleClick}
		{...rest}
	>
		{#if showIcon}
			{@const Icon = getSourceIcon(source, toggle.enabled)}
			<Icon />
		{/if}
		{@render children?.()}
	</button>
{/if}
