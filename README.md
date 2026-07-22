# @ebnsina/livekit-svelte

LiveKit components for **Svelte 5** — a port of [`@livekit/components-react`](https://github.com/livekit/components-js) that gives Svelte apps the same components, state helpers, and prefabs for building realtime video, audio, and agent experiences.

It reuses LiveKit's framework‑agnostic [`@livekit/components-core`](https://www.npmjs.com/package/@livekit/components-core) (all the state logic lives there as RxJS observables) and reimplements only the binding layer in idiomatic Svelte 5 runes.

> [!NOTE]
> **Status: early / in development.** The foundation and the `LiveKitRoom` root are in place and verified; components, state factories, and prefabs are being ported phase by phase. See the [roadmap](#roadmap).

## Features

- 🎯 **Svelte 5 native** — built on runes (`$state`/`$effect`), snippets, and context.
- ♻️ **Powered by LiveKit core** — wraps `@livekit/components-core`, so behavior tracks the official library.
- 🎨 **Tailwind CSS v4** styling with themeable `--lk-*` design tokens.
- 🧩 **Same DOM contract** — components emit the official `data-lk-*` attributes, so LiveKit theming knowledge carries over.
- 🛡️ **Graceful error handling** — connection, token, media‑device, and stream errors are surfaced, never thrown into your app.
- 🔤 **Fully typed** — ships `.d.ts` for every export.

## Installation

```bash
pnpm add @ebnsina/livekit-svelte
# peers (you almost certainly have these already)
pnpm add -D svelte tailwindcss
```

`livekit-client`, `@livekit/components-core`, `@lucide/svelte`, and `rxjs` are pulled in automatically.

## Quick start

You need a LiveKit server URL and an access token (mint tokens on your server — never ship your API secret to the browser).

```svelte
<script lang="ts">
	import { LiveKitRoom } from '@ebnsina/livekit-svelte';
	import '@ebnsina/livekit-svelte/styles.css';

	let { token, serverUrl } = $props();
	let status = $state('connecting');
</script>

<LiveKitRoom
	{serverUrl}
	{token}
	connect
	audio
	video
	onConnected={() => (status = 'connected')}
	onDisconnected={() => (status = 'disconnected')}
	onError={(e) => (status = `error: ${e.message}`)}
>
	<!-- track & participant components go here -->
	<p>Status: {status}</p>
</LiveKitRoom>
```

## Tailwind setup

The library is styled with Tailwind v4 utilities plus `--lk-*` theme tokens. Import the stylesheet once and point Tailwind at the package so its classes are detected:

```css
/* app.css */
@import 'tailwindcss';
@import '@ebnsina/livekit-svelte/styles.css';

/* let Tailwind scan the library's components */
@source '../node_modules/@ebnsina/livekit-svelte/dist';
```

Retheme by overriding any token, e.g.:

```css
@theme {
	--color-lk-accent: #7c3aed;
	--radius-lk: 0.75rem;
}
```

## Architecture

The React library is a thin binding layer over `@livekit/components-core`, which exposes state as RxJS observables (`setup*()` helpers) plus pure functions. This port keeps that core and swaps only the bindings:

| React                         | livekit-svelte                                             |
| ----------------------------- | ---------------------------------------------------------- |
| `createContext` / `useX`      | `setContext`/`getContext` (`context/`)                     |
| `useObservableState(obs)`     | `observableState(obs, startWith)` — RxJS → rune (`reactivity/`) |
| `useXxx` hooks                | `createXxx` factories (`state/`, Svelte naming)            |
| `.tsx` components / prefabs   | `.svelte` components / prefabs                             |

Because `.subscribe()` on an RxJS observable returns a `Subscription` (not a bare teardown function), observables can't be used with Svelte's `$store` syntax directly — `observableState` / `toReadable` adapt that contract.

## Roadmap

- [x] **Foundation** — package scaffold, Tailwind, `observableState`, room context, `LiveKitRoom`
- [ ] **Tracks & participants** — `createTracks`, `createParticipants`, `VideoTrack`, `AudioTrack`, `ParticipantTile`, `ParticipantName`, `RoomAudioRenderer`
- [ ] **Controls & layout** — `TrackToggle`, `DisconnectButton`, `MediaDeviceSelect`/`Menu`, `ControlBar`, grid/focus layouts
- [ ] **Prefabs** — `VideoConference`, `PreJoin`, `AudioConference`
- [ ] **Chat & data** — `Chat`, `ChatEntry`, `createChat`, `createDataChannel`
- [ ] **Agents & advanced** — `createVoiceAssistant`, `BarVisualizer`, transcriptions, `createRpc`, sessions

## Development

```bash
pnpm install
pnpm dev      # run the dev harness (src/routes)
pnpm check    # svelte-check
pnpm test     # vitest
pnpm prepack  # build the library to dist/ + publint
```

## License

MIT © ebnsina

Not affiliated with or endorsed by LiveKit. "LiveKit" is a trademark of its respective owner.
