import type { Callback } from '$types/Callback';

export default interface EventSystemInterface<EventMap extends Record<keyof EventMap, unknown[]>> {
	on<K extends keyof EventMap>(type: K, callback: Callback<EventMap[K]>): void;
	dispatch<K extends keyof EventMap>(type: K, parameters: EventMap[K]): void;
	destroy(): void;
}
