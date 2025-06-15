<script lang="ts">
	import { onMount, onDestroy, getContext } from 'svelte';

	import { type ClientMetadata } from '$types/ClientMetadata';

	import type SignalingSocket from '$lib/SignalingSocket';
	import PeerConnectionHandler from '$lib/PeerConnectionHandler';
	import type SignalingChannel from '$lib/SignalingChannel';

	import ConnectionStateIndicator from '$components/ConnectionStateIndicator.svelte';

	//
	// Props
	export let peer: ClientMetadata;
	export let stream: MediaStream;

	//
	// Context
	const socket: SignalingSocket = getContext('socket');

	//
	// Globals
	let channel: SignalingChannel | undefined;
	let connection: PeerConnectionHandler | undefined;
	let connectionState: RTCPeerConnectionState;

	onMount(() => {
		channel = socket.createChannel(peer.uuid);
		connection = new PeerConnectionHandler(channel);
		connection.setToTransmit(stream);
		connection.call();

		connection.on('connectionstatechange', (newState) => {
			connectionState = newState;
		});
	});

	onDestroy(() => {
		connection?.close();
		channel?.close();
	});
</script>

<div class="monitor flex items-center gap-2 bg-yellow-200">
	<ConnectionStateIndicator state={connectionState} />

	{peer.name} is watching
</div>

<style>
	@reference 'tailwindcss';

	.monitor {
		@apply rounded-lg px-3 py-1 text-sm;
	}

	@media screen and (orientation: landscape) and (max-height: 768px) {
		.monitor {
			@apply rounded-full py-1 pr-3 pl-2 text-xs;
		}
	}
</style>
