<script lang="ts">
	import { getContext, onDestroy, onMount } from 'svelte';
	import type { SvelteMap } from 'svelte/reactivity';

	import { selectedVideoInput } from '$stores/selectedVideoInput';
	import { selectedAudioInput } from '$stores/selectedAudioInput';

	import UserMediaService from '$lib/UserMediaService';
	import filterPeersByType from '$lib/filterPeersByType';
	import pickOne from '$lib/pickOne';

	import { type ClientMetadata } from '$types/ClientMetadata';

	import Transmitter from '$components/Transmitter.svelte';
	import LocalScreen from '$components/LocalScreen.svelte';
	import Message from '$components/Message.svelte';

	const peers: SvelteMap<string, ClientMetadata> = getContext('peers');
	const monitors = $derived(filterPeersByType(peers, 'monitor'));

	let stream: MediaStream | undefined = $state();
	let error: string | undefined = $state();
	let userMediaService: UserMediaService | undefined;

	onMount(async () => {
		userMediaService = new UserMediaService({
			audio: { deviceId: $selectedAudioInput },
			video: { deviceId: $selectedVideoInput }
		});

		userMediaService.on('stream', (newStream) => {
			stream = newStream;
		});

		userMediaService.on('error', (newError) => {
			if (newError instanceof Error) {
				error = newError.message;
			} else if (typeof newError === 'string') {
				error = newError;
			} else {
				console.error(newError);
			}
		});

		$effect(() => {
			userMediaService?.updateConstraints({
				audio: { deviceId: $selectedAudioInput },
				video: { deviceId: $selectedVideoInput }
			});
		});
	});

	onDestroy(() => {
		userMediaService?.destroy();
		userMediaService = undefined;
		stream = undefined;
	});
</script>

{#if error}
	<Message
		imageSource="yuzu_confused.png"
		message={pickOne([
			'Huh? Something’s being silly with the camera...',
			'Uhh... something’s being weird with the camera.',
			'Hmm... something went wrong with the camera'
		])}
		hint={`An error occured. Maybe this message will help you: ${error}`}
	/>
{:else}
	<div class="relative mx-auto flex h-svh max-w-3xl flex-col px-2 py-2">
		<LocalScreen mediaStream={stream} name="You" />

		{#if stream}
			<div class="connected-monitors flex flex-col gap-2">
				{#each monitors as peer (peer.uuid)}
					<Transmitter {peer} {stream} />
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	@reference 'tailwindcss';

	.connected-monitors {
		@apply mt-2;
	}

	@media screen and (orientation: landscape) and (max-height: 768px) {
		.connected-monitors {
			@apply absolute top-12 left-4 mt-0;
		}
	}
</style>
