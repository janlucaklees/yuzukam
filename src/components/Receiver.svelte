<script lang="ts">
	import { onMount, onDestroy, getContext } from 'svelte';

	import { type ClientMetadata } from '$types/ClientMetadata';

	import type SignalingSocket from '$lib/SignalingSocket';
	import PeerConnectionHandler from '$lib/PeerConnectionHandler';
	import type SignalingChannel from '$lib/SignalingChannel';

	import RemoteScreen from '$components/RemoteScreen.svelte';

	//
	// Props
	export let peer: ClientMetadata;

	//
	// Context
	const socket: SignalingSocket = getContext('socket');

	//
	// Globals
	let channel: SignalingChannel | undefined;
	let connection: PeerConnectionHandler | undefined;
	let remoteStream: MediaStream | undefined;

	onMount(() => {
		channel = socket.createChannel(peer.uuid);
		connection = new PeerConnectionHandler(channel);
		connection.setToReceive();
		connection.onRemoteStream((stream) => {
			remoteStream = stream;
		});
	});

	onDestroy(() => {
		connection?.close();
		channel?.close();
	});
</script>

{#if remoteStream}
	<RemoteScreen mediaStream={remoteStream} {...peer} class="min-h-0 rounded-lg" />
{/if}
