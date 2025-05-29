<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import SignalingSocket from '$lib/SignalingSocket';
	import PeerConnectionHandler from '$lib/PeerConnectionHandler';
	import Screen from '$components/Screen.svelte';

	//
	// Props
	export let uuid: string;
	export let stream: MediaStream;

	//
	// Global variables
	const peers = new SvelteMap<string, PeerConnectionHandler>();
	const streams = new SvelteMap<string, MediaStream>();

	//
	// Setup signaling connection.
	const socket = new SignalingSocket(uuid);
	socket.onMessage('introduction', (message) => {
		const peerUuid = message.sender;

		// For broadcasted introductions, send one back so the sender gets to know us as well.
		if (message.recipient === 'all') {
			socket.sendMessage(peerUuid, 'introduction', {});
		}

		//
		// Reconnecting
		let handler = peers.get(peerUuid);

		// Close the old connection handler.
		handler?.close();

		// Create new handler and replace the old one with it.
		handler = new PeerConnectionHandler(socket.createChannel(peerUuid));
		peers.set(message.sender, handler);

		handler.onStream((stream) => {
			streams.set(peerUuid, stream);
		});
		handler.addStream(stream);

		// Use local compare on the clients uuids to determine who initiates the rtc peer conenction.
		if (uuid.localeCompare(peerUuid) === 1) {
			handler.call();
		}
	});

	//
	// Send introduction to all peers
	socket.on('open', () => {
		socket.sendMessage('all', 'introduction', {});
	});
</script>

<div>
	<div>Peers:</div>
	<div>
		<ul>
			{#each peers.entries() as [uuid] (uuid)}
				<li>
					<div>PeerUuid: {uuid}</div>
					{#if streams.has(uuid)}
						<div>
							Id: {streams.get(uuid).id}
							<Screen mediaStream={streams.get(uuid)} />
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
</div>
