<script lang="ts">
	import Message from '$components/Message.svelte';
	import pickOne from '$lib/pickOne';
	import cameraPermission from '$stores/cameraPermission.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(async () => {
		const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

		stream.getTracks().forEach((track) => track.stop());
	});
</script>

{#if cameraPermission.state === 'granted'}
	{@render children()}
{:else if cameraPermission.state === 'prompt'}
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
		hint="Please reset your camera and microphone permissions and reload this page."
	/>
{/if}
