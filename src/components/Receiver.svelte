<script lang="ts">
	import { onMount, onDestroy, getContext } from 'svelte';
	import { ContractOutline, ExpandOutline, VolumeHigh, VolumeMute } from 'svelte-ionicons';

	import { type ClientMetadata } from '$types/ClientMetadata';

	import type SignalingSocket from '$lib/SignalingSocket';
	import PeerConnectionHandler from '$lib/PeerConnectionHandler';
	import type SignalingChannel from '$lib/SignalingChannel';

	import BatteryIndicator from '$components/BatteryIndicator.svelte';
	import ToggleButtonIcon from '$components/ToggleButtonIcon.svelte';
	import ConnectionStateIndicator from '$components/ConnectionStateIndicator.svelte';

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
	let connectionState: RTCPeerConnectionState;
	let remoteStream: MediaStream | undefined;
	let isMuted = true;
	let rootElement: HTMLElement;

	onMount(() => {
		channel = socket.createChannel(peer.uuid);
		connection = new PeerConnectionHandler(channel);
		connection.setToReceive();

		connection.on('stream', (stream) => {
			remoteStream = stream;
		});

		connection.on('connectionstatechange', (newState) => {
			connectionState = newState;
		});
	});

	onDestroy(() => {
		connection?.close();
		channel?.close();
	});

	function toggleFullscreen(isEnabled: boolean) {
		if (isEnabled) {
			rootElement.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	}

	function srcObject(node: HTMLVideoElement, stream: MediaStream) {
		node.srcObject = stream;
		return {
			update(nextStream: MediaStream) {
				node.srcObject = nextStream;
			}
		};
	}
</script>

{#if remoteStream}
	<div class="relative min-h-0 overflow-clip rounded-lg" bind:this={rootElement}>
		{#if remoteStream}
			<video
				use:srcObject={remoteStream}
				class="h-full w-full object-cover"
				autoplay
				muted={isMuted}
			></video>
		{:else}
			No signal!
		{/if}

		<div
			class="absolute top-2 left-2 flex items-center gap-2 rounded-full bg-pink-200 py-1 pr-3 pl-2 text-xs"
		>
			<ConnectionStateIndicator state={connectionState} />

			{peer.name}

			{#if peer.batteryStatus}
				<BatteryIndicator
					level={peer.batteryStatus.level}
					charging={peer.batteryStatus.isCharging}
				/>
			{/if}
		</div>

		<div class="absolute right-2 bottom-2 flex gap-2">
			{#if remoteStream}
				<ToggleButtonIcon
					isInitialyEnabled={false}
					onToggle={(isEnabled: boolean) => (isMuted = !isEnabled)}
					iconEnabled={VolumeHigh}
					iconDisabled={VolumeMute}
					size={18}
				/>
				<ToggleButtonIcon
					isInitialyEnabled={false}
					onToggle={(isEnabled: boolean) => toggleFullscreen(isEnabled)}
					iconEnabled={ContractOutline}
					iconDisabled={ExpandOutline}
					size={18}
				/>
			{/if}
		</div>
	</div>
{/if}
