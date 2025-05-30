import type { Callback } from '$types/Callback';
import type { ConnectionManagerEventMap } from '$types/ConnectionManagerEvent';

export default class EventSystem {
	private listeners: {
		[K in keyof ConnectionManagerEventMap]?: Callback<ConnectionManagerEventMap[K]>[];
	} = {};

	private getListeners<K extends keyof ConnectionManagerEventMap>(
		type: K
	): Callback<ConnectionManagerEventMap[K]>[] {
		if (!this.listeners[type]) {
			this.listeners[type] = [];
		}
		return this.listeners[type];
	}

	on<K extends keyof ConnectionManagerEventMap>(
		type: K,
		callback: Callback<ConnectionManagerEventMap[K]>
	) {
		const typeListeners = this.getListeners(type);
		typeListeners.push(callback);
	}

	dispatch<K extends keyof ConnectionManagerEventMap>(
		type: K,
		parameters: ConnectionManagerEventMap[K]
	) {
		this.getListeners(type)?.forEach((callback) => callback(...parameters));
	}
}
