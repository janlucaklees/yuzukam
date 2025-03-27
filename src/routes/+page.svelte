<script lang="ts">
	import { v4 as uuidv4 } from 'uuid';

	import JsonSocket from '$lib/JsonSocket';

	let remotePlayer: HTMLMediaElement;

	const uuid = uuidv4();
	const socket = new JsonSocket(
		`ws://${location.hostname}:3000/api/connect?type=monitor&uuid=${uuid}`
	);
	socket.connect();
	socket.onMessage(async (message) => {
		console.log(message);

		if (message.subject === 'camera-connected') {
			const cameraUuid = message.data.uuid;

			// Create the peer connection
			const peerConnection = new RTCPeerConnection();

			// We need to state that we want to receive video, without sending.
			peerConnection.addTransceiver('video', { direction: 'recvonly' });
			peerConnection.addTransceiver('audio', { direction: 'recvonly' });

			// Eventlistener for ice candidates
			peerConnection.addEventListener('icecandidate', (event) => {
				if (event.candidate) {
					console.log('sending ice-candidate...');
					socket.send({
						sender: uuid,
						recipient: cameraUuid,
						subject: 'ice-candidate',
						data: event.candidate
					});
				}
			});

			// Event listener for displaying remote stream
			peerConnection.addEventListener('track', (event) => {
				console.log('got track!');

				remotePlayer.srcObject = event.streams[0];
			});

			// Handling messages
			socket.onMessage((message) => {
				if (message.sender === cameraUuid && message.subject === 'answer') {
					console.log('got answer!');
					peerConnection.setRemoteDescription(new RTCSessionDescription(message.data));
				}

				if (message.sender === cameraUuid && message.subject === 'ice-candidate') {
					console.log('got ice-candidate!');
					peerConnection.addIceCandidate(message.data);
				}
			});

			const offer = await peerConnection.createOffer();
			await peerConnection.setLocalDescription(offer);

			console.log('sending offer...');
			socket.send({
				sender: uuid,
				recipient: cameraUuid,
				subject: 'offer',
				data: offer
			});
		}
	});
</script>

<div class="video-card rounded border">
	<video bind:this={remotePlayer} class="video" autoplay muted></video>
</div>
