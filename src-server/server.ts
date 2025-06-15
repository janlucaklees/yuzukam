import pkg from '../package.json';

import { type ServerWebSocket } from 'bun';
import { validate as isValidUuid } from 'uuid';

import CloseCodes from '../src/types/CloseCodes';

const PORT = 3000;

type ClientData = {
	version: string;
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
			const version = url.searchParams.get('version');
			const uuid = url.searchParams.get('uuid');

			if (version === null) {
				return new Response('No version given.', { status: 400 });
			}

			if (uuid === null) {
				return new Response('No uuid given.', { status: 400 });
			}

			if (!isValidUuid(uuid)) {
				return new Response('Invalid uuid.', { status: 400 });
			}

			const wasUpgradeSuccessful = server.upgrade(req, {
				data: {
					uuid,
					version
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
			const uuid = ws.data.uuid;

			// Close any open connection for the same client.
			const currentConnection = clients.get(uuid);
			if (currentConnection) {
				currentConnection.close(
					CloseCodes.MULTIPLE_CONNECTIONS,
					'Connection closed: New client connection established.'
				);
			}

			// Store the client in the client map
			clients.set(uuid, ws);

			// Exclude the client, in case of a version mismatch.
			if (ws.data.version !== pkg.version) {
				ws.close(CloseCodes.VERSION_MISMATCH, 'Connection closed: Version mismatch.');
				return;
			}

			// Subscribe the client to the general channel for broadcasted messages.
			ws.subscribe('general');

			// Notify other clients.
			ws.publish(
				'general',
				JSON.stringify({
					sender: 'server',
					recipient: 'all',
					subject: 'client-connected',
					payload: {
						uuid
					}
				})
			);

			// Notify the client about successful connection.
			ws.send(
				JSON.stringify({
					sender: 'server',
					recipient: uuid,
					subject: 'connection-confirmed',
					payload: {}
				})
			);
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
				return;
			}

			clients.get(message.recipient)!.send(rawMessage);
		},
		close(ws, code) {
			// Remove the client from the general channel
			clients.delete(ws.data.uuid);

			// If the client connection was closed because of a version mismatch, we do not want to notify
			// other clients, and don't need to unsubscribe the client from the broadcasting channel.
			if (code === CloseCodes.VERSION_MISMATCH) {
				return;
			}

			// Remove the client form the general broadcasting channel.
			ws.unsubscribe('general');

			// Notify other clients.
			ws.publish(
				'general',
				JSON.stringify({
					sender: 'server',
					recipient: 'all',
					subject: 'client-disconnected',
					payload: {
						uuid: ws.data.uuid
					}
				})
			);
		}
	}
});

console.log(`Server running on http://localhost:${PORT}`);
