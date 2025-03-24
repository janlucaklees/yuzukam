export default class Stream {
	private stream: MediaStream | undefined;

	async init() {
		this.stream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true
		});
	}

	toggleVideo(isEnabled: boolean) {
		if (this.stream) {
			const track = this.stream.getVideoTracks()[0];
			track.enabled = isEnabled;
		}
	}

	toggleAudio(isEnabled: boolean) {
		if (this.stream) {
			const track = this.stream.getAudioTracks()[0];
			track.enabled = isEnabled;
		}
	}

	getMediaSource() {
		return this.stream;
	}
}
