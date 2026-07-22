<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { createDisconnectButton } from '../state/createDisconnectButton.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** Whether to stop local tracks on disconnect. Defaults to `true`. */
		stopTracks?: boolean;
		children?: Snippet;
	}

	let { stopTracks, children, class: className, onclick, ...rest }: Props = $props();

	const button = createDisconnectButton(() => ({ stopTracks }));

	function handleClick(evt: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(evt);
		button.disconnect();
	}
</script>

<button
	class={[button.className, className]}
	disabled={button.disabled}
	onclick={handleClick}
	{...rest}
>
	{@render children?.()}
</button>
