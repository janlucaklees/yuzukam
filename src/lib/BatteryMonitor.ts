import type { BatteryManager } from '$types/BatteryManager';
import type { Callback } from '$types/Callback';

import AbstractAsyncLifecycledClass from './AbstractAsyncLifecycledClass';
import { EventSystem, InertEventSystem, type EventSystemInterface } from '$lib/event-system';

type BatteryMonitorState =
	| {
			isSupported: true;
			isCharging: boolean;
			level: number;
	  }
	| {
			isSupported: false | undefined;
			isCharging: undefined;
			level: undefined;
	  };

interface BatteryMonitorEventMap {
	change: [state: BatteryMonitorState];
}

export default class BatteryMonitor extends AbstractAsyncLifecycledClass {
	private eventSystem: EventSystemInterface<BatteryMonitorEventMap> =
		new EventSystem<BatteryMonitorEventMap>();

	private batteryManager?: BatteryManager;

	private state: BatteryMonitorState = {
		isSupported: undefined,
		isCharging: undefined,
		level: undefined
	};

	private updateListeners(): void {
		this.eventSystem!.dispatch('change', [this.getState()]);
	}

	private handleChargingChange = (): void => {
		this.state.isCharging = this.batteryManager!.charging;
		this.updateListeners();
	};

	private handleLevelChange = (): void => {
		this.state.level = this.batteryManager!.level;
		this.updateListeners();
	};

	public getState(): BatteryMonitorState {
		return this.state;
	}

	private markAsUnsupported(): void {
		this.state.isSupported = false;
		this.state.isCharging = undefined;
		this.state.level = undefined;
		this.updateListeners();
	}

	protected async handleInitialization(): Promise<void> {
		if (!('getBattery' in navigator) || typeof navigator.getBattery !== 'function') {
			this.markAsUnsupported();
			return;
		}

		try {
			this.batteryManager = (await navigator.getBattery()) as BatteryManager;
		} catch {
			this.markAsUnsupported();
			return;
		}

		this.state.isSupported = true;
		this.state.isCharging = this.batteryManager.charging;
		this.state.level = this.batteryManager.level;

		// Add listeners to stay up-to-date
		this.batteryManager.addEventListener('chargingchange', this.handleChargingChange);
		this.batteryManager.addEventListener('levelchange', this.handleLevelChange);

		// Send current battery state to listeners.
		this.updateListeners();
	}

	protected handleDestruction(): void {
		this.batteryManager?.removeEventListener('chargingchange', this.handleChargingChange);
		this.batteryManager?.removeEventListener('levelchange', this.handleLevelChange);
		this.batteryManager = undefined;

		this.state.isSupported = undefined;
		this.state.isCharging = undefined;
		this.state.level = undefined;

		this.eventSystem.destroy();
		this.eventSystem = new InertEventSystem<BatteryMonitorEventMap>();
	}

	public on<K extends keyof BatteryMonitorEventMap>(
		type: K,
		callback: Callback<BatteryMonitorEventMap[K]>
	): void {
		this.eventSystem!.on(type, callback);
	}
}

export type { BatteryMonitorState };
