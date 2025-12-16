<script lang="ts">
	import OfflineDetector from '$components/OfflineDetector.svelte';
	import Message from '$components/Message.svelte';
	import PeerManager from '$components/PeerManager.svelte';
	import SignalingSocketProvider from '$components/SignalingSocketProvider.svelte';
	import pickOne from '$lib/pickOne';
</script>

<OfflineDetector>
	<svelte:fragment slot="online">
		<SignalingSocketProvider>
			<PeerManager />
		</SignalingSocketProvider>
	</svelte:fragment>
	<svelte:fragment slot="offline">
		<Message
			imageSource="yuzu_disconnected.png"
			message={pickOne([
				'Yikes! The internet ran off!',
				'Hello? Internet? Where’d you go?',
				'Uh-oh… Internet is hiding again!'
			])}
			hint="There’s no internet connection. Please check your Wi-Fi or network settings."
		/>
	</svelte:fragment>
</OfflineDetector>
