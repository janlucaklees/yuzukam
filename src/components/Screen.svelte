<script lang="ts">
	import { onMount } from 'svelte';
	import { Videocam, VideocamOff, Mic, MicOff } from 'svelte-ionicons';

	import ToggleButtonIcon from '$components/ToggleButtonIcon.svelte';

	export let mediaStream: MediaStream;

	let localPlayer: HTMLMediaElement;

	function toggleVideo(isEnabled: boolean) {
		if (mediaStream) {
			const track = mediaStream.getVideoTracks()[0];
			track.enabled = isEnabled;
		}
	}

	function toggleAudio(isEnabled: boolean) {
		if (mediaStream) {
			const track = mediaStream.getAudioTracks()[0];
			track.enabled = isEnabled;
		}
	}

	onMount(() => {
		localPlayer.srcObject = mediaStream;
	});
</script>

<div class="video-card rounded border">
	<video bind:this={localPlayer} class="video" autoplay muted></video>

	<div class="video-card__controls">
		<ToggleButtonIcon
			onToggle={(isEnabled: boolean) => toggleVideo(isEnabled)}
			iconEnabled={Videocam}
			iconDisabled={VideocamOff}
		/>
		<ToggleButtonIcon
			onToggle={(isEnabled: boolean) => toggleAudio(isEnabled)}
			iconEnabled={Mic}
			iconDisabled={MicOff}
		/>
	</div>
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
