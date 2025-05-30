import type { ClientMetadata } from './ClientMetadata';
import type { Message } from './Message';

interface SignalingEventMap {
	introduction: Message<'introduction', ClientMetadata>;
	description: Message<'description', RTCSessionDescriptionInit>;
	icecandidate: Message<'icecandidate', RTCIceCandidateInit>;
	metadata: Message<'metadata', ClientMetadata>;
}

export { type SignalingEventMap };
