import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	compilerOptions: {
		runes: true // or false, to keep legacy reactivity by default
	},

	kit: {
		adapter: adapter({
			pages: 'build/frontend',
			assets: 'build/frontend',
			fallback: undefined,
			precompress: false,
			strict: true
		}),
		alias: {
			$components: 'src/components',
			$lib: 'src/lib',
			$types: 'src/types',
			$stores: 'src/stores'
		}
	}
};

export default config;
