<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/**
		 * Two children are expected: a small side component (e.g. a `CarouselLayout` of
		 * participants not in focus) and a larger main component (e.g. a `FocusLayout`).
		 */
		children?: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();
</script>

<div class={['lk-focus-layout', className]} {...rest}>
	{@render children?.()}
</div>
