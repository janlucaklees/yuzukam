import { type Callback } from '$types/Callback';
import EventSystem from '$lib/EventSystem';

interface UserMediaServiceEventMap extends Record<string, unknown[]> {
	stream: [stream: MediaStream];
}

export default class UserMediaService {
	private eventSystem = new EventSystem<UserMediaServiceEventMap>();
	private stream: MediaStream | undefined;

	constructor(
		private readonly constraints: MediaStreamConstraints = {
			video: true,
			audio: true
		}
	) {
		this.restartStream();
	}

	private async restartStream() {
		// Stop old stream
		this.ensureStreamStopped(this.stream);

		// Get and set new stream
		this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);

		// Register listener to restart stream, if stopped.
		this.stream.getTracks().forEach((track) =>
			track.addEventListener('ended', async () => {
				console.log('Restarting local camera feed...');

				this.restartStream();
			})
		);

		// Notify listeners
		this.eventSystem.dispatch('stream', [this.stream]);
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
