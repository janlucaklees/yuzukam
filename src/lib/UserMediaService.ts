import { type Callback } from '$types/Callback';
import { EventSystem } from '$lib/event-system';
import destroyStream from '$lib/destroyStream';

interface UserMediaServiceEventMap extends Record<string, unknown[]> {
	'permission-state': [state: PermissionState];
	stream: [stream: MediaStream];
	error: [error: unknown];
}

export default class UserMediaService {
	private eventSystem = new EventSystem<UserMediaServiceEventMap>();

	private constraints: MediaStreamConstraints;

	private stream: MediaStream | undefined;

	constructor(constraints: MediaStreamConstraints) {
		this.constraints = Object.assign(
			{
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true
				},
				video: {
					width: { ideal: 640 },
					height: { ideal: 360 },
					frameRate: { ideal: 12 }
				}
			},
			constraints
		);

		void this.restartStream();
	}

	public async updateConstraints(constraints: MediaStreamConstraints): Promise<void> {
		this.constraints = Object.assign(this.constraints, constraints);

		await this.restartStream();
	}

	private async restartStream(): Promise<void> {
		// Stop old stream
		destroyStream(this.stream);

		// Get and set new stream
		try {
			this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);

			// Register listener to restart stream, if stopped.
			this.stream.getTracks().forEach((track) =>
				track.addEventListener('ended', async (): Promise<void> => {
					console.log('Restarting local camera feed...');

					void this.restartStream();
				})
			);

			this.eventSystem.dispatch('stream', [this.stream]);
		} catch (error: unknown) {
			this.eventSystem.dispatch('error', [error]);
		}
	}

	public on<K extends keyof UserMediaServiceEventMap>(
		type: K,
		callback: Callback<UserMediaServiceEventMap[K]>
	): void {
		this.eventSystem.on(type, callback);
	}

	public destroy(): void {
		destroyStream(this.stream);
	}
}
