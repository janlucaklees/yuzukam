<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { SettingsOutline, TvOutline, VideocamOutline } from 'svelte-ionicons';
	import { v4 as uuidv4 } from 'uuid';

	import createPersistentRune from '$stores/persistentStore';
	import { type ClientMetadata, type ClientType } from '$types/ClientMetadata';

	import ToggleButtonIcon from '$components/ToggleButtonIcon.svelte';
	import Camera from '$components/Camera.svelte';
	import Monitor from '$components/Monitor.svelte';
	import SignalingSocket from '$lib/SignalingSocket';
	import BatteryService from '$lib/BatteryService';
	import PeerManager from '$lib/PeerManager';
	import { SvelteMap } from 'svelte/reactivity';

	//
	// Get settings from the local storage.
	let uuid = createPersistentRune<string>('uuid', uuidv4());
	let type = createPersistentRune<ClientType>('type', 'camera');
	let name = createPersistentRune<string>('name', 'Yuzukam');

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

	let isMenuOpen = false;

	function toggleType(isEnabled: boolean) {
		type.set(isEnabled ? 'camera' : 'monitor');
	}

	function filterPeersByType(peers: SvelteMap<string, ClientMetadata>, type: ClientType) {
		return Array.from(peers.values().filter((peer) => peer.type === type));
	}
</script>

{#if $type === 'camera'}
	<Camera monitors={filterPeersByType(peers, 'monitor')} />
{:else}
	<Monitor cameras={filterPeersByType(peers, 'camera')} />
{/if}

<!-- Settings -->
<div class="fixed top-0 right-0 flex w-screen justify-end">
	<button
		type="button"
		on:click={() => (isMenuOpen = !isMenuOpen)}
		class="flex h-14 w-14 flex-none cursor-pointer items-center justify-center rounded-bl-full bg-yellow-200 pb-3 pl-3"
	>
		<SettingsOutline />
	</button>

	{#if isMenuOpen}
		<div class="flex h-14 min-w-0 shrink items-center gap-4 bg-gray-300 pr-2 pl-4">
			<ToggleButtonIcon
				isInitialyEnabled={$type === 'camera'}
				onToggle={(isEnabled: boolean) => toggleType(isEnabled)}
				iconEnabled={VideocamOutline}
				iconDisabled={TvOutline}
				size={24}
				class="flex-none !bg-yellow-200"
			/>

			<div
				class="flex min-w-0 shrink overflow-clip rounded-lg bg-white outline-yellow-400 focus-within:outline-4"
			>
				<div class="bg-yellow-200 py-2 pr-2 pl-4">Name:</div>
				<input type="text" class="min-w-0 shrink px-4 py-2 focus:outline-none" bind:value={$name} />
			</div>
		</div>
	{/if}
</div>
