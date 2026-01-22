<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	import Screen from '$components/Screen.svelte';

	interface Props {
		availableAudioDevices: MediaDeviceInfo[];
		availableVideoDevices: MediaDeviceInfo[];
		onConfirm: ({
			selectedAudioInputId,
			selectedVideoInputId
		}: {
			selectedAudioInputId: string;
			selectedVideoInputId: string;
		}) => void;
	}

	let { availableAudioDevices, availableVideoDevices, onConfirm }: Props = $props();

	let currentVideoInputId = $derived(availableVideoDevices[0].deviceId);
	let currentAudioInputId = $derived(availableAudioDevices[0].deviceId);

	const availableVideoDeviceStreams: SvelteMap<string, MediaStream> = new SvelteMap<
		string,
		MediaStream
	>();

	onMount(async () => {
		availableVideoDevices.forEach(async (device) => {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { deviceId: device.deviceId }
			});
			availableVideoDeviceStreams.set(device.deviceId, stream);
		});
	});

	function confirmSelection() {
		onConfirm({
			selectedAudioInputId: currentAudioInputId,
			selectedVideoInputId: currentVideoInputId
		});
	}
</script>

<div class="relative mx-auto flex h-svh max-w-3xl flex-col px-2 py-2">
	<div class="rounded-lg bg-gray-300 p-4">
		<div class="flex items-center justify-between">
			<div class="text-2xl">Select input devices</div>

			<button class="cursor-pointer rounded-lg bg-yellow-200 px-4 py-2" onclick={confirmSelection}>
				Confirm
			</button>
		</div>

		You can always change them in the settings.

		<div
			class="mt-4 flex min-w-0 overflow-clip rounded-lg bg-white outline-yellow-400 focus-within:outline-4"
		>
			<div class="bg-yellow-200 py-2 pr-2 pl-4">Microphone:</div>
			<select
				class="mr-4 min-w-0 grow cursor-pointer px-4 py-2 focus:outline-none"
				bind:value={currentAudioInputId}
			>
				{#each availableAudioDevices as device (device.deviceId)}
					<option value={device.deviceId}>
						{device.label}
					</option>
				{/each}
			</select>
		</div>

		<div
			class="mt-4 flex min-w-0 flex-col overflow-clip rounded-lg bg-white outline-yellow-400 focus-within:outline-4"
		>
			<div class="bg-yellow-200 py-2 pr-2 pl-4">Camera:</div>

			<div class=" grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
				{#each availableVideoDevices as device (device.deviceId)}
					<label class="flex cursor-pointer flex-col overflow-clip rounded-lg">
						<Screen
							stream={availableVideoDeviceStreams.get(device.deviceId)}
							class="rounded-none"
						/>

						<div class="bg-yellow-200 py-2 pr-2 pl-4">
							<input
								type="radio"
								name="camera"
								value={device.deviceId}
								bind:group={currentVideoInputId}
							/>
							{device.label}
						</div>
					</label>
				{/each}
			</div>
		</div>

		<div class="mt-4 flex items-center justify-end">
			<button class="cursor-pointer rounded-lg bg-yellow-200 px-4 py-2" onclick={confirmSelection}>
				Confirm
			</button>
		</div>
	</div>
</div>
