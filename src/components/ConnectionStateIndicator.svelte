<script lang="ts">
	//
	// Props
	export let state: RTCPeerConnectionState;
</script>

{#if state === 'connected'}
	<div class="size-3 rounded-full bg-green-600"></div>
{:else if state === 'failed' || state === 'disconnected' || state === 'closed'}
	<div class="size-3 animate-bounce rounded-full bg-red-600"></div>
{:else}
	<span class="relative flex size-3">
		<span class="absolute inline-flex size-3 animate-ping rounded-full bg-blue-600 opacity-75"
		></span>
		<span class="relative inline-flex size-3 rounded-full bg-blue-500"></span>
	</span>
{/if}
