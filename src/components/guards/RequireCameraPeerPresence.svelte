<script lang="ts">
	import { getContext } from 'svelte';
	import type { SvelteMap } from 'svelte/reactivity';
	import type { ClientMetadata } from '$types/ClientMetadata';
	import pickOne from '$lib/pickOne';
	import filterPeersByType from '$lib/filterPeersByType';
	import Message from '$components/Message.svelte';

	const { children } = $props();

	const peers: SvelteMap<string, ClientMetadata> = getContext('peers');
	const cameras = $derived(filterPeersByType(peers, 'camera'));
</script>

{#if cameras.length > 0}
	{@render children()}
{:else}
	<Message
		imageSource="yuzu_searching.png"
		message={pickOne([
			'No camwaaa… where da camewaaa?"',
			'Where are my friends?',
			'Hellooo? Is anyone out there?',
			'I’m looking... but all I see is nothin!'
		])}
		hint="Open this web page on another device to keep an eye on your little one."
	/>
{/if}
