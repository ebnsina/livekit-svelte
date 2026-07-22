<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { createChatToggle } from '../state/createChatToggle.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		children?: Snippet;
	}

	let { children, class: className, onclick, ...rest }: Props = $props();

	const toggle = createChatToggle();

	function handleClick(evt: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(evt);
		toggle.onclick();
	}
</script>

<button
	class={[toggle.className, className]}
	aria-pressed={toggle.ariaPressed}
	data-lk-unread-msgs={toggle.unreadMsgs}
	onclick={handleClick}
	{...rest}
>
	{@render children?.()}
</button>
