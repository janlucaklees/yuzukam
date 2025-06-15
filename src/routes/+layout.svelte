<script module>
	declare const __APP_VERSION__: string;
</script>

<script lang="ts">
	import '../app.css';

	import { setContext } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';

	import createPersistentRune from '$stores/persistentStore';

	import SignalingSocket from '$lib/SignalingSocket';
	import CloseCodes from '../types/CloseCodes';

	let { children } = $props();

	let isConnected = $state(false);

	// Establish connection to the signaling server and expose it to all children.
	let uuid = createPersistentRune<string>('uuid', uuidv4());
	const socket = new SignalingSocket(__APP_VERSION__, $uuid);
	setContext('socket', socket);

	// Reload the app if a version mismatch is detected.
	socket.on('close', (event) => {
		if (event.code === CloseCodes.VERSION_MISMATCH) {
			console.log('version mismatch');

			location.reload();
		}
	});

	// Listen for confirmation through the server that the connection was established to render child
	// components.
	socket.onMessage('connection-confirmed', () => {
		isConnected = true;
	});
</script>

{#if isConnected}
	{@render children()}
{/if}
