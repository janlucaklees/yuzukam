<script module>
	declare const __APP_VERSION__: string;
</script>

<script lang="ts">
	import '../app.css';

	import { setContext } from 'svelte';

	import createPersistentRune from '$stores/persistentStore';
	import { uuid } from '$stores/uuid';

	import SignalingSocket from '$lib/SignalingSocket';
	import CloseCodes from '../types/CloseCodes';

	let { children } = $props();

	let isConnected = $state(false);

	//
	// Get values from the local storage.
	let reloadCount = createPersistentRune<number>('reloadCount', 0);

	// Establish connection to the signaling server and expose it to all children.
	const socket = new SignalingSocket(__APP_VERSION__, $uuid);
	setContext('socket', socket);

	// Reload the app if a version mismatch is detected.
	socket.on('close', (event) => {
		if (event.code === CloseCodes.VERSION_MISMATCH) {
			console.log('version mismatch');

			location.reload();
		}
	});

	// Reload the app once, if the socket gives an error. We only want to reload once, to update the
	// app. If that does not work, then we do not want to spam the server with reloads.
	socket.on('error', (error) => {
		if ($reloadCount === 0) {
			reloadCount.set($reloadCount + 1);
			location.reload();
		}

		console.error(error);
	});

	// Listen for confirmation through the server that the connection was established to render child
	// components.
	socket.onMessage('connection-confirmed', () => {
		reloadCount.set(0);
		isConnected = true;
	});
</script>

{#if isConnected}
	{@render children()}
{/if}
