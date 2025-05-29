import { type MessageType, type MessageTypeMap } from '$types/MessageType';
import SignalingChannel from '$lib/SignalingChannel';

type Listener<K extends keyof WebSocketEventMap> = {
	type: K;
	callback: (event: WebSocketEventMap[K]) => void;
};

export default class SignalingSocket {
	private clientUuid: string;
	private endpoint: string;
	private socket: WebSocket;

	private messageQueue: MessageType<keyof MessageTypeMap>[] = [];

	private listeners: Listener<keyof WebSocketEventMap>[] = [];

	constructor(uuid: string) {
		this.clientUuid = uuid;
		this.endpoint = `ws://${location.hostname}:${location.port}/api/connect?uuid=${uuid}`;
		this.socket = this.createSocket();
	}

	private createSocket(): WebSocket {
		const socket = new WebSocket(this.endpoint);

		// Send queued messages, after connecting
		socket.addEventListener('open', () => {
			this.messageQueue.forEach((message) => this.socket.send(JSON.stringify(message)));
			this.messageQueue = [];
		});

		// Make sure to reconnect when the socket closes.
		socket.addEventListener('close', (event) => {
			// But only if it wasn't closed for a good reason.
			if (event.code === 4499) {
				console.log('Not reconnecting, reason: ', event.reason);
				return;
			}

			this.reconnect();
		});

		// Reapply cached listeners on new socket
		this.listeners.forEach(({ type, callback }) => {
			socket.addEventListener(type, callback);
		});

		return socket;
	}

	private reconnect() {
		setTimeout(() => {
			console.log('reconnecting...');
			this.socket = this.createSocket();
		}, 3000);
	}

	public sendMessage<K extends keyof MessageTypeMap>(recipient: string, subject: K, payload) {
		const message: MessageType<K> = {
			sender: this.clientUuid,
			recipient,
			subject,
			payload
		};

		if (this.socket.readyState !== WebSocket.OPEN) {
			this.messageQueue.push(message);
			return;
		}

		this.socket.send(JSON.stringify(message));
	}

	public onMessage<K extends keyof MessageTypeMap>(
		subject: K,
		callback: (message: MessageTypeMap[K]) => void
	) {
		const preparedCallback = (event: WebSocketEventMap['message']) => {
			const message = JSON.parse(event.data);

			if (message.subject === subject) {
				callback(message);
			}
		};

		this.listeners.push({ type: 'message', callback: preparedCallback });
		this.socket.addEventListener('message', preparedCallback);
	}

	public on<K extends keyof WebSocketEventMap>(
		type: K,
		callback: (event: WebSocketEventMap[K]) => void
	) {
		this.listeners.push({ type, callback });
		this.socket.addEventListener(type, callback);
	}

	public createChannel(peerUuid: string): SignalingChannel {
		const channel = new SignalingChannel(this, peerUuid);
		return channel;
	}
}
