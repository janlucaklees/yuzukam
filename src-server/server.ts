import { type ServerWebSocket } from 'bun';
import { validate as isValidUuid } from 'uuid';

const PORT = 3000;

type ClientData = {
	uuid: string;
};

const clients = new Map<string, ServerWebSocket<ClientData>>();

Bun.serve<ClientData>({
	port: PORT,
	hostname: '0.0.0.0',
	fetch(req, server) {
		const url = new URL(req.url);
		const clientIP = server.requestIP(req)?.address ?? 'unknown';
		const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];

		console.log(`[${timestamp}] ${clientIP} accessed ${url.pathname}`);

		if (url.pathname === '/api/connect') {
			const uuid = url.searchParams.get('uuid');

			if (uuid === null) {
				return new Response('No uuid given.', { status: 400 });
			}

			if (!isValidUuid(uuid)) {
				return new Response('Invalid uuid.', { status: 400 });
			}

			const wasUpgradeSuccessful = server.upgrade(req, {
				data: {
					uuid: url.searchParams.get('uuid')
				}
			});

			if (!wasUpgradeSuccessful) {
				return new Response('Upgrade failed', { status: 500 });
			}

			return undefined;
		}

		if (url.pathname === '/' || url.pathname === '') {
			return new Response(Bun.file(`./public/index.html`));
		}

		return new Response(Bun.file(`./public/${url.pathname}`));
	},
	error() {
		return new Response('Not found', { status: 404 });
	},
	websocket: {
		open(ws) {
			// Close any open connection for the same client.
			const currentConnection = clients.get(ws.data.uuid);
			if (currentConnection) {
				currentConnection.close(4499, 'Connection closed: New client connection established.');
			}

			clients.set(ws.data.uuid, ws);
			ws.subscribe('general');
		},
		message(ws, rawMessage) {
			let message;
			try {
				message = JSON.parse(rawMessage.toString());
			} catch {
				// Malformed payload
				ws.send(JSON.stringify({ error: 'Invalid JSON.' }));
				return;
			}

			// Broadcast, if special 'all' recipient was used.
			if (message.recipient === 'all') {
				ws.publish('general', rawMessage);
				return;
			}

			// Return error when recipient was not found.
			if (!clients.has(message.recipient)) {
				ws.send(
					JSON.stringify({
						error: 'Invalid Recipient.'
					})
				);
			}

			clients.get(message.recipient)!.send(rawMessage);
		},
		close(ws) {
			ws.unsubscribe('general');
			clients.delete(ws.data.uuid);
		}
	}
});

console.log(`Server running on http://localhost:${PORT}`);
