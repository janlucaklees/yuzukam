<script lang="ts">
	import { onMount } from 'svelte';

	import { selectedVideoInput } from '$stores/selectedVideoInput';
	import { selectedAudioInput } from '$stores/selectedAudioInput';

	import determineMediaDevice from '$lib/determineMediaDevice';

	import UserMediaSelect from '$components/UserMediaSelect.svelte';

	let { children } = $props();

	let availableAudioDevices: MediaDeviceInfo[] = $state([]);
	let availableVideoDevices: MediaDeviceInfo[] = $state([]);

	let isDeviceSelectionRequired: boolean | undefined = $state(undefined);

	// TODO: Check for input devices, if none are found message to offer switching to monitor mode.

	onMount(async () => {
		// TODO: Put this into a shared rune
		const devices = await navigator.mediaDevices.enumerateDevices();
		availableAudioDevices = devices.filter((device) => device.kind === 'audioinput');
		availableVideoDevices = devices.filter((device) => device.kind === 'videoinput');
	});

	$effect(() => {
		const audioDevice = determineMediaDevice(availableAudioDevices, $selectedAudioInput);
		const videoDevice = determineMediaDevice(availableVideoDevices, $selectedVideoInput);

		if (audioDevice && videoDevice) {
			// Persist the devices to be used.
			// TODO: make sure this does not trigger re-renders.
			selectedAudioInput.set(audioDevice.deviceId);
			selectedVideoInput.set(videoDevice.deviceId);

			// TODO make this a $derived
			isDeviceSelectionRequired = false;
		} else {
			isDeviceSelectionRequired = true;
		}
	});

	function onConfirm({ selectedAudioInputId, selectedVideoInputId }) {
		selectedAudioInput.set(selectedAudioInputId);
		selectedVideoInput.set(selectedVideoInputId);
	}
</script>

{#if isDeviceSelectionRequired === false}
	{@render children()}
{:else if isDeviceSelectionRequired === true}
	<UserMediaSelect {availableAudioDevices} {availableVideoDevices} {onConfirm} />
{:else}
	hooooo
{/if}
