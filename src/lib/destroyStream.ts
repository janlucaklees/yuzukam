export default function destroyStream(stream: MediaStream | undefined): void {
	if (!stream) {
		return;
	}

	stream.getTracks().forEach((t) => t.stop());
	stream.getTracks().forEach((t) => stream.removeTrack(t));
}
