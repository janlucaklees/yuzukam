import { type ClientMetadata } from './ClientMetadata';

interface ConnectionManagerEventMap {
	'remote-stream': [peerUuid: string, stream: MediaStream];
	'remote-peer': [peerUuid: string, metadata: ClientMetadata];
}

export { type ConnectionManagerEventMap };
