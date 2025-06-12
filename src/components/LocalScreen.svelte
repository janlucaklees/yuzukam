<script lang="ts">
	import { Mic, MicOff, Videocam, VideocamOff } from 'svelte-ionicons';
	import ToggleButtonIcon from './ToggleButtonIcon.svelte';
	import Screen from './Screen.svelte';

	export let mediaStream: MediaStream | undefined;
	export let name: string;

	let clazz = '';
	export { clazz as class };

	function toggleVideo(isEnabled: boolean) {
		if (mediaStream) {
			mediaStream.getVideoTracks()[0].enabled = isEnabled;
		}
	}

	function toggleAudio(isEnabled: boolean) {
		if (mediaStream) {
			mediaStream.getAudioTracks()[0].enabled = isEnabled;
		}
	}
</script>

<Screen stream={mediaStream} class={clazz}>
	<svelte:fragment slot="info">
		{name}
	</svelte:fragment>
	<svelte:fragment slot="controls">
		<ToggleButtonIcon
			onToggle={(isEnabled: boolean) => toggleVideo(isEnabled)}
			iconEnabled={Videocam}
			iconDisabled={VideocamOff}
			size={18}
		/>
		<ToggleButtonIcon
			onToggle={(isEnabled: boolean) => toggleAudio(isEnabled)}
			iconEnabled={Mic}
			iconDisabled={MicOff}
			size={18}
		/>
	</svelte:fragment>
</Screen>
