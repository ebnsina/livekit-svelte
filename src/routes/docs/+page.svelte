<script lang="ts">
	import DocsNav from '../DocsNav.svelte';

	const install = `pnpm add @ebnsina/livekit-svelte
# peers you likely already have
pnpm add -D svelte tailwindcss`;

	const tailwind = `/* app.css */
@import 'tailwindcss';
@import '@ebnsina/livekit-svelte/styles.css';`;

	const theming = `@theme {
  --color-lk-accent: #7c3aed;   /* your brand color   */
  --radius-lk: 1rem;            /* rounder corners     */
  --color-lk-bg: #0b0b0f;       /* app background      */
}`;

	const quickstart = `<script lang="ts">
  import { LiveKitRoom, VideoConference } from '@ebnsina/livekit-svelte';
  import '@ebnsina/livekit-svelte/styles.css';

  let { token, serverUrl } = $props();
<\/script>

<LiveKitRoom {serverUrl} {token} connect audio video>
  <VideoConference />
<\/LiveKitRoom>`;

	const custom = `<script lang="ts">
  import { Track } from 'livekit-client';
  import { createTracks, TrackLoop, VideoTrack, ParticipantName } from '@ebnsina/livekit-svelte';

  // createTracks is reactive: tracks.current updates as people join/leave.
  const tracks = createTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
<\/script>

<div class="grid grid-cols-2 gap-2">
  <TrackLoop tracks={tracks.current}>
    {#snippet children(trackRef)}
      <VideoTrack {trackRef} />
      <ParticipantName />
    {/snippet}
  <\/TrackLoop>
<\/div>`;

	const factory = `<script lang="ts">
  import { Track } from 'livekit-client';
  import { createTrackToggle } from '@ebnsina/livekit-svelte';

  // Every component is backed by a createXxx factory you can drive yourself.
  const mic = createTrackToggle(() => ({ source: Track.Source.Microphone }));
<\/script>

<button aria-pressed={mic.enabled} onclick={mic.onclick}>
  {mic.enabled ? 'Mute' : 'Unmute'}
<\/button>`;

	const steps = [
		{
			n: '1',
			title: 'Get a token',
			body: 'Mint a LiveKit access token on your server (never expose your API secret in the browser) and pass it, with your server URL, to LiveKitRoom.'
		},
		{
			n: '2',
			title: 'Render a room',
			body: 'Wrap your UI in LiveKitRoom. It connects, publishes your camera/mic, provides the room via context, and surfaces connection, token, and device errors gracefully.'
		},
		{
			n: '3',
			title: 'Drop in components',
			body: 'Use a prefab like VideoConference for a full call, or compose primitives (TrackLoop, VideoTrack, ControlBar) for full control over the layout.'
		}
	];

	const groups = [
		{
			title: 'Room & context',
			items: ['LiveKitRoom', 'RoomAudioRenderer', 'RoomName', 'ConnectionState', 'LayoutContextProvider', 'SessionProvider']
		},
		{
			title: 'Participants & tracks',
			items: ['ParticipantLoop', 'TrackLoop', 'ParticipantTile', 'ParticipantAudioTile', 'ParticipantName', 'VideoTrack', 'AudioTrack']
		},
		{
			title: 'Controls',
			items: ['TrackToggle', 'DisconnectButton', 'MediaDeviceSelect', 'MediaDeviceMenu', 'FocusToggle', 'ClearPinButton', 'ChatToggle', 'SettingsMenuToggle', 'StartAudio', 'StartMediaButton']
		},
		{
			title: 'Indicators & visualizers',
			items: ['TrackMutedIndicator', 'ConnectionQualityIndicator', 'ConnectionStateToast', 'Toast', 'AudioVisualizer', 'BarVisualizer']
		},
		{
			title: 'Layout',
			items: ['GridLayout', 'FocusLayout', 'FocusLayoutContainer', 'CarouselLayout']
		},
		{
			title: 'Prefabs',
			items: ['VideoConference', 'PreJoin', 'AudioConference', 'ControlBar', 'Chat', 'VoiceAssistantControlBar']
		}
	];

	const factories = [
		'createTracks', 'createParticipants', 'createLocalParticipant', 'createConnectionState',
		'createTrackToggle', 'createChat', 'createMediaDeviceSelect', 'createGridLayout',
		'createTrackVolume', 'createVoiceAssistant', 'createTranscriptions', 'createRpc'
	];
