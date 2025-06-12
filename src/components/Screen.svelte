<script lang="ts">
	let clazz = '';
	export { clazz as class };

	let root: HTMLElement;
	export { root };

	export let stream: MediaStream | undefined;
	export let muted: boolean = true;

	function srcObject(node: HTMLVideoElement, stream: MediaStream) {
		node.srcObject = stream;
		return {
			update(nextStream: MediaStream) {
				node.srcObject = nextStream;
			}
		};
	}
</script>

<div class="relative aspect-4/3 overflow-clip rounded-lg bg-gray-300 {clazz}" bind:this={root}>
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

	<div
		class="absolute top-2 left-2 flex items-center gap-2 rounded-full bg-yellow-200 px-3 py-1 text-xs"
	>
		<slot name="info"></slot>
	</div>

	<div class="absolute right-2 bottom-2 flex gap-2">
		<slot name="controls"></slot>
	</div>
</div>
