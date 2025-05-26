<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	import { v4 as uuidv4 } from 'uuid';

	import MessageType from '$types/MessageType';

	import getOrSetLocalStorageValue from '$lib/getOrSetLocalStorageValue';

	// Get settings from the local storage
	const localUuid = getOrSetLocalStorageValue('localUuid', uuidv4());

	// Define global variables
	const peers = new SvelteSet<string>();

	let socket: WebSocket | undefined;
	let connectionStatus = 'initial';

	onMount(async () => {
		connect();
	});

	function connect() {
		socket?.close(4111, 'Connection closed: Reconnection triggered.');

		// recreating socket...
		socket = new WebSocket(
			`ws://${location.hostname}:${location.port}/api/connect?uuid=${localUuid}`
		);

		socket.addEventListener('open', () => {
			connectionStatus = 'connected';

			socket.send(
				JSON.stringify({
					sender: localUuid,
					recipient: 'all',
					subject: MessageType.Introduction,
					payload: {
						uuid: localUuid
					}
				})
			);
		});

		socket.addEventListener('message', (event) => {
			const message = JSON.parse(event.data);

			if ((message.subject = MessageType.Introduction)) {
				peers.add(message.sender);

				if (message.recipient === 'all') {
					socket.send(
						JSON.stringify({
							sender: localUuid,
							recipient: message.sender,
							subject: MessageType.Introduction,
							payload: {
								uuid: localUuid
							}
						})
					);
				}
			}
		});

		socket.addEventListener('close', (event) => {
			console.log('closed', event);

			connectionStatus = 'closed';

			if (event.code === 4499) {
				console.log('Not reconnecting, reason: ', event.reason);
				return;
			}

			if (event.code === 4111) {
				console.log('Not reconnecting, reason: ', event.reason);
				return;
			}

			console.log('Scheduling reconnect in 3000ms.');
			setTimeout(() => {
				console.log('Reconnecting...');
				connect();
			}, 3000);
		});

		socket.addEventListener('error', (error) => {
			console.log('error', error);

			connectionStatus = 'error';

			console.log('Scheduling reconnect in 3000ms.');
			setTimeout(() => {
				console.log('Reconnecting...');
				connect();
			}, 3000);
		});
	}
</script>

<table>
	<tbody>
		<tr>
			<th>localUuid:</th>
			<td>{localUuid}</td>
		</tr>

		<tr>
			<th>connectionStatus:</th>
			<td>{connectionStatus}</td>
		</tr>

		<tr>
			<th>Peers:</th>
			<td>
				<ul>
					{#each Array.from(peers) as peer (peer)}
						<li>{peer}</li>
					{/each}
				</ul>
			</td>
		</tr>
	</tbody>
</table>
