import { type ClientMetadata } from './ClientMetadata';

interface ConnectionManagerEventMap {
	'remote-stream': [peerUuid: string, stream: MediaStream];
	'peer-connected': [peerUuid: string, metadata: ClientMetadata];
	'peer-metadata': [peerUuid: string, metadata: ClientMetadata];
	'peer-disconnected': [peerUuid: string];
}

export { type ConnectionManagerEventMap };
