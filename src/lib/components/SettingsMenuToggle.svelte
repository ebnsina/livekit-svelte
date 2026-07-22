<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { createSettingsToggle } from '../state/createSettingsToggle.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		children?: Snippet;
	}

	let { children, class: className, onclick, ...rest }: Props = $props();

	const settings = createSettingsToggle();

	function handleClick(evt: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(evt);
		settings.toggle();
	}
</script>

<button
	class={[settings.className, className]}
	aria-pressed={settings.pressed}
	onclick={handleClick}
	{...rest}
>
	{@render children?.()}
</button>
