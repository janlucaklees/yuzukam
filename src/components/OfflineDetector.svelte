<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		online: Snippet;
		offline: Snippet;
	}

	let { online, offline }: Props = $props();
	let isOnline: boolean = $state(window.navigator.onLine);

	window.addEventListener('online', () => {
		isOnline = true;
	});

	window.addEventListener('offline', () => {
		isOnline = false;
	});
</script>

{#if isOnline}
	{@render online()}
{:else}
	{@render offline()}
{/if}
