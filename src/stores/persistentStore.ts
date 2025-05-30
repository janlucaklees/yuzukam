import { writable } from 'svelte/store';

export default function createPersistentRune<T>(key: string, defaultValue: T) {
	if (localStorage.getItem(key) === null) {
		localStorage.setItem(key, JSON.stringify(defaultValue));
	}

	const value = writable(JSON.parse(localStorage.getItem(key)!));

	value.subscribe((value) => {
		localStorage.setItem(key, JSON.stringify(value));
	});

	return value;
}
