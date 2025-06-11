import SignalingSocket from '$lib/SignalingSocket';
import EventSystem from '$lib/EventSystem';
import type { ClientMetadata } from '$types/ClientMetadata';
import type { Callback } from '$types/Callback';

interface PeerManagerEventMap {
	'peer-connected': [peerUuid: string, metadata: ClientMetadata];
	'peer-metadata': [peerUuid: string, metadata: ClientMetadata];
	'peer-disconnected': [peerUuid: string];
}

export default class PeerManager {
	private eventSystem = new EventSystem<PeerManagerEventMap>();
	private peers = new Map<string, ClientMetadata>();

	constructor(
		private readonly socket: SignalingSocket,
		private metadata: ClientMetadata
	) {
		// Listen for incoming introductions from other peers.
		this.socket.onMessage('introduction', (message) => {
			// Reply to any broadcasted introduction with a directed one.
			if (message.recipient === 'all') {
				this.socket.sendMessage(message.sender, 'introduction', this.metadata);
			}

			this.peers.set(message.sender, message.payload);

			this.eventSystem.dispatch('peer-connected', [message.sender, message.payload]);
			this.eventSystem.dispatch('peer-metadata', [message.sender, message.payload]);
		});

		this.socket.onMessage('metadata', (message) => {
			this.peers.set(message.sender, message.payload);

			this.eventSystem.dispatch('peer-metadata', [message.sender, message.payload]);
		});

		// Listen for incoming introductions from other peers.
		this.socket.onMessage('client-disconnected', (message) => {
			this.peers.delete(message.payload.uuid);

			this.eventSystem.dispatch('peer-disconnected', [message.payload.uuid]);
		});
	}

	public setMetadata(metadata: Partial<ClientMetadata>) {
		this.metadata = Object.assign({}, this.metadata, metadata);

		this.socket.sendMessage('all', 'metadata', this.metadata);
	}

	public sendIntroduction() {
		// Broadcast introduction to all peers.
		this.socket.sendMessage('all', 'introduction', this.metadata);
	}

	on<K extends keyof PeerManagerEventMap>(type: K, callback: Callback<PeerManagerEventMap[K]>) {
		this.eventSystem.on(type, callback);
	}
}
