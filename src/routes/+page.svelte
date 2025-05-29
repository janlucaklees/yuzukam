<script lang="ts">
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import getOrSetLocalStorageValue from '$lib/getOrSetLocalStorageValue';
	import Transceiver from '$components/Transceiver.svelte';
	import Screen from '$components/Screen.svelte';

	const uuid = getOrSetLocalStorageValue('localUuid', uuidv4());

	let stream: MediaStream | undefined;
	onMount(async () => {
		stream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true
		});
	});
</script>

<div>
	uuid:{uuid}
</div>

{#if stream}
	<Screen mediaStream={stream} />
	<Transceiver {uuid} {stream} />
{/if}
