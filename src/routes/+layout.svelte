<script lang="ts">
	import './layout.css';

	let { children } = $props();

	const title = 'livekit-svelte — LiveKit components for Svelte 5';
	const description =
		'A Svelte 5 component library for LiveKit: build realtime video, audio, and AI-agent UIs with runes, context, and snippets. Styled with Tailwind v4.';
	const url = 'https://ebnsina.github.io/livekit-svelte/';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="theme-color" content="#0a0a0b" />
	<meta name="color-scheme" content="dark" />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="livekit-svelte" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
</svelte:head>

{@render children?.()}
