<script lang="ts">
	import type { SvelteMap } from 'svelte/reactivity';
	import { getContext } from 'svelte';
	import { type ClientMetadata } from '$types/ClientMetadata';
	import filterPeersByType from '$lib/filterPeersByType';
	import Receiver from '$components/Receiver.svelte';

	const peers: SvelteMap<string, ClientMetadata> = getContext('peers');
	const cameras = $derived(filterPeersByType(peers, 'camera'));
</script>

<div class="relative mx-auto flex h-svh max-w-3xl flex-col px-2 py-2">
	{#each cameras as peer (peer.uuid)}
		<Receiver {peer} />
	{/each}
</div>
