<script lang="ts">
	import { setupParticipantName } from '@livekit/components-core';
	import type { Participant } from 'livekit-client';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { ensureParticipant } from '../context/participant-context.js';
	import { observableState } from '../reactivity/observableState.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		/** The participant whose name to display. Falls back to participant/track context. */
		participant?: Participant;
		children?: Snippet;
	}

	let { participant, children, class: className, ...rest }: Props = $props();

	// Participant is resolved once at init (context lookup is init-only).
	// svelte-ignore state_referenced_locally
	const p = ensureParticipant(participant);
	const { className: lkClass, infoObserver } = setupParticipantName(p);
	const info = observableState(infoObserver, { name: p.name, identity: p.identity, metadata: p.metadata });

	const display = $derived(info.current.name ? info.current.name : info.current.identity);
</script>

<span class={[lkClass, className]} data-lk-participant-name={info.current.name} {...rest}>
	{display}{@render children?.()}
</span>
