<script lang="ts">
	import { type ClientMetadata } from '$types/ClientMetadata';
	import Message from '$components/Message.svelte';
	import Receiver from './Receiver.svelte';
	import pickOne from '$lib/pickOne';

	export let cameras: ClientMetadata[];
</script>

<div class="main relative mx-auto flex flex-col px-4 py-4">
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

<style>
	@reference 'tailwindcss';

	:root {
		--max-screen-width: 768px;
	}

	.main {
		max-width: var(--max-screen-width);
		height: 100vh;
	}
</style>
