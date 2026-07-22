<script lang="ts">
	import { LiveKitRoom, ConnectionState, RoomName } from '$lib/index.js';
	import Stage from './Stage.svelte';

	let serverUrl = $state('');
	let token = $state('');
	let connect = $state(false);
	let status = $state('idle');

	const connected = $derived(status === 'connected');
	const isError = $derived(status.startsWith('error'));

	function join() {
		status = 'connecting';
		connect = true;
	}
</script>

<main
	class="relative flex min-h-svh flex-col overflow-hidden bg-lk-bg text-lk-fg"
>
	<!-- Ambient brand glow -->
	<div
		aria-hidden="true"
		class="pointer-events-none absolute inset-x-0 -top-40 z-0 mx-auto h-[32rem] max-w-5xl opacity-60 blur-3xl"
		style="background: radial-gradient(50% 50% at 50% 0%, rgb(255 62 0 / 0.18), transparent 70%);"
	></div>

	<!-- In-call experience: LiveKitRoom stays mounted so connecting works. -->
	<LiveKitRoom
		{serverUrl}
		{token}
		{connect}
		audio
		video
		onConnected={() => (status = 'connected')}
		onDisconnected={() => (status = 'disconnected')}
		onError={(e) => (status = `error: ${e.message}`)}
		class="relative z-10 flex min-h-svh flex-1 flex-col"
	>
		{#if connected}
			<!-- Top bar -->
			<header
				class="sticky top-0 z-20 flex items-center gap-3 border-b border-lk-border/80 bg-lk-bg/70 px-4 py-3 backdrop-blur-xl sm:px-6"
			>
				<div class="flex items-center gap-2.5">
					<span class="relative flex size-2.5">
						<span
							class="absolute inline-flex size-full animate-ping rounded-full bg-lk-success opacity-60"
						></span>
						<span
							class="relative inline-flex size-2.5 rounded-full bg-lk-success"
						></span>
					</span>
					<RoomName class="text-sm font-semibold tracking-tight text-lk-fg" />
				</div>
				<ConnectionState
					class="ml-auto rounded-full border border-lk-border bg-lk-bg-2 px-2.5 py-1 font-mono text-xs text-lk-fg-secondary"
				/>
			</header>

			<!-- Video stage + controls -->
			<Stage />
		{/if}
	</LiveKitRoom>

	<!-- Join screen -->
	{#if !connected}
		<div
			class="relative z-10 flex min-h-svh flex-1 items-center justify-center p-4 sm:p-6"
		>
			<div
				class="w-full max-w-md rounded-lk-lg border border-lk-border bg-lk-bg-2/90 p-6 shadow-lk-lg backdrop-blur-xl sm:p-8"
			>
				<!-- Brand -->
				<div class="mb-7 flex items-center gap-3">
					<div
						class="flex size-11 items-center justify-center rounded-lk bg-lk-accent shadow-lk-accent"
					>
						<svg
							viewBox="0 0 24 24"
							class="size-6 text-lk-accent-fg"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d="m22 8-6 4 6 4V8Z" />
							<rect x="2" y="6" width="14" height="12" rx="2" />
						</svg>
					</div>
					<div>
						<h1 class="text-lg font-semibold tracking-tight text-lk-fg">
							livekit-svelte
						</h1>
						<p class="font-mono text-xs text-lk-fg-muted">dev harness</p>
					</div>
				</div>

				<h2 class="mb-1 text-xl font-semibold tracking-tight">
					Join a room
				</h2>
				<p class="mb-6 text-sm text-lk-fg-secondary">
					Paste your LiveKit server URL and an access token to connect.
				</p>

				<div class="flex flex-col gap-4">
					<label class="flex flex-col gap-1.5">
						<span
							class="text-xs font-medium tracking-wide text-lk-fg-secondary uppercase"
						>
							Server URL
						</span>
						<input
							class="rounded-lk border border-lk-border bg-lk-bg px-3.5 py-2.5 font-mono text-sm text-lk-fg transition placeholder:text-lk-fg-muted focus-visible:border-lk-accent focus-visible:ring-2 focus-visible:ring-lk-accent-ring focus-visible:outline-none"
							placeholder="wss://your-project.livekit.cloud"
							autocomplete="off"
							autocapitalize="off"
							spellcheck="false"
							bind:value={serverUrl}
						/>
					</label>

					<label class="flex flex-col gap-1.5">
						<span
							class="text-xs font-medium tracking-wide text-lk-fg-secondary uppercase"
						>
							Access token
						</span>
						<textarea
							class="resize-none rounded-lk border border-lk-border bg-lk-bg px-3.5 py-2.5 font-mono text-sm leading-relaxed break-all text-lk-fg transition placeholder:text-lk-fg-muted focus-visible:border-lk-accent focus-visible:ring-2 focus-visible:ring-lk-accent-ring focus-visible:outline-none"
							placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
							rows="4"
							autocomplete="off"
							autocapitalize="off"
							spellcheck="false"
							bind:value={token}
						></textarea>
					</label>

					<button
						class="mt-1 inline-flex items-center justify-center gap-2 rounded-lk bg-lk-accent px-4 py-2.5 text-sm font-semibold text-lk-accent-fg shadow-lk-accent transition hover:bg-lk-accent-hover active:bg-lk-accent-active focus-visible:ring-2 focus-visible:ring-lk-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-lk-bg-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
						onclick={join}
						disabled={!serverUrl || !token || status === 'connecting'}
					>
						{#if status === 'connecting'}
							<svg
								class="size-4 animate-spin"
								viewBox="0 0 24 24"
								fill="none"
								aria-hidden="true"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="3"
								/>
								<path
									class="opacity-90"
									d="M12 2a10 10 0 0 1 10 10"
									stroke="currentColor"
									stroke-width="3"
									stroke-linecap="round"
								/>
							</svg>
							Connecting…
						{:else}
							Join room
						{/if}
					</button>
				</div>

				<!-- Status line -->
				<div
					class="mt-5 flex items-center gap-2 border-t border-lk-border pt-4 font-mono text-xs"
				>
					<span
						class="size-1.5 rounded-full {isError
							? 'bg-lk-danger'
							: status === 'connecting'
								? 'bg-lk-warning'
								: 'bg-lk-fg-muted'}"
					></span>
					<span class="text-lk-fg-muted">status</span>
					<span
						class="truncate {isError ? 'text-lk-danger' : 'text-lk-fg-secondary'}"
					>
						{status}
					</span>
				</div>
			</div>
		</div>
	{/if}
</main>
