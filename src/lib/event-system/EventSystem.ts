import type { Callback } from '$types/Callback';
import type EventSystemInterface from './EventSystemInterface';

export default class EventSystem<
	EventMap extends Record<keyof EventMap, unknown[]>
> implements EventSystemInterface<EventMap> {
	private listeners: {
		[K in keyof EventMap]?: Callback<EventMap[K]>[];
	} = {};

	private getListeners<K extends keyof EventMap>(type: K): Callback<EventMap[K]>[] {
		if (!this.listeners[type]) {
			this.listeners[type] = [];
		}
		return this.listeners[type];
	}

	on<K extends keyof EventMap>(type: K, callback: Callback<EventMap[K]>): void {
		const typeListeners = this.getListeners(type);
		typeListeners.push(callback);
	}

	dispatch<K extends keyof EventMap>(type: K, parameters: EventMap[K]): void {
		this.getListeners(type)?.forEach((callback) => callback(...parameters));
	}

	destroy(): void {
		this.listeners = {};
	}
}
