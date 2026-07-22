<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setRoomContext } from '../context/room-context.js';
	import { setSessionContext } from '../context/session-context.svelte.js';
	import type { UseSessionReturn } from '../state/createSession.svelte.js';

	interface Props {
		/** The session returned from {@link createSession}. */
		session: UseSessionReturn;
		children?: Snippet;
	}

	let { session, children }: Props = $props();

	// Provide both the session and its underlying room to descendants (init-only).
	// svelte-ignore state_referenced_locally
	setSessionContext(session);
	// svelte-ignore state_referenced_locally
	setRoomContext(session.room);
</script>

{@render children?.()}
