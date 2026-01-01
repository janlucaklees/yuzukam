<script lang="ts">
	import OnlineGuard from '$components/guards/OnlineGuard.svelte';
	import PeerManager from '$components/PeerManager.svelte';
	import SignalingSocketProvider from '$components/SignalingSocketProvider.svelte';
</script>

<OnlineGuard>
	<SignalingSocketProvider>
		<PeerManager />
	</SignalingSocketProvider>
</OnlineGuard>
