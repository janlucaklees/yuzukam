<script lang="ts">
	let isOnline = window.navigator.onLine;

	window.addEventListener('online', () => {
		isOnline = true;
	});

	window.addEventListener('offline', () => {
		isOnline = false;
	});
</script>

{#if isOnline}
	<slot name="online"></slot>
{:else}
	<slot name="offline"></slot>
{/if}
