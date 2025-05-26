export default function getOrSetLocalStorageValue(key: string, defaultValue: string): string {
	let rawValue = localStorage.getItem(key);

	if (rawValue === null) {
		rawValue = defaultValue;
		localStorage.setItem(key, defaultValue);
	}

	return rawValue;
}
