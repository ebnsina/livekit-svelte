<script lang="ts">
	import DocsNav from '../DocsNav.svelte';

	const install = `pnpm add @ebnsina/livekit-svelte
pnpm add -D svelte tailwindcss`;

	const tailwind = `/* app.css */
@import 'tailwindcss';
@import '@ebnsina/livekit-svelte/styles.css';

@source '../node_modules/@ebnsina/livekit-svelte/dist';`;

	const quickstart = `<script lang="ts">
  import { LiveKitRoom, VideoConference } from '@ebnsina/livekit-svelte';
  import '@ebnsina/livekit-svelte/styles.css';

  let { token, serverUrl } = $props();
<\/script>

<LiveKitRoom {serverUrl} {token} connect audio video>
  <VideoConference />
<\/LiveKitRoom>`;

	const groups = [
		{
			title: 'Room & context',
			items: ['LiveKitRoom', 'RoomAudioRenderer', 'RoomName', 'ConnectionState', 'LayoutContextProvider']
		},
		{
			title: 'Participants & tracks',
			items: [
				'ParticipantLoop',
				'TrackLoop',
				'ParticipantTile',
				'ParticipantName',
				'VideoTrack',
				'AudioTrack'
			]
		},
		{
			title: 'Controls',
			items: [
				'TrackToggle',
				'DisconnectButton',
				'MediaDeviceSelect',
				'MediaDeviceMenu',
				'FocusToggle',
				'ChatToggle',
				'StartAudio'
			]
		},
		{
			title: 'Indicators & visualizers',
			items: [
				'TrackMutedIndicator',
				'ConnectionQualityIndicator',
				'AudioVisualizer',
				'BarVisualizer',
				'ConnectionStateToast'
			]
		},
		{
			title: 'Layout',
			items: ['GridLayout', 'FocusLayout', 'FocusLayoutContainer', 'CarouselLayout']
		},
		{
			title: 'Prefabs',
			items: ['VideoConference', 'PreJoin', 'AudioConference', 'ControlBar', 'Chat']
		}
	];

	const factories = [
		'createTracks',
		'createParticipants',
		'createConnectionState',
		'createTrackToggle',
		'createChat',
		'createMediaDeviceSelect',
		'createGridLayout',
		'createTrackVolume',
		'createVoiceAssistant'
	];
</script>

<DocsNav />

<main class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
	<p class="font-mono text-xs tracking-wide text-lk-accent uppercase">Documentation</p>
	<h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Getting started</h1>
	<p class="mt-3 text-lk-fg-secondary">
		LiveKit components for Svelte 5 — build realtime video, audio, and agent experiences with runes,
		context, and snippets on top of <code class="rounded bg-lk-bg-3 px-1 py-0.5 font-mono text-sm"
			>@livekit/components-core</code
		>.
	</p>

	<section class="mt-10">
		<h2 class="text-xl font-semibold tracking-tight">Installation</h2>
		<pre
			class="mt-3 overflow-x-auto rounded-lk border border-lk-border bg-lk-bg-2 p-4 font-mono text-sm text-lk-fg-secondary">{install}</pre>
	</section>

	<section class="mt-10">
		<h2 class="text-xl font-semibold tracking-tight">Tailwind setup</h2>
		<p class="mt-2 text-sm text-lk-fg-secondary">
			The library is styled with Tailwind v4. Import the theme once and point Tailwind at the package
			so its classes are detected. Retheme by overriding any <code
				class="rounded bg-lk-bg-3 px-1 py-0.5 font-mono text-sm">--lk-*</code
			> token.
		</p>
		<pre
			class="mt-3 overflow-x-auto rounded-lk border border-lk-border bg-lk-bg-2 p-4 font-mono text-sm text-lk-fg-secondary">{tailwind}</pre>
	</section>

	<section class="mt-10">
		<h2 class="text-xl font-semibold tracking-tight">Quick start</h2>
		<p class="mt-2 text-sm text-lk-fg-secondary">
			Mint an access token on your server, then drop a <code
				class="rounded bg-lk-bg-3 px-1 py-0.5 font-mono text-sm">VideoConference</code
			> inside a room.
		</p>
		<pre
			class="mt-3 overflow-x-auto rounded-lk border border-lk-border bg-lk-bg-2 p-4 font-mono text-sm text-lk-fg-secondary">{quickstart}</pre>
	</section>

	<section class="mt-10">
		<h2 class="text-xl font-semibold tracking-tight">Components</h2>
		<div class="mt-4 grid gap-4 sm:grid-cols-2">
			{#each groups as group (group.title)}
				<div class="rounded-lk border border-lk-border bg-lk-bg-2 p-4">
					<h3 class="text-sm font-semibold tracking-tight">{group.title}</h3>
					<ul class="mt-2 flex flex-wrap gap-1.5">
						{#each group.items as item (item)}
							<li
								class="rounded bg-lk-bg-3 px-2 py-0.5 font-mono text-xs text-lk-fg-secondary"
							>
								{item}
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</section>

	<section class="mt-10">
		<h2 class="text-xl font-semibold tracking-tight">State factories</h2>
		<p class="mt-2 text-sm text-lk-fg-secondary">
			Every component is backed by a <code class="rounded bg-lk-bg-3 px-1 py-0.5 font-mono text-sm"
				>createXxx</code
			> factory you can call directly in a component's script to build custom UI.
		</p>
		<ul class="mt-3 flex flex-wrap gap-1.5">
			{#each factories as fn (fn)}
				<li class="rounded bg-lk-bg-3 px-2 py-0.5 font-mono text-xs text-lk-fg-secondary">
					{fn}
				</li>
			{/each}
			<li class="rounded bg-lk-bg-3 px-2 py-0.5 font-mono text-xs text-lk-fg-muted">…and more</li>
		</ul>
	</section>
</main>
