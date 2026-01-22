<script lang="ts">
	import { onMount } from 'svelte';
	import { SettingsOutline } from 'svelte-ionicons';

	import { type } from '$stores/type';
	import { name } from '$stores/name';
	import { selectedVideoInput } from '$stores/selectedVideoInput';
	import { selectedAudioInput } from '$stores/selectedAudioInput';

	import LabeledTextInput from './LabeledTextInput.svelte';
	import LabeledSelectInput from './LabeledSelectInput.svelte';

	let isMenuOpen = $state(false);

	let availableAudioDevices: MediaDeviceInfo[] = $state([]);
	let availableVideoDevices: MediaDeviceInfo[] = $state([]);

	onMount(async () => {
		// TODO: Put this into a shared rune
		const devices = await navigator.mediaDevices.enumerateDevices();
		availableAudioDevices = devices.filter((device) => device.kind === 'audioinput');
		availableVideoDevices = devices.filter((device) => device.kind === 'videoinput');
	});
</script>

<div class="fixed top-0 right-0 flex">
	<button
		type="button"
		onclick={() => (isMenuOpen = !isMenuOpen)}
		class="flex h-14 w-14 flex-none cursor-pointer items-center justify-center rounded-bl-full bg-yellow-200 pb-3 pl-3"
	>
		<SettingsOutline />
	</button>

	{#if isMenuOpen}
		<div class="flex min-h-14 min-w-0 shrink flex-col gap-4 rounded-bl-lg bg-gray-300 px-4 py-4">
			<LabeledSelectInput
				label="Mode:"
				bind:value={$type}
				options={[
					{
						value: 'camera',
						label: 'Send'
					},
					{
						value: 'monitor',
						label: 'Receive'
					}
				]}
			/>

			<LabeledTextInput label="Device Name:" bind:value={$name} />

			<LabeledSelectInput
				label="Microphone:"
				bind:value={$selectedAudioInput}
				options={availableAudioDevices.map((device) => ({
					value: device.deviceId,
					label: device.label
				}))}
			/>

			<LabeledSelectInput
				label="Camera:"
				bind:value={$selectedVideoInput}
				options={availableVideoDevices.map((device) => ({
					value: device.deviceId,
					label: device.label
				}))}
			/>
		</div>
	{/if}
</div>
