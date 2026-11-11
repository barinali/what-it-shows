import { fileURLToPath } from 'node:url';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

const runbook = fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url));

export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [mdsvex({ extensions: ['.svx'], layout: { runbook } }), vitePreprocess()],
  kit: {
    adapter: adapter({ pages: 'build', assets: 'build' }),
    alias: { '#lib': 'src/lib' },
    prerender: { entries: ['/kb'] },
  },
};
