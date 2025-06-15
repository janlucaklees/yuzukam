<script lang="ts">
	export let iconEnabled;
	export let iconDisabled;

	export let onToggle: CallableFunction = () => {};
	export let isInitialyEnabled = true;

	export let size = 24;

	let clazz = '';
	export { clazz as class };

	let isEnabled = isInitialyEnabled;

	function toggle() {
		isEnabled = !isEnabled;

		onToggle(isEnabled);
	}
</script>

<button
	type="button"
	on:click={toggle}
	class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-yellow-200 {clazz}"
>
	<svelte:component this={isEnabled ? iconEnabled : iconDisabled} {size} />
</button>

<style>
</style>
