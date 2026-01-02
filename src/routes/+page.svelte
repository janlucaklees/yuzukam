<script lang="ts">
	import { type } from '$stores/type';

	import RequireInternetConnection from '$components/guards/RequireInternetConnection.svelte';
	import PeerProvider from '$components/providers/PeerProvider.svelte';
	import SignalingSocketProvider from '$components/providers/SignalingSocketProvider.svelte';
	import RequireSignalingSocketConnection from '$components/guards/RequireSignalingSocketConnection.svelte';
	import Camera from '$components/Camera.svelte';
	import RequireCameraPeerPresence from '$components/guards/RequireCameraPeerPresence.svelte';
	import Monitor from '$components/Monitor.svelte';
	import RequireUserMediaPermission from '$components/guards/RequireUserMediaPermission.svelte';
</script>

<RequireInternetConnection>
	<SignalingSocketProvider>
		<RequireSignalingSocketConnection>
			<PeerProvider>
				{#if $type === 'camera'}
					<RequireUserMediaPermission>
						<Camera />
					</RequireUserMediaPermission>
				{:else}
					<RequireCameraPeerPresence>
						<Monitor />
					</RequireCameraPeerPresence>
				{/if}
			</PeerProvider>
		</RequireSignalingSocketConnection>
	</SignalingSocketProvider>
</RequireInternetConnection>
