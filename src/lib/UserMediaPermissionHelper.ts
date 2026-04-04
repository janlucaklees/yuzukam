import type { Callback } from '$types/Callback';

import AbstractAsyncLifecycledClass from '$lib/AbstractAsyncLifecycledClass';
import { EventSystem, InertEventSystem, type EventSystemInterface } from '$lib/event-system';
import destroyStream from '$lib/destroyStream';

type UserMediaPermissionState =
	| {
			isSupported: true;
			state: PermissionState;
	  }
	| {
			isSupported: false | undefined;
			state: undefined;
	  };

interface UserMediaPermissionHelperEventMap {
	change: [state: UserMediaPermissionState];
}

export default class UserMediaPermissionHelper extends AbstractAsyncLifecycledClass {
	private eventSystem: EventSystemInterface<UserMediaPermissionHelperEventMap> =
		new EventSystem<UserMediaPermissionHelperEventMap>();

	private cameraPermissionStatus?: PermissionStatus;
	private microphonePermissionStatus?: PermissionStatus;

	private state: UserMediaPermissionState = {
		isSupported: undefined,
		state: undefined
	};

	public getState(): UserMediaPermissionState {
		return this.state;
	}

	public promptForPermissions(): void {
		// We need to get the user media to trigger the prompt in the browser.
		navigator.mediaDevices
			.getUserMedia({ video: true, audio: true })
			.then((stream) => {
				// And afterwards we ought to clean up the stream object we got.
				destroyStream(stream);
			})
			// TODO: Be more precise about which errors to swallow and which to pass on.
			.catch(() => {});
	}

	private updateListeners(): void {
		this.eventSystem.dispatch('change', [this.getState()]);
	}

	private deriveState(): PermissionState {
		if (
			this.cameraPermissionStatus!.state === 'denied' ||
			this.microphonePermissionStatus!.state === 'denied'
		) {
			return 'denied';
		}

		if (
			this.cameraPermissionStatus!.state === 'granted' &&
			this.microphonePermissionStatus!.state === 'granted'
		) {
			return 'granted';
		}

		return 'prompt';
	}

	private handlePermissionChange = (): void => {
		this.state.state = this.deriveState();
		this.updateListeners();
	};

	private markAsUnsupported(): void {
		this.state.isSupported = false;
		this.state.state = undefined;
		this.updateListeners();
	}

	protected async handleInitialization(): Promise<void> {
		if (!('permissions' in navigator) || typeof navigator.permissions?.query !== 'function') {
			this.markAsUnsupported();
			return;
		}

		try {
			this.cameraPermissionStatus = await navigator.permissions.query({ name: 'camera' });
			this.microphonePermissionStatus = await navigator.permissions.query({ name: 'microphone' });
		} catch {
			this.markAsUnsupported();
			return;
		}

		this.state.isSupported = true;
		this.state.state = this.deriveState();

		this.cameraPermissionStatus.addEventListener('change', this.handlePermissionChange);
		this.microphonePermissionStatus.addEventListener('change', this.handlePermissionChange);

		this.updateListeners();
	}

	protected handleDestruction(): void {
		this.cameraPermissionStatus?.removeEventListener('change', this.handlePermissionChange);
		this.microphonePermissionStatus?.removeEventListener('change', this.handlePermissionChange);
		this.cameraPermissionStatus = undefined;
		this.microphonePermissionStatus = undefined;

		this.state.isSupported = undefined;
		this.state.state = undefined;

		this.eventSystem.destroy();
		this.eventSystem = new InertEventSystem<UserMediaPermissionHelperEventMap>();
	}

	public on<K extends keyof UserMediaPermissionHelperEventMap>(
		type: K,
		callback: Callback<UserMediaPermissionHelperEventMap[K]>
	): void {
		this.eventSystem.on(type, callback);
	}
}

export type { UserMediaPermissionState };
