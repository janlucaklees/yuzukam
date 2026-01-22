import { type Callback } from '$types/Callback';
import EventSystem from '$lib/EventSystem';

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

		this.restartStream();
	}

	public async updateConstraints(constraints: MediaStreamConstraints) {
		this.constraints = Object.assign(this.constraints, constraints);

		await this.restartStream();
	}

	private async restartStream() {
		// Stop old stream
		this.ensureStreamStopped(this.stream);

		// Get and set new stream
		try {
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
