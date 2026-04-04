import SignalingSocket from '$lib/SignalingSocket';
import { type SignalingEventMap } from '$types/SignalingEventMap';

export default class SignalingChannel {
	private isClosed = false;

	constructor(
		private readonly socket: SignalingSocket,
		private readonly peerUuid: string
	) {}

	public sendMessage<K extends keyof SignalingEventMap>(
		subject: K,
		payload: SignalingEventMap[K]['payload']
	): void {
		if (this.isClosed) {
			throw new Error('Channel Closed.');
		}

		this.socket.sendMessage(this.peerUuid, subject, payload);
	}

	public onMessage<K extends keyof SignalingEventMap>(
		subject: K,
		callback: (message: SignalingEventMap[K]) => void
	): void {
		this.socket.onMessage(subject, (message) => {
			if (this.isClosed) {
				return;
			}

			if (message.sender === this.peerUuid) {
				callback(message);
			}
		});
	}

	public close(): void {
		this.isClosed = true;
	}
}
