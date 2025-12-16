import { type Callback } from '$types/Callback';
import EventSystem from '$lib/EventSystem';

interface UserMediaServiceEventMap extends Record<string, unknown[]> {
	permissionstate: [state: PermissionState];
	stream: [stream: MediaStream];
	error: [error: unknown];
}

export default class UserMediaService {
	private eventSystem = new EventSystem<UserMediaServiceEventMap>();

	private stream: MediaStream | undefined;

	constructor(
		private readonly constraints: MediaStreamConstraints = {
			video: {
				width: { ideal: 640 },
				height: { ideal: 360 },
				frameRate: { ideal: 12 }
			},
			audio: {
				echoCancellation: true,
				noiseSuppression: true,
				autoGainControl: true
			}
		}
	) {
		this.restartStream();
	}

	private async restartStream() {
		// Stop old stream
		this.ensureStreamStopped(this.stream);

		// Get and set new stream
		try {
			const permissionStatus = await navigator.permissions.query({ name: 'camera' });

			this.eventSystem.dispatch('permissionstate', [permissionStatus.state]);

			permissionStatus.addEventListener('change', () => {
				this.eventSystem.dispatch('permissionstate', [permissionStatus.state]);
			});

			this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);

			// Register listener to restart stream, if stopped.
			this.stream.getTracks().forEach((track) =>
				track.addEventListener('ended', async () => {
					console.log('Restarting local camera feed...');

					this.restartStream();
				})
			);

			this.eventSystem.dispatch('stream', [this.stream]);
		} catch (error: unknown) {
			this.eventSystem.dispatch('error', [error]);
		}
	}

	on<K extends keyof UserMediaServiceEventMap>(
		type: K,
		callback: Callback<UserMediaServiceEventMap[K]>
	) {
		this.eventSystem.on(type, callback);
	}

	private ensureStreamStopped(stream: MediaStream | undefined) {
		if (!stream) {
			return;
		}

		stream.getTracks().forEach((t) => t.stop());
		stream.getTracks().forEach((t) => stream.removeTrack(t));
	}

	public destroy() {
		this.ensureStreamStopped(this.stream);
	}
}
