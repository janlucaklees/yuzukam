<script lang="ts">
	import type { ClientMetadata } from '$types/ClientMetadata';
	import { ContractOutline, ExpandOutline, VolumeHigh, VolumeMute } from 'svelte-ionicons';
	import BatteryIndicator from './BatteryIndicator.svelte';
	import ToggleButtonIcon from './ToggleButtonIcon.svelte';

	export let mediaStream: MediaStream | undefined;
	export let name: string;
	export let batteryStatus: ClientMetadata['batteryStatus'] = undefined;

	let isMuted = true;

	let clazz = '';
	export { clazz as class };

	let rootElement: HTMLElement;

	function toggleFullscreen(isEnabled: boolean) {
		if (isEnabled) {
			rootElement.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	}

	function srcObject(node: HTMLVideoElement, stream: MediaStream) {
		node.srcObject = stream;
		return {
			update(nextStream: MediaStream) {
				node.srcObject = nextStream;
			}
		};
	}
</script>

<div class="relative overflow-clip {clazz}" bind:this={rootElement}>
	{#if mediaStream}
		<video use:srcObject={mediaStream} class="h-full w-full object-cover" autoplay muted={isMuted}
		></video>
	{:else}
		No signal!
	{/if}

	<div
		class="absolute top-2 left-2 flex items-center gap-2 rounded-full bg-pink-200 px-3 py-1 text-xs"
	>
		{name}

		{#if batteryStatus}
			<BatteryIndicator level={batteryStatus.level} charging={batteryStatus.isCharging} />
		{/if}
	</div>

	<div class="absolute right-2 bottom-2 flex gap-2">
		{#if mediaStream}
			<ToggleButtonIcon
				isInitialyEnabled={false}
				onToggle={(isEnabled: boolean) => (isMuted = !isEnabled)}
				iconEnabled={VolumeHigh}
				iconDisabled={VolumeMute}
				size={18}
			/>
			<ToggleButtonIcon
				isInitialyEnabled={false}
				onToggle={(isEnabled: boolean) => toggleFullscreen(isEnabled)}
				iconEnabled={ContractOutline}
				iconDisabled={ExpandOutline}
				size={18}
			/>
		{/if}
	</div>
</div>

<style>
</style>
