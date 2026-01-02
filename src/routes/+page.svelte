<script lang="ts">
	import { type } from '$stores/type';

	import OnlineGuard from '$components/guards/OnlineGuard.svelte';
	import PeerProvider from '$components/providers/PeerProvider.svelte';
	import SignalingSocketProvider from '$components/providers/SignalingSocketProvider.svelte';
	import SignalingSocketGuard from '$components/guards/SignalingSocketGuard.svelte';
	import Camera from '$components/Camera.svelte';
	import CameraPeerGuard from '$components/guards/CameraPeerGuard.svelte';
	import Monitor from '$components/Monitor.svelte';
</script>

<OnlineGuard>
	<SignalingSocketProvider>
		<SignalingSocketGuard>
			<PeerProvider>
				{#if $type === 'camera'}
					<Camera />
				{:else}
					<CameraPeerGuard>
						<Monitor />
					</CameraPeerGuard>
				{/if}
			</PeerProvider>
		</SignalingSocketGuard>
	</SignalingSocketProvider>
</OnlineGuard>
