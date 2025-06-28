import { type ClientType } from '$types/ClientMetadata';

import createPersistentRune from '$stores/persistentStore';

export const type = createPersistentRune<ClientType>('type', 'camera');
