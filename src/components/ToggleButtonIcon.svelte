<script lang="ts">
	export let iconEnabled;
	export let iconDisabled;

	export let onToggle: CallableFunction = () => {};

	let isEnabled = true;

	function toggle() {
		isEnabled = !isEnabled;

		onToggle(isEnabled);
	}
</script>

<button
	type="button"
	on:click={toggle}
	class="button {!isEnabled && 'button--disabled'} rounded border"
>
	<svelte:component this={isEnabled ? iconEnabled : iconDisabled} />
</button>

<style lang="scss" scoped>
	.button {
		min-width: 4rem;
		height: 4rem;

		padding: 0.5em 1em;

		display: flex;
		align-items: center;
		justify-content: center;

		background: white;

		font-size: 1.1rem;
		color: green;

		cursor: pointer;
	}

	.button--disabled {
		filter: saturate(0);
		opacity: 0.5;
	}
</style>
