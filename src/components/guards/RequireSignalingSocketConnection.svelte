<script lang="ts">
	import { getContext } from 'svelte';

	import SignalingSocket from '$lib/SignalingSocket';

	let { children } = $props();

	let isConnected = $state(false);

	const socket: SignalingSocket = getContext('socket');

	socket.onMessage('connection-confirmed', () => {
		isConnected = true;
	});
</script>

{#if isConnected}
	{@render children()}
{/if}
<!-- TODO: Add fade-in loading animation -->
