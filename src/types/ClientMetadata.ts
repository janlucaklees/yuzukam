type ClientType = 'camera' | 'monitor';

type ClientMetadata = {
	uuid: string;
	type: ClientType;
	name: string;
};

export { type ClientMetadata, type ClientType };
