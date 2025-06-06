import SignalingSocket from '$lib/SignalingSocket';
import PeerConnectionHandler from '$lib/PeerConnectionHandler';
import EventSystem from '$lib/EventSystem';
import type { ClientMetadata } from '$types/ClientMetadata';
import type { ConnectionManagerEventMap } from '$types/ConnectionManagerEvent';
import type { Callback } from '$types/Callback';

export default class ConnectionManager {
	private socket: SignalingSocket;
	private stream: MediaStream | undefined;

	private connections = new Map<string, PeerConnectionHandler>();
	private eventSystem = new EventSystem();

	constructor(private metadata: ClientMetadata) {
		// Create a connection to the signaling server.
		this.socket = new SignalingSocket(this.metadata.uuid);

		// Listen for incoming introductions from other peers.
		this.socket.onMessage('introduction', (message) => {
			// Reply to any broadcasted introduction with a directed one.
			if (message.recipient === 'all') {
				this.socket.sendMessage(message.sender, 'introduction', this.metadata);
			}

			// Establish RTCPeerConnection with the peer.
			this.establishPeerConnection(message.sender);

			this.eventSystem.dispatch('peer-connected', [message.sender, message.payload]);
		});

		this.socket.onMessage('metadata', (message) => {
			this.eventSystem.dispatch('peer-metadata', [message.sender, message.payload]);
		});

		// Listen for incoming introductions from other peers.
		this.socket.onMessage('client-disconnected', (message) => {
			this.eventSystem.dispatch('peer-disconnected', [message.payload.uuid]);

			// Establish RTCPeerConnection with the peer.
			this.closeConnection(message.payload.uuid);
		});
	}

	public setMetadata(metadata: Partial<ClientMetadata>) {
		this.metadata = Object.assign({}, this.metadata, metadata);

		this.socket.sendMessage('all', 'metadata', this.metadata);
	}

	public setStream(stream: MediaStream) {
		this.stream = stream;

		// Reconnect, to reflect changes to all peers.
		this.start();
	}

	public removeStream() {
		this.stream = undefined;

		// Reconnect, to reflect changes to all peers.
		this.start();
	}

	public start() {
		// Broadcast introduction to all peers.
		// Peers will reply with directed introduction and thus trigger the process of establishing RTCPeerConnections.
		this.socket.sendMessage('all', 'introduction', this.metadata);
	}

	public stop() {
		// Close all peer connections.
		this.connections.forEach((connection) => connection.close());

		// Close the connection to the signaling server
		this.socket.close();

		// Discard the media stream.
		this.stream = undefined;
	}

	private closeConnection(peerUuid: string) {
		this.connections.get(peerUuid)?.close();
	}

	private establishPeerConnection(peerUuid: string) {
		// Clean up any open connections
		this.closeConnection(peerUuid);

		// Create a new connection handler and save it to the list of all handlers.
		const connection = new PeerConnectionHandler(this.socket.createChannel(peerUuid));
		this.connections.set(peerUuid, connection);

		// Set handler mode to either send and receive, or just receive.
		if (this.stream) {
			connection.setToTransceive(this.stream);
		} else {
			connection.setToReceive();
		}

		// Communicate
		connection.onRemoteStream((stream) =>
			this.eventSystem.dispatch('remote-stream', [peerUuid, stream])
		);

		// This uuid comparison decides which peer initiates the call.
		// The other peer will just wait to receive it.
		if (this.metadata.uuid.localeCompare(peerUuid) === 1) {
			connection.call();
		}
	}

	on<K extends keyof ConnectionManagerEventMap>(
		type: K,
		callback: Callback<ConnectionManagerEventMap[K]>
	) {
		this.eventSystem.on(type, callback);
	}
}
