<script lang="ts">
	import OnlineGuard from '$components/guards/OnlineGuard.svelte';
	import PeerManager from '$components/PeerManager.svelte';
	import SignalingSocketProvider from '$components/SignalingSocketProvider.svelte';
	import SignalingSocketGuard from '$components/guards/SignalingSocketGuard.svelte';
</script>

<OnlineGuard>
	<SignalingSocketProvider>
		<SignalingSocketGuard>
			<PeerManager />
		</SignalingSocketGuard>
	</SignalingSocketProvider>
</OnlineGuard>
