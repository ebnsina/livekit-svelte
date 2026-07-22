<script lang="ts">
	import { Track } from 'livekit-client';
	import { TrackToggle, DisconnectButton } from '$lib/index.js';

	const btn =
		'inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-lk-fg-secondary transition hover:bg-lk-control-hover hover:text-lk-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lk-accent-ring';
</script>

<div class="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-4">
	<div
		class="pointer-events-auto flex items-center gap-1 rounded-full border border-lk-border bg-lk-bg-3/85 p-1.5 shadow-lk-lg backdrop-blur-xl"
	>
		<TrackToggle source={Track.Source.Microphone} class={btn} />
		<TrackToggle source={Track.Source.Camera} class={btn} />
		<TrackToggle source={Track.Source.ScreenShare} class={btn} />
		<span class="mx-1 h-6 w-px bg-lk-border" aria-hidden="true"></span>
		<DisconnectButton
			class="inline-flex items-center justify-center gap-1.5 rounded-full bg-lk-danger px-4 py-2.5 text-sm font-semibold text-lk-danger-fg transition hover:bg-lk-danger-hover focus-visible:ring-2 focus-visible:ring-lk-accent-ring focus-visible:outline-none disabled:opacity-50"
		>
			Leave
		</DisconnectButton>
	</div>
</div>
