<script lang="ts">
	import { Mic, MicOff, Videocam, VideocamOff } from 'svelte-ionicons';
	import ToggleButtonIcon from './ToggleButtonIcon.svelte';
	import Screen from './Screen.svelte';

	interface Props {
		mediaStream: MediaStream | undefined;
		name: string;
		class?: string;
	}

	let { mediaStream, name, class: clazz = '' }: Props = $props();

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
	{#snippet info()}
		{name}
	{/snippet}
	{#snippet controls()}
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
	{/snippet}
</Screen>
