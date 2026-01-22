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

{#if isMenuOpen}
	<div class="fixed inset-0 h-screen w-screen bg-yellow-50 opacity-45"></div>
{/if}

<div class="fixed top-0 right-0">
	<button
		type="button"
		onclick={() => (isMenuOpen = !isMenuOpen)}
		class="absolute -left-14 flex h-14 w-14 flex-none cursor-pointer items-center justify-center rounded-bl-full bg-yellow-200 pb-3 pl-3 shadow-2xl shadow-gray-900"
	>
		<SettingsOutline />
	</button>
	<div class="absolute h-14 w-14 flex-none rounded-br-full bg-yellow-200"></div>

	{#if isMenuOpen}
		<div
			class="flex h-screen min-w-0 shrink flex-col gap-4 rounded-bl-lg bg-gray-300 px-4 py-4 shadow-2xl shadow-gray-900"
		>
			<div class="mb-2 flex items-center justify-between">
				<div class="pl-14 text-2xl">Settings</div>
			</div>

			<LabeledSelectInput
				label="Mode:"
				labelClass="min-w-28"
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

			<LabeledTextInput label="Device Name:" labelClass="min-w-28" bind:value={$name} />

			<LabeledSelectInput
				label="Microphone:"
				labelClass="min-w-28"
				bind:value={$selectedAudioInput}
				options={availableAudioDevices.map((device) => ({
					value: device.deviceId,
					label: device.label
				}))}
			/>

			<LabeledSelectInput
				label="Camera:"
				labelClass="min-w-28"
				bind:value={$selectedVideoInput}
				options={availableVideoDevices.map((device) => ({
					value: device.deviceId,
					label: device.label
				}))}
			/>
		</div>
	{/if}
</div>
