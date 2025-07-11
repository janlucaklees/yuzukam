<script lang="ts">
	import { onMount, getContext } from 'svelte';

	import { uuid } from '$stores/uuid';
	import { type } from '$stores/type';
	import { name } from '$stores/name';

	import { type ClientMetadata, type ClientType } from '$types/ClientMetadata';

	import Camera from '$components/Camera.svelte';
	import Monitor from '$components/Monitor.svelte';
	import Settings from '$components/Settings.svelte';
	import SignalingSocket from '$lib/SignalingSocket';
	import BatteryService from '$lib/BatteryService';
	import PeerManager from '$lib/PeerManager';
	import { SvelteMap } from 'svelte/reactivity';

	const peers = new SvelteMap<string, ClientMetadata>();
	const socket: SignalingSocket = getContext('socket');

	onMount(async () => {
		const batteryService = await BatteryService.init();
		const peerManager = new PeerManager(socket, {
			uuid: $uuid,
			type: $type,
			name: $name,
			batteryStatus: batteryService.getMetadata()
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
		batteryService.on('levelchange', () => {
			peerManager.setMetadata({ batteryStatus: batteryService.getMetadata() });
		});
		batteryService.on('chargingchange', () => {
			peerManager.setMetadata({ batteryStatus: batteryService.getMetadata() });
		});

		//
		// Connect to other peers
		peerManager.sendIntroduction();
	});

	function filterPeersByType(peers: SvelteMap<string, ClientMetadata>, type: ClientType) {
		return Array.from(peers.values().filter((peer) => peer.type === type));
	}
</script>

{#if $type === 'camera'}
	<Camera monitors={filterPeersByType(peers, 'monitor')} />
{:else}
	<Monitor cameras={filterPeersByType(peers, 'camera')} />
{/if}

<Settings />
