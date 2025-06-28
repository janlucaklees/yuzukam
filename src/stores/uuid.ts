import { v4 as uuidv4 } from 'uuid';

import createPersistentRune from '$stores/persistentStore';

export const uuid = createPersistentRune<string>('uuid', uuidv4());
