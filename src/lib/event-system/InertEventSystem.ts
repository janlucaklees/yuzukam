import type { Callback } from '$types/Callback';
import type EventSystemInterface from './EventSystemInterface';

export default class InertEventSystem<
	EventMap extends Record<keyof EventMap, unknown[]>
> implements EventSystemInterface<EventMap> {
	on<K extends keyof EventMap>(_type: K, _callback: Callback<EventMap[K]>): void {}

	dispatch<K extends keyof EventMap>(_type: K, _parameters: EventMap[K]): void {}

	destroy(): void {}
}
