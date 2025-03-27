import { argv, type ServerWebSocket } from 'bun';
import { validate as isValidUuid } from 'uuid';

const PORT = 3000;

type ClientType = 'camera' | 'monitor';
type ClientData = {
	type: ClientType;
	uuid: string;
};

const clients = new Map<string, ServerWebSocket<ClientData>>();

Bun.serve<ClientData>({
	port: PORT,
	hostname: '0.0.0.0',
	fetch(req, server) {
		const url = new URL(req.url);
		const clientIP = server.requestIP(req)?.address;
		const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];

		console.log(`[${timestamp}] ${clientIP} accessed ${url.pathname}`);

		if (url.pathname === '/api/connect') {
			const type = url.searchParams.get('type');
			const uuid = url.searchParams.get('uuid');

			if (type === null) {
				return new Response('No type given.', { status: 400 });
			}

			if (!['camera', 'monitor'].includes(type)) {
				return new Response('Invalid type.', { status: 400 });
			}

			if (uuid === null) {
				return new Response('No uuid given.', { status: 400 });
			}

			if (!isValidUuid(uuid)) {
				return new Response('Invalid uuid.', { status: 400 });
			}

			const wasUpgradeSuccessful = server.upgrade(req, {
				data: {
					uuid: url.searchParams.get('uuid'),
					type: url.searchParams.get('type')
				}
			});

			if (!wasUpgradeSuccessful) {
				return new Response('Upgrade failed', { status: 500 });
			}

			return undefined;
		}

		return new Response('Not found', { status: 404 });
	},
	websocket: {
		open(ws) {
			clients.set(ws.data.uuid, ws);
		},
		close(ws) {
			clients.delete(ws.data.uuid);
		}
	}
});

console.log(`Server running on http://localhost:${PORT}`);
