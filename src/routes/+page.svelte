<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { v4 as uuidv4 } from 'uuid';
	import Screen from '$components/Screen.svelte';
	import ConnectionManager from '$lib/ConnectionManager';
	import createPersistentRune from '$stores/persistentStore';
	import { type ClientType, type ClientMetadata } from '$types/ClientMetadata';
	import BatteryService from '$lib/BatteryService';
	import { SettingsOutline, TvOutline, VideocamOutline } from 'svelte-ionicons';
	import ToggleButtonIcon from '$components/ToggleButtonIcon.svelte';

	//
	// Get settings from the local storage.
	let uuid = createPersistentRune<string>('uuid', uuidv4());
	let type = createPersistentRune<ClientType>('type', 'camera');
	let name = createPersistentRune<string>('name', 'Yuzukam');

	let isMenuOpen = false;

	//
	// Define global variables
	let localStream: MediaStream | undefined;
	const remoteStreams = new SvelteMap<string, MediaStream>();
	const remotePeers = new SvelteMap<string, ClientMetadata>();

	//
	// Init Code
	onMount(async () => {
		// Try getting battery metadata (only works in Chrome).
		const batteryService = await BatteryService.init();

		// Create the connection manager.
		const manager = new ConnectionManager({
			uuid: $uuid,
			type: $type,
			name: $name,
			batteryStatus: batteryService.getMetadata()
		});

		// Add all incoming remote streams to the reactive map, so they are displayed.
		manager.on('remote-stream', (peerUuid, stream) => remoteStreams.set(peerUuid, stream));
		manager.on('remote-peer', (peerUuid, metadata) => remotePeers.set(peerUuid, metadata));

		// Connect to all other peers by checking the type setting and proceeding accordingly.
		toggleLocalStream(manager);

		// Listen to changes to the client type and resetup all peer connections.
		type.subscribe(() => {
			toggleLocalStream(manager);
		});

		// Send metadata updates to all clients
		name.subscribe(() => {
			manager.setMetadata({ name: $name });
		});
		batteryService.on('levelchange', () => {
			manager.setMetadata({ batteryStatus: batteryService.getMetadata() });
		});
		batteryService.on('chargingchange', () => {
			manager.setMetadata({ batteryStatus: batteryService.getMetadata() });
		});
	});

	//
	// Defining functions
	async function toggleLocalStream(manager: ConnectionManager) {
		// TODO: Add debounce / mutex.
		if ($type === 'camera') {
			// Get the camera and mic stream.
			// TODO: Errorhandling; Show message, when media is not accessible.
			localStream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true
			});

			// Set the stream and reconnect to all peers.
			manager.setStream(localStream);
		} else if ($type === 'monitor') {
			if (localStream) {
				stopStream(localStream);
			}
			localStream = undefined;

			// Remove the stream and reconnects to all peers.
			manager.removeStream();
		}
	}

	function stopStream(stream: MediaStream) {
		stream.getTracks().forEach((t) => t.stop());
		stream.getTracks().forEach((t) => stream.removeTrack(t));
	}

	function toggleType(isEnabled: boolean) {
		type.set(isEnabled ? 'camera' : 'monitor');
	}
</script>

<div class="main relative mx-auto flex flex-col px-4 py-4">
	{#if localStream}
		<Screen mediaStream={localStream} name="You" class="min-h-0 rounded-lg" />
	{/if}

	{#if $type === 'camera'}
		<div class="connected-monitors flex flex-col gap-2">
			<!-- as a cmaera, we want t list all watching monitor peers. -->
			{#each remotePeers.values() as peer (peer.uuid)}
				{#if peer.type === 'monitor'}
					<div class="monitor bg-pink-200">
						{peer.name} is watching
					</div>
				{/if}
			{/each}
		</div>
	{:else}
		{#each remotePeers.values() as peer (peer.uuid)}
			<!-- Only show peers of the opposite type. --->
			<!-- As a camera I want to know who is watching. -->
			<!-- As a monitor I want to see all the cameras. -->
			{#if peer.type !== $type}
				{#if $type === 'monitor'}
					<Screen
						mediaStream={remoteStreams.get(peer.uuid)!}
						{...peer}
						class="min-h-0 rounded-lg"
					/>
				{:else}
					<div class="absolute top-2 left-6 rounded-full bg-pink-200 px-3 py-1 text-xs">
						{peer.name} is watching.
					</div>
				{/if}
			{/if}
		{/each}
	{/if}
</div>

<!-- Menu -->
<div class="fixed top-0 right-0 flex justify-center">
	<div class="flex h-14 min-w-14 items-center justify-center rounded-bl-full bg-pink-200">
		<div class="flex h-14 min-w-14 items-center justify-center pb-3 pl-3">
			<SettingsOutline onclick={() => (isMenuOpen = !isMenuOpen)} />
		</div>

		{#if isMenuOpen}
			<div class="flex h-14 items-center gap-4 bg-gray-200 pr-2 pl-4">
				<ToggleButtonIcon
					isInitialyEnabled={$type === 'camera'}
					onToggle={(isEnabled: boolean) => toggleType(isEnabled)}
					iconEnabled={VideocamOutline}
					iconDisabled={TvOutline}
					size={24}
					class="bg-transparent"
				/>

				<div class="flex overflow-clip rounded-lg bg-white outline-pink-200 focus-within:outline">
					<div class="bg-pink-50 py-2 pr-2 pl-4">Name:</div>
					<input type="text" class="px-4 py-2 focus:outline-none" bind:value={$name} />
				</div>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	@reference 'tailwindcss';

	:root {
		--max-screen-width: 768px;
	}

	.main {
		max-width: var(--max-screen-width);
		height: 100vh;
	}

	@media screen and (orientation: landscape) and (max-width: 768px) {
		.connected-monitors {
			@apply absolute top-14 left-6;

			.monitor {
				@apply rounded-full px-3 py-1 text-xs;
			}
		}
	}

	@media screen and (orientation: portrait), (min-width: 769px) {
		.connected-monitors {
			@apply mt-2;

			.monitor {
				@apply rounded-lg px-3 py-1 text-sm;
			}
		}
	}
</style>
