<script lang="ts">
	import { onMount, getContext, setContext } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	import { uuid } from '$stores/uuid';
	import { type } from '$stores/type';
	import { name } from '$stores/name';

	import { type ClientMetadata } from '$types/ClientMetadata';

	import SignalingSocket from '$lib/SignalingSocket';
	import PeerManager from '$lib/PeerManager';
	import BatteryMonitor, { type BatteryMonitorState } from '$lib/BatteryMonitor';

	const { children } = $props();

	const peers = new SvelteMap<string, ClientMetadata>();
	setContext('peers', peers);

	const socket: SignalingSocket = getContext('socket');

	let batteryMonitor: BatteryMonitor | undefined;
	let peerManager: PeerManager | undefined;

	onMount(() => {
		batteryMonitor = new BatteryMonitor();

		peerManager = new PeerManager(socket, {
			uuid: $uuid,
			type: $type,
			name: $name,
			batteryStatus: mapBatteryStatus(batteryMonitor.getState())
		});

		//
		// Update peer list
		// TODO: This is kind of redundant with what the peerManager does.
		// We don't need to listen to the peer-connected event, as the metadata event is also fired for new peers.
		peerManager.on('peer-metadata', (peerUuid, metadata) => peers.set(peerUuid, metadata));
		peerManager.on('peer-disconnected', (peerUuid) => peers.delete(peerUuid));

		//
		// Send metadata updates to all clients
		let unsubscribeType = type.subscribe(() => {
			peerManager!.setMetadata({ type: $type });
		});
		let unsubscribeName = name.subscribe(() => {
			peerManager!.setMetadata({ name: $name });
		});

		batteryMonitor.on('change', () => {
			peerManager!.setMetadata({ batteryStatus: mapBatteryStatus(batteryMonitor!.getState()) });
		});

		peerManager.initialize();

		//
		// Connect to other peers
		peerManager.sendIntroduction();

		//
		// Late initialization of the BatteryMonitor to not block the peer manager from connecting to peers.
		void batteryMonitor.initialize();

		//
		// Return cleanup method
		return (): void => {
			unsubscribeType();

			unsubscribeName();

			void batteryMonitor!.destroy();
			batteryMonitor = undefined;

			peerManager!.destroy();
			peerManager = undefined;
		};
	});

	function mapBatteryStatus(
		batteryMonitorState: BatteryMonitorState
	): ClientMetadata['batteryStatus'] {
		if (!batteryMonitorState.isSupported) {
			return undefined;
		}

		return {
			isCharging: batteryMonitorState.isCharging,
			level: batteryMonitorState.level
		};
	}
</script>

{@render children()}
