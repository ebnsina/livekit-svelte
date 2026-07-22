<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';

	const links = [
		{ href: `${base}/`, label: 'Demo' },
		{ href: `${base}/docs`, label: 'Docs' },
		{ href: `${base}/changelog`, label: 'Changelog' }
	];

	// Normalize a trailing slash so the home link matches `${base}/` and `${base}`.
	const current = $derived(page.url.pathname.replace(/\/$/, '') || '/');

	function isActive(href: string) {
		return (href.replace(/\/$/, '') || '/') === current;
	}
</script>

<header
	class="sticky top-0 z-40 border-b border-lk-border/80 bg-lk-bg/70 backdrop-blur-xl"
>
	<nav class="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
		<a href="{base}/" class="flex items-center gap-2.5">
			<span
				class="flex size-7 items-center justify-center rounded-lk-sm bg-lk-accent text-sm font-bold text-lk-accent-fg shadow-lk-accent"
			>
				S
			</span>
			<span class="text-sm font-semibold tracking-tight">livekit-svelte</span>
		</a>
		<div class="ml-auto flex items-center gap-1">
			{#each links as link (link.href)}
				<a
					href={link.href}
					aria-current={isActive(link.href) ? 'page' : undefined}
					class="rounded-lk-sm px-3 py-1.5 text-sm transition {isActive(link.href)
						? 'bg-lk-control-bg text-lk-fg'
						: 'text-lk-fg-secondary hover:bg-lk-control-hover hover:text-lk-fg'}"
				>
					{link.label}
				</a>
			{/each}
			<a
				href="https://github.com/ebnsina/livekit-svelte"
				class="ml-1 rounded-lk-sm px-3 py-1.5 text-sm text-lk-fg-secondary transition hover:bg-lk-control-hover hover:text-lk-fg"
			>
				GitHub
			</a>
		</div>
	</nav>
</header>
