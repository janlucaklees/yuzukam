import type { ClientMetadata } from '$types/ClientMetadata';

interface BatteryManager extends EventTarget {
	charging: boolean;
	chargingTime: number;
	dischargingTime: number;
	level: number;
}

interface BatteryManagerEventMap {
	chargingchange: Event;
	chargingtimechange: Event;
	dischargingtimechange: Event;
	levelchange: Event;
}

export default class BatteryService {
	constructor(private readonly batteryManager: BatteryManager | undefined) {}

	getMetadata(): ClientMetadata['batteryStatus'] {
		if (!this.batteryManager) {
			return undefined;
		}

		return {
			isCharging: this.batteryManager.charging,
			level: this.batteryManager.level
		};
	}

	on<K extends keyof BatteryManagerEventMap>(
		type: K,
		callback: (event: BatteryManagerEventMap[K]) => void
	) {
		// If battery is not accessible, let the user register listener, but do nothing.
		if (!this.batteryManager) {
			return;
		}

		this.batteryManager.addEventListener(type, callback);
	}

	public static async init() {
		let battery;
		try {
			battery = (await navigator.getBattery()) as BatteryManager;
		} catch (error) {
			// TODO: Improved error handling.
			console.log(error);
		}

		return new BatteryService(battery);
	}
}
