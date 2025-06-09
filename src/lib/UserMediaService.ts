import { type Callback } from '$types/Callback';
import EventSystem from './EventSystem';

interface UserMediaServiceEventMap extends Record<string, unknown[]> {
	'stream-restarted': [stream: MediaStream];
}

export default class UserMediaService {
	private eventSystem = new EventSystem<UserMediaServiceEventMap>();

	constructor(
		private readonly constraints: MediaStreamConstraints | undefined,
		private stream: MediaStream | undefined
	) {
		this.stream?.getTracks().forEach((track) =>
			track.addEventListener('ended', async () => {
				this.stream = await UserMediaService.getStream(this.constraints);
				this.eventSystem.dispatch('stream-restarted', [this.stream]);
			})
		);
	}

	on<K extends keyof UserMediaServiceEventMap>(
		type: K,
		callback: Callback<UserMediaServiceEventMap[K]>
	) {
		this.eventSystem.on(type, callback);
	}

	private static getStream(
		constraints: MediaStreamConstraints = {
			video: true,
			audio: true
		}
	) {
		return navigator.mediaDevices.getUserMedia(constraints);
	}

	public static async init(constraints?: MediaStreamConstraints) {
		let mediaStream;
		try {
			mediaStream = await UserMediaService.getStream(constraints);
		} catch (error) {
			console.log(error);
		}

		return new UserMediaService(constraints, mediaStream);
	}
}
