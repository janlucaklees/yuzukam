import { type SignalingEventMap } from '$types/SignalingEventMap';
import SignalingChannel from '$lib/SignalingChannel';

// Keeping this generic, so I keep my sanity.
type Listener = {
	type: string;
	callback: CallableFunction;
};

export default class SignalingSocket {
	private clientUuid: string;
	private endpoint: string;
	private socket: WebSocket;

	private messageQueue: SignalingEventMap[keyof SignalingEventMap][] = [];

	private listeners: Listener[] = [];

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
			if (event.code === 4499 || event.code === 4111) {
				console.log('Not reconnecting, reason: ', event.reason);
				return;
			}

			this.reconnect();
		});

		// Reapply cached listeners on new socket
		this.listeners.forEach(({ type, callback }) => {
			socket.addEventListener(type, callback as EventListenerOrEventListenerObject);
		});

		return socket;
	}

	private reconnect() {
		setTimeout(() => {
			console.log('reconnecting...');
			this.socket = this.createSocket();
		}, 3000);
	}

	public sendMessage<K extends keyof SignalingEventMap>(
		recipient: string,
		subject: K,
		payload: SignalingEventMap[K]['payload']
	) {
		const message = {
			sender: this.clientUuid,
			recipient,
			subject,
			payload
		} as SignalingEventMap[K];

		if (this.socket.readyState !== WebSocket.OPEN) {
			this.messageQueue.push(message);
			return;
		}

		this.socket.send(JSON.stringify(message));
	}

	public onMessage<K extends keyof SignalingEventMap>(
		subject: K,
		callback: (message: SignalingEventMap[K]) => void
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

	public close() {
		this.socket.close(4111, 'Connection closed: Graceful shutdown.');
	}
}
