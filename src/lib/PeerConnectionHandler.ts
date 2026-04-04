import SignalingChannel from '$lib/SignalingChannel';
import { EventSystem } from '$lib/event-system';
import type { Callback } from '$types/Callback';

interface PeerConnectionHandlerEventMap extends Record<string, unknown[]> {
	connectionstatechange: [state: RTCPeerConnectionState];
	stream: [stream: MediaStream];
}

export default class PeerConnectionHandler {
	private eventSystem = new EventSystem<PeerConnectionHandlerEventMap>();

	private channel: SignalingChannel;
	private connection: RTCPeerConnection;
	private bufferedIceCandidates: RTCIceCandidateInit[] = [];

	constructor(channel: SignalingChannel) {
		this.channel = channel;
		this.connection = new RTCPeerConnection();

		this.connection.addEventListener('icecandidate', (event) => {
			if (event.candidate) {
				this.channel.sendMessage('icecandidate', event.candidate);
			}
		});

		this.channel.onMessage('icecandidate', (message) => {
			if (this.connection.remoteDescription) {
				void this.connection.addIceCandidate(message.payload);
			} else {
				this.bufferedIceCandidates.push(message.payload);
			}
		});

		// Register listener for receiving answer.
		this.channel.onMessage('description', (message) => {
			if (message.payload.type === 'answer') {
				void this.setRemoteDescription(message.payload);
			}
		});

		// Register listener to wait for an incoming offer.
		this.channel.onMessage('description', async (message) => {
			if (message.payload.type === 'offer') {
				// Set the remote description
				await this.setRemoteDescription(message.payload);

				// Create answer, set it as a local description and send it to the peer.
				const answer = await this.connection.createAnswer();
				await this.connection.setLocalDescription(answer);
				this.channel.sendMessage('description', answer);
			}
		});

		// Listen for incoming streams
		this.connection.addEventListener('track', ({ track, streams }) => {
			track.addEventListener('unmute', () => {
				this.eventSystem.dispatch('stream', [streams[0]]);
			});
		});

		// Connection state change listener
		this.connection.addEventListener('connectionstatechange', () => {
			this.eventSystem.dispatch('connectionstatechange', [this.connection.connectionState]);
		});
	}

	public on<K extends keyof PeerConnectionHandlerEventMap>(
		type: K,
		callback: Callback<PeerConnectionHandlerEventMap[K]>
	): void {
		this.eventSystem.on(type, callback);
	}

	private async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
		await this.connection.setRemoteDescription(description);

		this.bufferedIceCandidates.forEach(
			(candidate) => void this.connection.addIceCandidate(candidate)
		);
		this.bufferedIceCandidates = [];
	}

	public setToReceive(): void {
		this.connection.addTransceiver('video', { direction: 'recvonly' });
		this.connection.addTransceiver('audio', { direction: 'recvonly' });
	}

	public setToTransmit(stream: MediaStream): void {
		for (const track of stream.getTracks()) {
			this.connection.addTrack(track, stream);
		}
	}

	public async call(): Promise<void> {
		// Create offer, set it as a local description and send it to the peer.
		const offer = await this.connection.createOffer();
		await this.connection.setLocalDescription(offer);
		this.channel.sendMessage('description', offer);
	}

	public close(): void {
		this.connection.close();
	}
}
