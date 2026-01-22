<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { CloseOutline, SettingsOutline } from 'svelte-ionicons';

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
	<div
		transition:fade={{ duration: 750 }}
		class="fixed inset-0 h-screen w-screen bg-yellow-50 opacity-45"
	></div>
{/if}

<div class="fixed top-0 right-0">
	<div class="absolute -left-14 z-40 h-14 w-14 rounded-bl-full shadow-2xl shadow-gray-900"></div>

	<button
		type="button"
		onclick={() => (isMenuOpen = !isMenuOpen)}
		class="absolute -left-14 z-50 flex h-14 w-28 cursor-pointer items-center justify-center rounded-b-full bg-yellow-200 pb-3"
	>
		<div class="absolute left-0 flex h-14 w-14 items-center justify-center pl-3">
			<SettingsOutline />
		</div>
		<div class="absolute right-0 flex h-14 w-14 items-center justify-center pr-3">
			<CloseOutline />
		</div>
	</button>

	{#if isMenuOpen}
		<div
			transition:slide={{ duration: 750, axis: 'x' }}
			class="overflow-clip shadow-2xl shadow-gray-900"
		>
			<div
				class="flex h-screen w-[500px] max-w-screen shrink flex-col gap-4 rounded-bl-lg bg-gray-300 px-4 py-4"
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
		</div>
	{/if}
</div>
