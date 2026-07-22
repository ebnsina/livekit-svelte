<script lang="ts">
	import type { Participant } from 'livekit-client';
	import type { Snippet } from 'svelte';
	import {
		getMaybeParticipantContext,
		setParticipantContext
	} from '../context/participant-context.js';

	interface Props {
		participant?: Participant;
		children?: Snippet;
	}

	let { participant, children }: Props = $props();

	// Only provide a participant context if one is not already present.
	// svelte-ignore state_referenced_locally
	if (participant && !getMaybeParticipantContext()) {
		setParticipantContext(participant);
	}
</script>

{@render children?.()}
