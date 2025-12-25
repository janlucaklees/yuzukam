import type { BatteryManager } from '$types/BatteryManager';

const battery = $state<
	| {
			isSupported: true;
			isCharging: boolean;
			level: number;
	  }
	| {
			isSupported: false | undefined;
			isCharging: undefined;
			level: undefined;
	  }
>({
	isSupported: undefined,
	isCharging: undefined,
	level: undefined
});

try {
	const batteryManager = (await navigator.getBattery()) as BatteryManager;

	battery.isSupported = true;
	battery.isCharging = batteryManager.charging;
	battery.level = batteryManager.level;

	batteryManager.addEventListener('chargingchange', () => {
		battery.isCharging = batteryManager.charging;
	});

	batteryManager.addEventListener('levelchange', () => {
		battery.level = batteryManager.level;
	});
} catch {
	battery.isSupported = false;
}

export default battery;
