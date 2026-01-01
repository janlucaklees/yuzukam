<script lang="ts">
	import type { Snippet } from 'svelte';
	import Message from '$components/Message.svelte';
	import pickOne from '$lib/pickOne';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
	let isOnline: boolean = $state(window.navigator.onLine);

	window.addEventListener('online', () => {
		isOnline = true;
	});

	window.addEventListener('offline', () => {
		isOnline = false;
	});
</script>

{#if isOnline}
	{@render children()}
{:else}
	<Message
		imageSource="yuzu_disconnected.png"
		message={pickOne([
			'Yikes! The internet ran off!',
			'Hello? Internet? Where’d you go?',
			'Uh-oh… Internet is hiding again!'
		])}
		hint="There’s no internet connection. Please check your Wi-Fi or network settings."
	/>
{/if}
