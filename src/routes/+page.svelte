<script lang="ts">
	import { LiveKitRoom, ConnectionState, RoomName } from '$lib/index.js';
	import Stage from './Stage.svelte';

	let serverUrl = $state('');
	let token = $state('');
	let connect = $state(false);
	let status = $state('idle');

	function join() {
		status = 'connecting';
		connect = true;
	}
</script>

<main class="min-h-screen bg-lk-bg p-6 text-lk-fg">
	<h1 class="mb-4 text-2xl font-semibold">livekit-svelte dev harness</h1>

	<div class="mb-4 flex max-w-xl flex-col gap-2">
		<input
			class="rounded-lk border border-lk-border bg-lk-bg-2 px-3 py-2"
			placeholder="wss://your-project.livekit.cloud"
			bind:value={serverUrl}
		/>
		<textarea
			class="rounded-lk border border-lk-border bg-lk-bg-2 px-3 py-2"
			placeholder="access token"
			rows="3"
			bind:value={token}
		></textarea>
		<button
			class="rounded-lk bg-lk-accent px-4 py-2 text-lk-accent-fg disabled:opacity-50"
			onclick={join}
			disabled={!serverUrl || !token}
		>
			Join
		</button>
		<p class="text-sm text-lk-fg-secondary">status: {status}</p>
	</div>

	<LiveKitRoom
		{serverUrl}
		{token}
		{connect}
		audio
		video
		onConnected={() => (status = 'connected')}
		onDisconnected={() => (status = 'disconnected')}
		onError={(e) => (status = `error: ${e.message}`)}
		class="rounded-lk border border-lk-border p-4"
	>
		<div class="mb-3 flex items-center gap-3 text-sm text-lk-fg-secondary">
			<RoomName class="font-medium text-lk-fg" />
			<ConnectionState class="rounded bg-lk-bg-2 px-2 py-0.5" />
		</div>
		<Stage />
	</LiveKitRoom>
</main>
