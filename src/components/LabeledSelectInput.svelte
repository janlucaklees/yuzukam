<script lang="ts">
	interface Props {
		value: string;
		label: string;
		options: { value: string; label: string }[];

		labelClass: string | undefined;
	}

	let { value = $bindable(), label, options, labelClass }: Props = $props();
</script>

<label
	class="flex min-w-0 overflow-clip rounded-lg bg-white outline-yellow-400 focus-within:outline-4"
>
	<div class="bg-yellow-200 py-2 pr-2 pl-4 {labelClass}">{label}</div>
	<select class="mr-4 min-w-0 grow cursor-pointer px-4 py-2 focus:outline-none" bind:value>
		{#each options as option (option.value)}
			<option value={option.value}>
				{option.label}
			</option>
		{/each}
	</select>
</label>
