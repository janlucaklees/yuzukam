<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { v4 as uuidv4 } from 'uuid';
	import Screen from '$components/Screen.svelte';
	import ConnectionManager from '$lib/ConnectionManager';
	import createPersistentRune from '$stores/persistentStore';
	import { type ClientType, type ClientMetadata } from '$types/ClientMetadata';

	//
	// Get settings from the local storage.
	let uuid = createPersistentRune<string>('uuid', uuidv4());
	let type = createPersistentRune<ClientType>('type', 'camera');
	let name = createPersistentRune<string>('name', 'Yuzukam');

	//
	// Define global variables
	let localStream: MediaStream | undefined;
	const remoteStreams = new SvelteMap<string, MediaStream>();
	const remotePeers = new SvelteMap<string, ClientMetadata>();
	const manager = new ConnectionManager({
		uuid: $uuid,
		type: $type,
		name: $name
	});

	//
	// Init Code
	onMount(async () => {
		// Add all incoming remote streams to the reactive map, so they are displayed.
		manager.on('remote-stream', (peerUuid, stream) => remoteStreams.set(peerUuid, stream));
		manager.on('remote-peer', (peerUuid, metadata) => remotePeers.set(peerUuid, metadata));

		// Connect to all other peers by checking the type setting and proceeding accordingly.
		toggleLocalStream();

		// Listen to changes to the client type and resetup all peer connections.
		type.subscribe(() => {
			toggleLocalStream();
		});
		name.subscribe(() => {
			manager.setMetadata({ name: $name });
		});
	});

	//
	// Defining functions
	async function toggleLocalStream() {
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
</script>

<div>
	uuid:{$uuid}
</div>

<div>
	type: {$type}
</div>

<input
	type="checkbox"
	checked={$type === 'camera'}
	on:input={(event) => type.set(event.currentTarget.checked ? 'camera' : 'monitor')}
/>
<input type="text" bind:value={$name} />

local stream:
{#if localStream}
	<Screen mediaStream={localStream} />
{/if}

<hr />

Peers:
{#each remotePeers as [peerUuid, peerMetadata] (peerUuid)}
	Name: {peerMetadata.name}
	{#if $type === 'monitor' && remoteStreams.has(peerUuid)}
		<Screen mediaStream={remoteStreams.get(peerUuid)!} />
	{/if}
{/each}
