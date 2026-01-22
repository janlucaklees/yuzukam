<script lang="ts">
	interface Props {
		value: string;
		label: string;
	}

	let { value = $bindable(), label }: Props = $props();
</script>

<label
	class="flex min-w-0 overflow-clip rounded-lg bg-white outline-yellow-400 focus-within:outline-4"
>
	<div class="bg-yellow-200 py-2 pr-2 pl-4">{label}</div>
	<input type="text" class="min-w-0 shrink px-4 py-2 focus:outline-none" bind:value />
</label>
