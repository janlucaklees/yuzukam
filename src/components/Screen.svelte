<script lang="ts">
	export let mediaStream: MediaStream;

	function srcObject(node: HTMLVideoElement, stream: MediaStream) {
		node.srcObject = stream;
		return {
			update(nextStream: MediaStream) {
				node.srcObject = nextStream;
			}
		};
	}
</script>

<div class="video-card rounded border">
	<video use:srcObject={mediaStream} class="video" autoplay muted></video>
</div>

<style lang="scss">
	.video-card {
		position: relative;

		width: 640px;
		height: 480px;

		padding: 1rem;

		.video {
			width: 100%;
			height: 100%;

			object-fit: cover;

			transform: scaleX(-1);

			border-radius: 1rem;
		}

		&__controls {
			position: absolute;
			right: 0;
			bottom: -5rem;
			left: 0;

			display: flex;
			justify-content: end;
			gap: 1rem;
		}
	}
</style>
