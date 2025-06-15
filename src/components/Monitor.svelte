<script lang="ts">
	import { type ClientMetadata } from '$types/ClientMetadata';
	import Message from '$components/Message.svelte';
	import Receiver from './Receiver.svelte';

	export let cameras: ClientMetadata[];
</script>

<div class="main relative mx-auto flex flex-col px-4 py-4">
	{#each cameras as peer (peer.uuid)}
		<Receiver {peer} />
	{:else}
		<Message
			imageSource="yuzukam_hiding.png"
			message="No babys here..."
			hint="Open this web page on another device and use it to keep an eye on your little one."
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
