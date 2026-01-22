<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		root?: HTMLElement;
		stream: MediaStream | undefined;
		muted?: boolean;
		info?: Snippet;
		controls?: Snippet;
	}

	let {
		class: clazz = '',
		root = $bindable(),
		stream,
		muted = true,
		info,
		controls
	}: Props = $props();

	function srcObject(node: HTMLVideoElement, stream: MediaStream) {
		node.srcObject = stream;
		return {
			update(nextStream: MediaStream) {
				node.srcObject = nextStream;
			}
		};
	}
</script>

<div
	class="relative aspect-4/3 min-h-0 overflow-clip rounded-lg bg-gray-300 {clazz}"
	bind:this={root}
>
	{#if stream}
		<video use:srcObject={stream} class="h-full w-full object-cover" autoplay {muted}></video>
	{:else}
		<!-- loading animation -->
		<div class="absolute top-1/2 left-1/2 flex -translate-1/2 gap-1">
			<div class="size-6 animate-bounce rounded-full bg-yellow-200 [animation-delay:-0.3s]"></div>
			<div class="size-6 animate-bounce rounded-full bg-yellow-200 [animation-delay:-0.15s]"></div>
			<div class="size-6 animate-bounce rounded-full bg-yellow-200"></div>
		</div>
	{/if}

	{#if info}
		<div
			class="absolute top-2 left-2 flex items-center gap-2 rounded-full bg-yellow-200 px-3 py-1 text-xs"
		>
			{@render info?.()}
		</div>
	{/if}

	{#if controls}
		<div class="absolute right-2 bottom-2 flex gap-2">
			{@render controls?.()}
		</div>
	{/if}
</div>
