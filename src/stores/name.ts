import createPersistentRune from '$stores/persistentStore';

export const name = createPersistentRune<string>('name', 'Yuzukam');
