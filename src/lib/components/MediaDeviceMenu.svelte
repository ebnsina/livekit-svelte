<script lang="ts">
	import { computeMenuPosition, log, wasClickOutside } from '@livekit/components-core';
	import type { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { icons } from '../icons/index.js';
	import MediaDeviceSelect from './MediaDeviceSelect.svelte';

	interface Props extends HTMLButtonAttributes {
		/** Restrict the menu to a single device kind. Omit to show audio + video inputs. */
		kind?: MediaDeviceKind;
		initialSelection?: string;
		onActiveDeviceChange?: (kind: MediaDeviceKind, deviceId: string) => void;
		tracks?: Partial<Record<MediaDeviceKind, LocalAudioTrack | LocalVideoTrack | undefined>>;
		requestPermissions?: boolean;
		children?: Snippet;
	}

	let {
		kind,
		initialSelection,
		onActiveDeviceChange,
		tracks,
		requestPermissions = false,
		disabled,
		class: className,
		children,
		...rest
	}: Props = $props();

	let isOpen = $state(false);
	// Seed from the prop's initial value; flips to true once the menu opens.
	// svelte-ignore state_referenced_locally
	let needPermissions = $state(requestPermissions);
	// Bumped when the device list changes so the menu repositions.
	let devicesVersion = $state(0);

	let buttonEl = $state<HTMLButtonElement>();
	let tooltipEl = $state<HTMLDivElement>();

	function handleActiveDeviceChange(k: MediaDeviceKind, deviceId: string) {
		log.debug('handle device change');
		isOpen = false;
		onActiveDeviceChange?.(k, deviceId);
	}

	$effect(() => {
		if (isOpen) needPermissions = true;
	});

	// Position the menu relative to the button while open.
	$effect(() => {
		// track reactive deps
		void isOpen;
		void devicesVersion;
		if (!buttonEl || !tooltipEl) return;
		const cleanup = computeMenuPosition(buttonEl, tooltipEl, (x, y) => {
			if (tooltipEl) Object.assign(tooltipEl.style, { left: `${x}px`, top: `${y}px` });
		});
		return () => cleanup?.();
	});

	// Close on outside click.
	$effect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (!tooltipEl) return;
			if (event.target === buttonEl) return;
			if (isOpen && wasClickOutside(tooltipEl, event)) isOpen = false;
		}
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});

	const ChevronDown = icons.ChevronDown;
</script>

<button
	bind:this={buttonEl}
	class={['lk-button lk-button-menu', className]}
	aria-pressed={isOpen}
	{disabled}
	{...rest}
	onclick={() => (isOpen = !isOpen)}
>
	{#if children}{@render children()}{:else}<ChevronDown />{/if}
</button>

{#if !disabled}
	<div
		bind:this={tooltipEl}
		class="lk-device-menu"
		style:visibility={isOpen ? 'visible' : 'hidden'}
	>
		{#if kind}
			<MediaDeviceSelect
				{kind}
				{initialSelection}
				track={tracks?.[kind]}
				requestPermissions={needPermissions}
				onActiveDeviceChange={(deviceId) => handleActiveDeviceChange(kind, deviceId)}
				onDeviceListChange={() => (devicesVersion += 1)}
			/>
		{:else}
			<div class="lk-device-menu-heading">Audio inputs</div>
			<MediaDeviceSelect
				kind="audioinput"
				track={tracks?.audioinput}
				requestPermissions={needPermissions}
				onActiveDeviceChange={(deviceId) => handleActiveDeviceChange('audioinput', deviceId)}
				onDeviceListChange={() => (devicesVersion += 1)}
			/>
			<div class="lk-device-menu-heading">Video inputs</div>
			<MediaDeviceSelect
				kind="videoinput"
				track={tracks?.videoinput}
				requestPermissions={needPermissions}
				onActiveDeviceChange={(deviceId) => handleActiveDeviceChange('videoinput', deviceId)}
				onDeviceListChange={() => (devicesVersion += 1)}
			/>
		{/if}
	</div>
{/if}
