<script lang="ts">
	import { onMount, onDestroy, getContext } from 'svelte';

	import { type ClientMetadata } from '$types/ClientMetadata';

	import type SignalingSocket from '$lib/SignalingSocket';
	import PeerConnectionHandler from '$lib/PeerConnectionHandler';
	import type SignalingChannel from '$lib/SignalingChannel';

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

	onMount(() => {
		channel = socket.createChannel(peer.uuid);
		connection = new PeerConnectionHandler(channel);
		connection.setToTransmit(stream);
		connection.call();
	});

	onDestroy(() => {
		connection?.close();
		channel?.close();
	});
</script>

<div class="monitor bg-pink-200">
	{peer.name} is watching
</div>

<style lang="scss">
	@reference 'tailwindcss';

	@media screen and (orientation: landscape) and (max-width: 768px) {
		.monitor {
			@apply rounded-full px-3 py-1 text-xs;
		}
	}

	@media screen and (orientation: portrait), (min-width: 769px) {
		.monitor {
			@apply rounded-lg px-3 py-1 text-sm;
		}
	}
</style>
