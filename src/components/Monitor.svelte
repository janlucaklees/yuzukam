<script lang="ts">
	import { type ClientMetadata } from '$types/ClientMetadata';
	import Receiver from './Receiver.svelte';

	export let cameras: ClientMetadata[];
</script>

<div class="main relative mx-auto flex flex-col px-4 py-4">
	{#each cameras as peer (peer.uuid)}
		<Receiver {peer} />
	{:else}
		<div class="flex flex-col items-center h-full justify-center">
			<img
				src="/yuzukam_hiding.png"
				class="w-auto h-56"
				alt="A baby hiding their face, pretending not to be there."
			/>
			<div class="text-2xl -mt-4 mb-6">No babys here...</div>
			<div class="bg-yellow-200 rounded-xl px-4 py-3 text-center">
				Open this web page on another device and use it to keep an eye on your little one.
			</div>
		</div>
	{/each}
</div>

<style lang="scss">
	@reference 'tailwindcss';

	:root {
		--max-screen-width: 768px;
	}

	.main {
		max-width: var(--max-screen-width);
		height: 100vh;
	}
</style>
