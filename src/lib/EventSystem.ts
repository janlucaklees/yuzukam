import type { Callback } from '$types/Callback';

export default class EventSystem<EventMap extends Record<keyof EventMap, unknown[]>> {
	private listeners: {
		[K in keyof EventMap]?: Callback<EventMap[K]>[];
	} = {};

	private getListeners<K extends keyof EventMap>(type: K): Callback<EventMap[K]>[] {
		if (!this.listeners[type]) {
			this.listeners[type] = [];
		}
		return this.listeners[type];
	}

	on<K extends keyof EventMap>(type: K, callback: Callback<EventMap[K]>) {
		const typeListeners = this.getListeners(type);
		typeListeners.push(callback);
	}

	dispatch<K extends keyof EventMap>(type: K, parameters: EventMap[K]) {
		this.getListeners(type)?.forEach((callback) => callback(...parameters));
	}
}
