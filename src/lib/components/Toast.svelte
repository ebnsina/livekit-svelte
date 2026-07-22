<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		children?: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();
</script>

<!--
	A rudimentary way to display a short-lived message to the user that does not
	require interaction (e.g. the current connection state).
-->
<div class={['lk-toast', className]} {...rest}>
	{@render children?.()}
</div>
