<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { createClearPinButton } from '../state/createClearPinButton.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		children?: Snippet;
	}

	let { children, class: className, onclick, ...rest }: Props = $props();

	const button = createClearPinButton();

	function handleClick(evt: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(evt);
		button.clear();
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
