<script lang="ts">
	import type { Participant } from 'livekit-client';
	import type { Snippet } from 'svelte';
	import ParticipantContextProvider from './ParticipantContextProvider.svelte';

	interface Props {
		/** The participants to loop over (e.g. from `createParticipants()`). */
		participants: Participant[];
		/** Template rendered once per participant; also receives the participant. */
		children: Snippet<[Participant]>;
	}

	let { participants, children }: Props = $props();
</script>

{#each participants as participant (participant.identity)}
	<ParticipantContextProvider {participant} {children} />
{/each}
