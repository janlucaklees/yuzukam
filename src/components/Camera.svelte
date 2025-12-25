<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import UserMediaService from '$lib/UserMediaService';
	import { type ClientMetadata } from '$types/ClientMetadata';
	import Transmitter from './Transmitter.svelte';
	import LocalScreen from './LocalScreen.svelte';
	import Message from '$components/Message.svelte';
	import pickOne from '$lib/pickOne';
	import cameraPermission from '$stores/cameraPermission.svelte';

	interface Props {
		monitors: ClientMetadata[];
	}

	let { monitors }: Props = $props();

	let stream: MediaStream | undefined = $state();
	let error: string | undefined = $state();
	let userMediaService: UserMediaService | undefined;

	onMount(async () => {
		userMediaService = new UserMediaService();

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
	});

	onDestroy(() => {
		userMediaService?.destroy();
		userMediaService = undefined;
		stream = undefined;
	});
</script>

{#if cameraPermission.state === 'prompt'}
	<Message
		imageSource="yuzu_covering_eyes.png"
		message={pickOne([
			'Can you tap the button so I can look?',
			'Umm... can you help me see?',
			"Peekaboo! I can't see your little one yet."
		])}
		hint="Please click “Allow while visiting the site” to give access to your camera and microphone."
	/>
{:else if cameraPermission.state === 'denied'}
	<Message
		imageSource="yuzu_pouting.png"
		message={pickOne([
			'Oops! The camera is shy.',
			'Looks like you told the camera nope!',
			'Eep! The camera says no!',
			'Oh no... the camera told me no.'
		])}
		hint="Please reset your camera permissions and reload this page."
	/>
{:else if error}
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
