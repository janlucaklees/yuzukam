<script lang="ts">
	import { SettingsOutline, TvOutline, VideocamOutline } from 'svelte-ionicons';

	import { type } from '$stores/type';
	import { name } from '$stores/name';

	import ToggleButtonIcon from '$components/ToggleButtonIcon.svelte';

	let isMenuOpen = false;

	function toggleType(isEnabled: boolean) {
		type.set(isEnabled ? 'camera' : 'monitor');
	}
</script>

<div class="fixed top-0 right-0 flex w-screen justify-end">
	<button
		type="button"
		on:click={() => (isMenuOpen = !isMenuOpen)}
		class="flex h-14 w-14 flex-none cursor-pointer items-center justify-center rounded-bl-full bg-yellow-200 pb-3 pl-3"
	>
		<SettingsOutline />
	</button>

	{#if isMenuOpen}
		<div class="flex h-14 min-w-0 shrink items-center gap-4 bg-gray-300 pr-2 pl-4">
			<ToggleButtonIcon
				isInitialyEnabled={$type === 'camera'}
				onToggle={(isEnabled: boolean) => toggleType(isEnabled)}
				iconEnabled={VideocamOutline}
				iconDisabled={TvOutline}
				size={24}
				class="flex-none !bg-yellow-200"
			/>

			<div
				class="flex min-w-0 shrink overflow-clip rounded-lg bg-white outline-yellow-400 focus-within:outline-4"
			>
				<div class="bg-yellow-200 py-2 pr-2 pl-4">Name:</div>
				<input type="text" class="min-w-0 shrink px-4 py-2 focus:outline-none" bind:value={$name} />
			</div>
		</div>
	{/if}
</div>
