<script lang="ts">
	import { onMount, getContext, setContext } from 'svelte';

	import { uuid } from '$stores/uuid';
	import { type } from '$stores/type';
	import { name } from '$stores/name';

	import { type ClientMetadata } from '$types/ClientMetadata';

	import SignalingSocket from '$lib/SignalingSocket';
	import PeerManager from '$lib/PeerManager';
	import { SvelteMap } from 'svelte/reactivity';
	import battery from '$stores/battery.svelte';

	const { children } = $props();

	const peers = new SvelteMap<string, ClientMetadata>();
	setContext('peers', peers);

	const socket: SignalingSocket = getContext('socket');

	onMount(async () => {
		const peerManager = new PeerManager(socket, {
			uuid: $uuid,
			type: $type,
			name: $name,
			batteryStatus: battery.isSupported ? $state.snapshot(battery) : undefined
		});

		//
		// Update peer list
		// TODO: This is kind of redundant with what the peerManager does.
		// We don't need to listen to the peer-connected event, as the metadata event is also fired for new peers.
		peerManager.on('peer-metadata', (peerUuid, metadata) => peers.set(peerUuid, metadata));
		peerManager.on('peer-disconnected', (peerUuid) => peers.delete(peerUuid));

		//
		// Send metadata updates to all clients
		type.subscribe(() => {
			peerManager.setMetadata({ type: $type });
		});
		name.subscribe(() => {
			peerManager.setMetadata({ name: $name });
		});
		$effect(() => {
			peerManager.setMetadata({
				batteryStatus: battery.isSupported ? $state.snapshot(battery) : undefined
			});
		});

		//
		// Connect to other peers
		peerManager.sendIntroduction();
	});
</script>

{@render children()}
