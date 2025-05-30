type ClientType = 'camera' | 'monitor';

type ClientMetadata = {
	uuid: string;
	type: ClientType;
	name: string;
	battery?: {
		isCharging: boolean;
		level: number;
	};
};

export { type ClientMetadata, type ClientType };
