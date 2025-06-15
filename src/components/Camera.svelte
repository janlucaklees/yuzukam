<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import UserMediaService from '$lib/UserMediaService';
	import { type ClientMetadata } from '$types/ClientMetadata';
	import Transmitter from './Transmitter.svelte';
	import LocalScreen from './LocalScreen.svelte';
	import Message from '$components/Message.svelte';
	import pickOne from '$lib/pickOne';

	export let monitors: ClientMetadata[];

	let permissionState: PermissionState | undefined;
	let stream: MediaStream | undefined;
	let error: string;
	let userMediaService: UserMediaService | undefined;

	onMount(async () => {
		userMediaService = new UserMediaService();

		userMediaService.on('permissionstate', (newPermissionState) => {
			permissionState = newPermissionState;
		});

		userMediaService.on('stream', (newStream) => {
			stream = newStream;
		});

		userMediaService.on('error', (newError) => {
			if (error instanceof Error) {
				error = error.message;
			} else {
				error = newError;
			}
		});
	});

	onDestroy(() => {
		userMediaService?.destroy();
		userMediaService = undefined;
		stream = undefined;
	});
</script>

<div class="main relative mx-auto flex flex-col px-4 py-4">
	{#if permissionState === 'prompt'}
		<Message
			imageSource="yuzu_covering_eyes.png"
			message={pickOne([
				'Can you tap the button so I can look?',
				'Umm... can you help me see?',
				"Peekaboo! I can't see your little one yet."
			])}
			hint="Please click “Allow while visiting the site” to give access to your camera and microphone."
		/>
	{:else if permissionState === 'denied'}
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
			hint={`An error occured. Maybe the message will help you: ${error}`}
		/>
	{:else}
		<LocalScreen mediaStream={stream} name="You" />
	{/if}

	{#if stream}
		<div class="connected-monitors flex flex-col gap-2">
			{#each monitors as peer (peer.uuid)}
				<Transmitter {peer} {stream} />
			{/each}
		</div>
	{/if}
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
