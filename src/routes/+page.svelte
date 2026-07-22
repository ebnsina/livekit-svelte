<script lang="ts">
	import { LiveKitRoom, ConnectionState, RoomName } from '$lib/index.js';
	import DocsNav from './DocsNav.svelte';
	import { generateDevToken } from './devToken.js';
	import GridExample from './examples/GridExample.svelte';
	import FocusExample from './examples/FocusExample.svelte';
	import ChatExample from './examples/ChatExample.svelte';
	import VoiceExample from './examples/VoiceExample.svelte';

	const examples = [
		{ key: 'grid', label: 'Grid' },
		{ key: 'focus', label: 'Focus' },
		{ key: 'chat', label: 'Chat' },
		{ key: 'voice', label: 'Voice' }
	] as const;
	let example = $state<(typeof examples)[number]['key']>('grid');

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

	// --- In-browser token generator (dev only) ---
	let apiKey = $state('');
	let apiSecret = $state('');
	let room = $state('demo');
	let identity = $state('me');
	let generating = $state(false);
	let genError = $state('');

	const genInput =
		'w-full rounded-lk border border-lk-border bg-lk-bg px-3 py-2 font-mono text-sm text-lk-fg transition placeholder:text-lk-fg-muted focus-visible:border-lk-accent focus-visible:ring-2 focus-visible:ring-lk-accent-ring focus-visible:outline-none';

	async function generate() {
		genError = '';
		generating = true;
		try {
			token = await generateDevToken({ apiKey, apiSecret, identity, room });
		} catch (e) {
			genError = e instanceof Error ? e.message : 'Failed to generate token';
		} finally {
			generating = false;
		}
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

	{#if !connected}
		<DocsNav />
	{/if}

	<!-- In-call experience: LiveKitRoom stays mounted so connecting works. It renders as
	     display:contents so its empty box doesn't reserve height before you connect. -->
	<LiveKitRoom
		{serverUrl}
		{token}
		{connect}
		audio
		video
		onConnected={() => (status = 'connected')}
		onDisconnected={() => (status = 'disconnected')}
		onError={(e) => (status = `error: ${e.message}`)}
		class="contents"
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

				<!-- Example switcher -->
				<div
					class="mx-auto flex items-center gap-1 overflow-x-auto rounded-full border border-lk-border bg-lk-bg-2/70 p-1"
				>
					{#each examples as ex (ex.key)}
						<button
							type="button"
							onclick={() => (example = ex.key)}
							class="rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition {example ===
							ex.key
								? 'bg-lk-accent text-lk-accent-fg'
								: 'text-lk-fg-secondary hover:text-lk-fg'}"
						>
							{ex.label}
						</button>
					{/each}
				</div>

				<ConnectionState
					class="hidden rounded-full border border-lk-border bg-lk-bg-2 px-2.5 py-1 font-mono text-xs text-lk-fg-secondary sm:block"
				/>
			</header>

			<!-- Selected example -->
			<div class="relative flex flex-1 flex-col">
				{#if example === 'grid'}
					<GridExample />
				{:else if example === 'focus'}
					<FocusExample />
				{:else if example === 'chat'}
					<ChatExample />
				{:else if example === 'voice'}
					<VoiceExample />
				{/if}
			</div>
		{/if}
	</LiveKitRoom>

	<!-- Join screen -->
	{#if !connected}
		<div
			class="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6"
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

					<details class="rounded-lk border border-lk-border bg-lk-bg/40">
						<summary
							class="cursor-pointer px-3.5 py-2.5 text-sm text-lk-fg-secondary select-none"
						>
							No token? Generate one <span class="text-lk-fg-muted">(dev only)</span>
						</summary>
						<div class="flex flex-col gap-3 border-t border-lk-border px-3.5 py-3.5">
							<p class="text-xs leading-relaxed text-lk-fg-muted">
								Signs a token in your browser with the Web Crypto API — nothing is sent
								anywhere. For local testing only; never ship your API secret in a real app.
							</p>
							<input
								class={genInput}
								placeholder="API key (APIxxxx)"
								autocomplete="off"
								spellcheck="false"
								bind:value={apiKey}
							/>
							<input
								type="password"
								class={genInput}
								placeholder="API secret"
								autocomplete="off"
								bind:value={apiSecret}
							/>
							<div class="grid grid-cols-2 gap-3">
								<input
									class={genInput}
									placeholder="room"
									autocomplete="off"
									spellcheck="false"
									bind:value={room}
								/>
								<input
									class={genInput}
									placeholder="identity"
									autocomplete="off"
									spellcheck="false"
									bind:value={identity}
								/>
							</div>
							<button
								type="button"
								class="rounded-lk border border-lk-border bg-lk-control-bg px-4 py-2 text-sm font-medium text-lk-fg transition hover:bg-lk-control-hover disabled:opacity-40"
								onclick={generate}
								disabled={!apiKey || !apiSecret || generating}
							>
								{generating ? 'Generating…' : 'Generate token'}
							</button>
							{#if genError}
								<p class="text-xs text-lk-danger">{genError}</p>
							{/if}
						</div>
					</details>

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
