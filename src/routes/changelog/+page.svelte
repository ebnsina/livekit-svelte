<script lang="ts">
	import DocsNav from '../DocsNav.svelte';

	interface Release {
		version: string;
		status: string;
		groups: { title: string; changes: string[] }[];
	}

	const releases: Release[] = [
		{
			version: '0.1.0',
			status: 'Unreleased',
			groups: [
				{
					title: 'Room & connection',
					changes: [
						'LiveKitRoom with connect/disconnect lifecycle and graceful handling of token, network, media-device, and encryption errors',
						'ConnectionState, RoomName, and RoomAudioRenderer for room status and remote audio',
						'ConnectionStateToast and ConnectionQualityIndicator'
					]
				},
				{
					title: 'Participants & tracks',
					changes: [
						'createTracks with placeholder synthesis; TrackLoop and ParticipantLoop with per-item context',
						'ParticipantTile composing video/audio, name, mute and quality indicators, and focus toggle',
						'Local and remote participant state, permissions, attributes, speaking and sorted participants'
					]
				},
				{
					title: 'Media rendering',
					changes: [
						'VideoTrack and AudioTrack with automatic attach/detach, volume, and server-side mute',
						'Track volume metering, including multiband, for visualizers'
					]
				},
				{
					title: 'Controls',
					changes: [
						'TrackToggle for microphone, camera, and screen share with source icons',
						'DisconnectButton, MediaDeviceSelect, and MediaDeviceMenu device switching',
						'FocusToggle, ClearPinButton, ChatToggle, SettingsMenuToggle, StartAudio, StartMediaButton',
						'Persistent device and username choices'
					]
				},
				{
					title: 'Layout',
					changes: [
						'GridLayout with responsive grid sizing and pagination',
						'FocusLayout, FocusLayoutContainer, and CarouselLayout',
						'Pinned tracks, visual-stable ordering, and swipe navigation'
					]
				},
				{
					title: 'Chat, data & visualizers',
					changes: [
						'createChat, Chat panel, and ChatEntry with link formatting',
						'Data channel messaging',
						'AudioVisualizer, BarVisualizer, and ParticipantAudioTile'
					]
				},
				{
					title: 'Prefabs',
					changes: [
						'ControlBar with permission-aware controls and responsive variations',
						'VideoConference, PreJoin, and AudioConference'
					]
				},
				{
					title: 'Agents & advanced',
					changes: [
						'Voice assistant state and VoiceAssistantControlBar',
						'Track transcriptions, text streams, and combined transcriptions',
						'Agent state, RPC, sessions, recording status, and token generation'
					]
				},
				{
					title: 'Design system',
					changes: [
						'Svelte-orange brand accent with a refined dark theme',
						'Mona Sans and IBM Plex Mono, self-hosted',
						'Themeable --lk-* design tokens; components emit the standard data-lk-* attributes'
					]
				},
				{
					title: 'Foundations',
					changes: [
						'Svelte 5 runes binding layer over @livekit/components-core',
						'RxJS observable to rune adapter with automatic subscription cleanup',
						'SSR-safe rendering and full TypeScript types for every export'
					]
				}
			]
		}
	];
</script>

<DocsNav />

<main class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
	<p class="font-mono text-xs tracking-wide text-lk-accent uppercase">Changelog</p>
	<h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">What's new</h1>
	<p class="mt-3 text-lk-fg-secondary">Notable features and changes, newest first.</p>

	{#each releases as release (release.version)}
		<section class="mt-10">
			<div class="flex items-baseline gap-3 border-b border-lk-border pb-3">
				<h2 class="font-mono text-2xl font-semibold tracking-tight">{release.version}</h2>
				<span
					class="rounded-full border border-lk-border bg-lk-bg-2 px-2.5 py-0.5 font-mono text-xs text-lk-fg-secondary"
				>
					{release.status}
				</span>
			</div>

			<div class="mt-6 space-y-7">
				{#each release.groups as group (group.title)}
					<div>
						<h3 class="text-sm font-semibold tracking-wide text-lk-fg uppercase">
							{group.title}
						</h3>
						<ul class="mt-2.5 space-y-2">
							{#each group.changes as change (change)}
								<li class="flex gap-2.5 text-sm text-lk-fg-secondary">
									<span
										class="mt-2 size-1.5 shrink-0 rounded-full bg-lk-accent"
										aria-hidden="true"
									></span>
									<span>{change}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</section>
	{/each}
</main>
