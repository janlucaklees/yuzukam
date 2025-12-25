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
	interface Props {
		peer: ClientMetadata;
	}
	let { peer }: Props = $props();

	//
	// Context
	const socket: SignalingSocket = getContext('socket');

	//
	// Globals
	let channel: SignalingChannel | undefined;
	let connection: PeerConnectionHandler | undefined;
	let connectionState: RTCPeerConnectionState | undefined = $state();
	let remoteStream: MediaStream | undefined = $state();
	let isMuted = $state(true);
	let screen: HTMLElement | undefined = $state();

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
	{#snippet info()}
		<ConnectionStateIndicator state={connectionState} />

		{peer.name}

		{#if peer.batteryStatus}
			<BatteryIndicator
				level={peer.batteryStatus.level}
				isCharging={peer.batteryStatus.isCharging}
			/>
		{/if}
	{/snippet}
	{#snippet controls()}
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
	{/snippet}
</Screen>
