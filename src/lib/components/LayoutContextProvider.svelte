<script lang="ts">
	import { log, type PinState, type WidgetState } from '@livekit/components-core';
	import type { Snippet } from 'svelte';
	import {
		createLayoutContext,
		setLayoutContext,
		type LayoutContextType
	} from '../context/layout-context.svelte.js';

	interface Props {
		/** Use an existing layout context instead of creating one. */
		value?: LayoutContextType;
		onPinChange?: (state: PinState) => void;
		onWidgetChange?: (state: WidgetState) => void;
		children?: Snippet;
	}

	let { value, onPinChange, onWidgetChange, children }: Props = $props();

	// svelte-ignore state_referenced_locally
	const layout = value ?? createLayoutContext();
	setLayoutContext(layout);

	$effect(() => {
		log.debug('PinState Updated', { state: layout.pin.state });
		if (onPinChange && layout.pin.state) onPinChange(layout.pin.state);
	});

	$effect(() => {
		log.debug('Widget Updated', { widgetState: layout.widget.state });
		if (onWidgetChange && layout.widget.state) onWidgetChange(layout.widget.state);
	});
</script>

{@render children?.()}
