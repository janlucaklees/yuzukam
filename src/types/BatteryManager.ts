// Polyfill for Typescript which does not yet know about the BatteryManager.
export interface BatteryManager extends EventTarget {
	charging: boolean;
	chargingTime: number;
	dischargingTime: number;
	level: number;
}
