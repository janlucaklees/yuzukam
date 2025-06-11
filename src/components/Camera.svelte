<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import UserMediaService from '$lib/UserMediaService';
	import { type ClientMetadata } from '$types/ClientMetadata';
	import Transmitter from './Transmitter.svelte';
	import LocalScreen from './LocalScreen.svelte';

	export let monitors: ClientMetadata[];

	let stream: MediaStream | undefined;
	let userMediaService: UserMediaService | undefined;

	onMount(async () => {
		userMediaService = new UserMediaService();

		userMediaService.on('stream', (newStream) => {
			stream = newStream;
		});
	});

	onDestroy(() => {
		userMediaService?.destroy();
		userMediaService = undefined;
		stream = undefined;
	});
</script>

<div class="main relative mx-auto flex flex-col px-4 py-4">
	{#if stream}
		<LocalScreen mediaStream={stream} name="You" class="min-h-0 rounded-lg" />

		<div class="connected-monitors flex flex-col gap-2">
			{#each monitors as peer (peer.uuid)}
				<Transmitter {peer} {stream} />
			{/each}
		</div>
	{/if}
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

	@media screen and (orientation: landscape) and (max-width: 768px) {
		.connected-monitors {
			@apply absolute top-14 left-6;
		}
	}

	@media screen and (orientation: portrait), (min-width: 769px) {
		.connected-monitors {
			@apply mt-2;
		}
	}
</style>
