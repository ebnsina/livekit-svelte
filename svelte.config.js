import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Set BASE_PATH=/livekit-svelte when building for a GitHub Pages project site.
const base = process.env.BASE_PATH ?? '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Fully static output for GitHub Pages.
		adapter: adapter({ fallback: '404.html' }),
		paths: { base },
		prerender: { handleHttpError: 'warn' }
	}
};

export default config;
