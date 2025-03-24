<script lang="ts">
	import { onMount } from 'svelte';

	import ToggleButtonIcon from '$components/ToggleButtonIcon.svelte';
	import { Videocam, VideocamOff, Mic, MicOff } from 'svelte-ionicons';
	import Stream from '$lib/Stream';

	let localPlayer: HTMLMediaElement;

	let stream = new Stream();

	onMount(async () => {
		await stream.init();

		localPlayer.srcObject = stream.getMediaSource()!;
	});
</script>

<div class="video-card rounded border">
	<video bind:this={localPlayer} class="video" autoplay muted></video>

	<div class="video-card__controls">
		<ToggleButtonIcon
			onToggle={(isEnabled: boolean) => stream.toggleVideo(isEnabled)}
			iconEnabled={Videocam}
			iconDisabled={VideocamOff}
		/>
		<ToggleButtonIcon
			onToggle={(isEnabled: boolean) => stream.toggleAudio(isEnabled)}
			iconEnabled={Mic}
			iconDisabled={MicOff}
		/>
	</div>
</div>

<style lang="scss">
	.video-card {
		width: 640px;
		height: 480px;

		padding: 1rem;
		/*
		.title {
			position: absolute;
			top: -5rem;
			left: 0;

			min-width: 15rem;

			line-height: 1;
		} */

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

	/* Position the video card in the center of the screen */
	body {
		position: relative;
	}
	.video-card {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
