<script lang="ts">
	import { Track } from 'livekit-client';
	import {
		createTracks,
		createChat,
		TrackLoop,
		VideoTrack,
		ParticipantName,
		ChatEntry
	} from '$lib/index.js';
	import ControlDock from './ControlDock.svelte';

	const tracks = createTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
	const chat = createChat();

	let draft = $state('');

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		const message = draft.trim();
		if (!message || chat.isSending) return;
		draft = '';
		await chat.send(message);
	}
</script>

<div class="flex flex-1 gap-3 p-4 pb-28 sm:p-6 sm:pb-28">
	<div class="flex-1 overflow-y-auto">
		<div class="grid grid-cols-1 gap-lk-gap sm:grid-cols-2">
			<TrackLoop tracks={tracks.current}>
				{#snippet children(trackRef)}
					<div
						class="relative aspect-video overflow-hidden rounded-lk-lg border border-lk-border bg-lk-bg-2"
					>
						<VideoTrack {trackRef} class="h-full w-full object-cover" />
						<ParticipantName
							class="absolute bottom-2 left-2 rounded bg-black/45 px-2 py-0.5 text-xs text-white"
						/>
					</div>
				{/snippet}
			</TrackLoop>
		</div>
	</div>

	<aside class="flex w-80 shrink-0 flex-col rounded-lk-lg border border-lk-border bg-lk-bg-2">
		<div class="border-b border-lk-border px-4 py-3 text-sm font-semibold tracking-tight">Chat</div>
		<ul class="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
			{#each chat.chatMessages as entry (entry.id)}
				<ChatEntry {entry} class="text-sm text-lk-fg-secondary [&_.lk-message-body]:text-lk-fg" />
			{:else}
				<li class="px-1 text-sm text-lk-fg-muted">No messages yet — say hi.</li>
			{/each}
		</ul>
		<form class="flex gap-2 border-t border-lk-border p-3" onsubmit={submit}>
			<input
				class="w-full rounded-lk border border-lk-border bg-lk-bg px-3 py-2 text-sm text-lk-fg placeholder:text-lk-fg-muted focus-visible:border-lk-accent focus-visible:ring-2 focus-visible:ring-lk-accent-ring focus-visible:outline-none"
				placeholder="Message"
				bind:value={draft}
			/>
			<button
				class="shrink-0 rounded-lk bg-lk-accent px-3 py-2 text-sm font-semibold text-lk-accent-fg transition hover:bg-lk-accent-hover disabled:opacity-40"
				disabled={chat.isSending || !draft.trim()}
			>
				Send
			</button>
		</form>
	</aside>
</div>
<ControlDock />
