<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		iconEnabled: Component;
		iconDisabled: Component;
		onToggle?: CallableFunction;
		isInitialyEnabled?: boolean;
		size?: number;
		class?: string;
	}

	let {
		class: clazz = '',
		iconEnabled,
		iconDisabled,
		onToggle = () => {},
		isInitialyEnabled = true,
		size = 24
	}: Props = $props();

	let isEnabled = $state(isInitialyEnabled);

	function toggle() {
		isEnabled = !isEnabled;

		onToggle(isEnabled);
	}

	const SvelteComponent = $derived(isEnabled ? iconEnabled : iconDisabled);
</script>

<button
	type="button"
	onclick={toggle}
	class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-yellow-200 {clazz}"
>
	<SvelteComponent {size} />
</button>

<style>
</style>
