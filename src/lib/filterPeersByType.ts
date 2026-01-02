import type { ClientMetadata, ClientType } from '$types/ClientMetadata';
import type { SvelteMap } from 'svelte/reactivity';

export default function filterPeersByType(
	peers: SvelteMap<string, ClientMetadata>,
	type: ClientType
) {
	return Array.from(peers.values().filter((peer) => peer.type === type));
}
