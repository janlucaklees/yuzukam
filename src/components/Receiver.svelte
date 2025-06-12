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
	import Screen from './Screen.svelte';

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
	let screen: HTMLElement;

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

	function toggleAudio(isEnabled: boolean) {
		isMuted = !isEnabled;
	}

	function toggleFullscreen(isEnabled: boolean) {
		if (isEnabled) {
			screen.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	}
</script>

<Screen stream={remoteStream} bind:root={screen} muted={isMuted}>
	<svelte:fragment slot="info">
		<ConnectionStateIndicator state={connectionState} />

		{peer.name}

		{#if peer.batteryStatus}
			<BatteryIndicator level={peer.batteryStatus.level} charging={peer.batteryStatus.isCharging} />
		{/if}
	</svelte:fragment>
	<svelte:fragment slot="controls">
		<ToggleButtonIcon
			isInitialyEnabled={false}
			onToggle={(isEnabled: boolean) => toggleAudio(isEnabled)}
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
	</svelte:fragment>
</Screen>
