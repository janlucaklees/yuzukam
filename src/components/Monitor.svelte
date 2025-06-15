<script lang="ts">
	import { type ClientMetadata } from '$types/ClientMetadata';
	import Message from '$components/Message.svelte';
	import Receiver from './Receiver.svelte';
	import pickOne from '$lib/pickOne';

	export let cameras: ClientMetadata[];
</script>

<div class="relative mx-auto flex h-svh max-w-3xl flex-col px-2 py-2">
	{#each cameras as peer (peer.uuid)}
		<Receiver {peer} />
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
	{/each}
</div>
