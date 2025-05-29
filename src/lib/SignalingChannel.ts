import SignalingSocket from '$lib/SignalingSocket';
import { type MessageTypeMap } from '$types/MessageType';

export default class SignalingChannel {
	private isClosed = false;

	constructor(
		private readonly socket: SignalingSocket,
		private readonly peerUuid: string
	) {}

	public sendMessage<K extends keyof MessageTypeMap>(subject: K, payload) {
		if (this.isClosed) {
			throw new Error('Channel Closed.');
		}

		this.socket.sendMessage(this.peerUuid, subject, payload);
	}

	public onMessage<K extends keyof MessageTypeMap>(
		subject: K,
		callback: (message: MessageTypeMap[K]) => void
	) {
		this.socket.onMessage(subject, (message) => {
			if (this.isClosed) {
				return;
			}

			if (message.sender === this.peerUuid) {
				callback(message);
			}
		});
	}

	close() {
		this.isClosed = true;
	}
}
