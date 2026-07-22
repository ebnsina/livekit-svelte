<script lang="ts">
	import type { Participant } from 'livekit-client';
	import type { Snippet } from 'svelte';
	import { setParticipantContext } from '../context/participant-context.js';

	interface Props {
		participant: Participant;
		children?: Snippet<[Participant]>;
	}

	let { participant, children }: Props = $props();

	// Provide this iteration's participant to descendants (including the rendered snippet).
	// Set once at init; ParticipantLoop keys each item by identity, so a change is a new instance.
	// svelte-ignore state_referenced_locally
	setParticipantContext(participant);
</script>

{@render children?.(participant)}