</script>

<svelte:head>
	<title>Docs — livekit-svelte</title>
	<meta name="description" content="Getting started with livekit-svelte: installation, Tailwind setup, quick start, and the component reference." />
</svelte:head>

<DocsNav />

<main class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
	<p class="font-mono text-xs tracking-wide text-lk-accent uppercase">Documentation</p>
	<h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Getting started</h1>
	<p class="mt-3 max-w-2xl leading-relaxed text-lk-fg-secondary">
		<strong class="text-lk-fg">livekit-svelte</strong> is a component library for building realtime
		video, audio, and AI-agent experiences in Svelte 5. It wraps LiveKit's official
		<code class="rounded bg-lk-bg-3 px-1 py-0.5 font-mono text-sm">@livekit/components-core</code>
		and <code class="rounded bg-lk-bg-3 px-1 py-0.5 font-mono text-sm">livekit-client</code>, exposing
		them through idiomatic runes, context, and snippets — with full TypeScript types and SSR-safe
		rendering.
	</p>

	<!-- How it works -->
	<section class="mt-12">
		<h2 class="text-xl font-semibold tracking-tight">How it works</h2>
		<ol class="mt-4 space-y-3">
			{#each steps as step (step.n)}
				<li class="flex gap-4 rounded-lk border border-lk-border bg-lk-bg-2 p-4">
					<span
						class="flex size-7 shrink-0 items-center justify-center rounded-full bg-lk-accent-subtle font-mono text-sm font-semibold text-lk-accent"
					>
						{step.n}
					</span>
					<div>
						<h3 class="text-sm font-semibold tracking-tight">{step.title}</h3>
						<p class="mt-1 text-sm leading-relaxed text-lk-fg-secondary">{step.body}</p>
					</div>
				</li>
			{/each}
		</ol>
	</section>

	<!-- Install -->
	<section class="mt-12">
		<h2 class="text-xl font-semibold tracking-tight">Installation</h2>
		<pre
			class="mt-3 overflow-x-auto rounded-lk border border-lk-border bg-lk-bg-2 p-4 font-mono text-sm text-lk-fg-secondary">{install}</pre>
		<p class="mt-2 text-sm text-lk-fg-secondary">
			<code class="rounded bg-lk-bg-3 px-1 py-0.5 font-mono text-sm">livekit-client</code>,
			<code class="rounded bg-lk-bg-3 px-1 py-0.5 font-mono text-sm">@livekit/components-core</code>,
			and the Lucide icon set are pulled in automatically.
		</p>
	</section>

	<!-- Tailwind -->
	<section class="mt-12">
		<h2 class="text-xl font-semibold tracking-tight">Styling</h2>
		<p class="mt-2 text-sm leading-relaxed text-lk-fg-secondary">
			The library is styled with Tailwind CSS v4. Add two imports to your global stylesheet — the
			theme registers its own design tokens <em>and</em> its component sources, so there is no separate
			<code class="rounded bg-lk-bg-3 px-1 py-0.5 font-mono text-sm">@source</code> step.
		</p>
		<pre
			class="mt-3 overflow-x-auto rounded-lk border border-lk-border bg-lk-bg-2 p-4 font-mono text-sm text-lk-fg-secondary">{tailwind}</pre>
		<p class="mt-4 text-sm leading-relaxed text-lk-fg-secondary">
			Retheme by overriding any <code class="rounded bg-lk-bg-3 px-1 py-0.5 font-mono text-sm"
				>--lk-*</code
			> token in your own <code class="rounded bg-lk-bg-3 px-1 py-0.5 font-mono text-sm">@theme</code
			> block:
		</p>
		<pre
			class="mt-3 overflow-x-auto rounded-lk border border-lk-border bg-lk-bg-2 p-4 font-mono text-sm text-lk-fg-secondary">{theming}</pre>
		<p class="mt-4 text-sm leading-relaxed text-lk-fg-secondary">
			Want the prefabs and components polished out-of-the-box? Also import the optional
			baseline theme — it styles every <code class="rounded bg-lk-bg-3 px-1 py-0.5 font-mono text-sm">lk-*</code>
			class using the same tokens, so <code class="rounded bg-lk-bg-3 px-1 py-0.5 font-mono text-sm"
				>VideoConference</code
			>, <code class="rounded bg-lk-bg-3 px-1 py-0.5 font-mono text-sm">ControlBar</code>,
			<code class="rounded bg-lk-bg-3 px-1 py-0.5 font-mono text-sm">Chat</code> and friends look great with zero extra work.
		</p>
		<pre
			class="mt-3 overflow-x-auto rounded-lk border border-lk-border bg-lk-bg-2 p-4 font-mono text-sm text-lk-fg-secondary">@import '@ebnsina/livekit-svelte/components.css';</pre>
	</section>

	<!-- Quick start -->
	<section class="mt-12">
		<h2 class="text-xl font-semibold tracking-tight">Quick start</h2>
		<p class="mt-2 text-sm text-lk-fg-secondary">
			The fastest path — a complete conference in a few lines:
		</p>
		<pre
			class="mt-3 overflow-x-auto rounded-lk border border-lk-border bg-lk-bg-2 p-4 font-mono text-sm text-lk-fg-secondary">{quickstart}</pre>
	</section>

	<!-- Custom UI -->
	<section class="mt-12">
		<h2 class="text-xl font-semibold tracking-tight">Composing your own layout</h2>
		<p class="mt-2 text-sm leading-relaxed text-lk-fg-secondary">
			Prefer full control? Compose the primitives. <code
				class="rounded bg-lk-bg-3 px-1 py-0.5 font-mono text-sm">createTracks</code
			> returns a reactive list; <code class="rounded bg-lk-bg-3 px-1 py-0.5 font-mono text-sm"
				>TrackLoop</code
			> renders a snippet per track and provides each via context.
		</p>
		<pre
			class="mt-3 overflow-x-auto rounded-lk border border-lk-border bg-lk-bg-2 p-4 font-mono text-sm text-lk-fg-secondary">{custom}</pre>
	</section>

	<!-- Factories -->
	<section class="mt-12">
		<h2 class="text-xl font-semibold tracking-tight">State factories</h2>
		<p class="mt-2 text-sm leading-relaxed text-lk-fg-secondary">
			Every component is a thin wrapper over a <code
				class="rounded bg-lk-bg-3 px-1 py-0.5 font-mono text-sm">createXxx</code
			> factory. Call one directly to build bespoke UI without giving up the reactive wiring.
		</p>
		<pre
			class="mt-3 overflow-x-auto rounded-lk border border-lk-border bg-lk-bg-2 p-4 font-mono text-sm text-lk-fg-secondary">{factory}</pre>
		<ul class="mt-4 flex flex-wrap gap-1.5">
			{#each factories as fn (fn)}
				<li class="rounded bg-lk-bg-3 px-2 py-0.5 font-mono text-xs text-lk-fg-secondary">{fn}</li>
			{/each}
			<li class="rounded bg-lk-bg-3 px-2 py-0.5 font-mono text-xs text-lk-fg-muted">…100+ more</li>
		</ul>
	</section>

	<!-- Component reference -->
	<section class="mt-12">
		<h2 class="text-xl font-semibold tracking-tight">Component reference</h2>
		<div class="mt-4 grid gap-4 sm:grid-cols-2">
			{#each groups as group (group.title)}
				<div class="rounded-lk border border-lk-border bg-lk-bg-2 p-4">
					<h3 class="text-sm font-semibold tracking-tight">{group.title}</h3>
					<ul class="mt-2 flex flex-wrap gap-1.5">
						{#each group.items as item (item)}
							<li class="rounded bg-lk-bg-3 px-2 py-0.5 font-mono text-xs text-lk-fg-secondary">
								{item}
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</section>

	<!-- SSR -->
	<section class="mt-12 rounded-lk border border-lk-border bg-lk-bg-2 p-5">
		<h2 class="text-base font-semibold tracking-tight">A note on SSR</h2>
		<p class="mt-2 text-sm leading-relaxed text-lk-fg-secondary">
			LiveKit is a browser API. Components render on the server without crashing, and
			<code class="rounded bg-lk-bg-3 px-1 py-0.5 font-mono text-sm">LiveKitRoom</code> mounts its
			children on the client once the room exists — so there are no hydration mismatches. Media
			access, device enumeration, and audio contexts run only in the browser.
		</p>
	</section>
</main>
