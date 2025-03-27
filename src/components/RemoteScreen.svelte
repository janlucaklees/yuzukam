<script lang="ts">
	import { onMount } from 'svelte';
	import { VolumeHigh, VolumeMute } from 'svelte-ionicons';

	import ToggleButtonIcon from '$components/ToggleButtonIcon.svelte';
	import BatteryIndicator from '$components/BatteryIndicator.svelte';

	export let mediaStream: MediaStream;
	export let batteryStatus: object;

	let localPlayer: HTMLMediaElement;

	function toggleAudio(isEnabled: boolean) {
	 localPlayer.muted = !isEnabled;
	}

	onMount(() => {
		localPlayer.srcObject = mediaStream;
	});
</script>

<div class="video-card rounded border">
	<video bind:this={localPlayer} class="video" autoplay muted></video>

	<div class="video-card__controls">
		<BatteryIndicator level={batteryStatus.level} charging={batteryStatus.charging} />

		<ToggleButtonIcon
		  isInitialyEnabled={false}
			onToggle={(isEnabled: boolean) => toggleAudio(isEnabled)}
			iconEnabled={VolumeHigh}
			iconDisabled={VolumeMute}
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
