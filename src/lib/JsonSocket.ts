export default class JsonSocket {
	private isOpen = false;
	private socket: WebSocket | undefined;

	constructor(private endpoint: string) {}

	async connect() {
		return new Promise((resolve, reject) => {
			this.socket = new WebSocket(this.endpoint);
			this.socket.addEventListener('error', reject);
			this.socket.addEventListener('open', () => {
				this.isOpen = true;
				resolve(this);
			});
		});
	}

	send(message: object) {
		if (!this.socket) {
			throw new Error('Socket is not connected.');
		}

		this.socket.send(JSON.stringify(message));
	}

	onMessage(callback: (message: object) => void) {
		if (!this.socket) {
			throw new Error('Socket is not connected.');
		}

		this.socket.addEventListener('message', (event) => {
			callback(JSON.parse(event.data));
		});
	}
}
