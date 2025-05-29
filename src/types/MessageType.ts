type MessageType<K> = {
	sender: string;
	recipient: string;
	subject: keyof MessageTypeMap;
	payload: K;
};

interface MessageTypeMap {
	introduction: MessageType<undefined>;
	description: MessageType<RTCSessionDescriptionInit>;
	icecandidate: MessageType<RTCIceCandidateInit>;
}

export { type MessageType, type MessageTypeMap };
