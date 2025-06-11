<script lang="ts">
	import { type ClientMetadata } from '$types/ClientMetadata';
	import Receiver from './Receiver.svelte';

	export let cameras: ClientMetadata[];
</script>

<div class="main relative mx-auto flex flex-col px-4 py-4">
	{#each cameras as peer (peer.uuid)}
		<Receiver {peer} />
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
