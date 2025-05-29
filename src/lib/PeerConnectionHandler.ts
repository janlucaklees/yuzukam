import SignalingChannel from '$lib/SignalingChannel';

export default class PeerConnectionHandler {
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
				this.connection.addIceCandidate(message.payload);
			} else {
				this.bufferedIceCandidates.push(message.payload);
			}
		});

		// Register listener for receiving answer.
		this.channel.onMessage('description', (message) => {
			if (message.payload.type === 'answer') {
				this.setRemoteDescription(message.payload);
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
	}

	private async setRemoteDescription(description: RTCSessionDescriptionInit) {
		await this.connection.setRemoteDescription(description);

		this.bufferedIceCandidates.forEach((candidate) => this.connection.addIceCandidate(candidate));
		this.bufferedIceCandidates = [];
	}

	public addStream(stream: MediaStream) {
		for (const track of stream.getTracks()) {
			this.connection.addTrack(track, stream);
		}
	}

	public onStream(callback: (stream: MediaStream) => void) {
		this.connection.addEventListener('track', ({ track, streams }) => {
			track.addEventListener('unmute', () => {
				callback(streams[0]);
			});
		});
	}

	async call() {
		// Create offer, set it as a local description and send it to the peer.
		const offer = await this.connection.createOffer();
		await this.connection.setLocalDescription(offer);
		this.channel.sendMessage('description', offer);
	}

	close() {
		this.channel.close();
		this.connection.close();
	}
}
