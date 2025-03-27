<script lang="ts">
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';

	import JsonSocket from '$lib/JsonSocket';
	import Screen from '$components/Screen.svelte';

	let stream: MediaStream | undefined;

	const uuid = uuidv4();

	onMount(async () => {
		stream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true
		});

		const socket = new JsonSocket(
			`ws://${location.hostname}:3000/api/connect?type=camera&uuid=${uuid}`
		);
		socket.connect();
		socket.onMessage(async (message) => {
			console.log(message);

			if (message.subject === 'offer') {
				const monitorUuid = message.sender;

				// Create the peer connection
				const peerConnection = new RTCPeerConnection();

				// Add the video stream to the peer connection.
				for (const track of stream.getTracks()) {
					peerConnection.addTrack(track, stream);
				}

				// Eventlistener for ice candidates
				peerConnection.addEventListener('icecandidate', (event) => {
					if (event.candidate) {
						console.log('sending ice-candidate...');
						socket.send({
							sender: uuid,
							recipient: monitorUuid,
							subject: 'ice-candidate',
							data: event.candidate
						});
					}
				});

				peerConnection.setRemoteDescription(new RTCSessionDescription(message.data));

				const answer = await peerConnection.createAnswer();
				await peerConnection.setLocalDescription(answer);

				console.log('sending answer...');
				socket.send({
					sender: uuid,
					recipient: monitorUuid,
					subject: 'answer',
					data: answer
				});
			}
		});
	});
</script>

{#if stream}
	<Screen mediaStream={stream} />
{/if}

<style lang="scss">
	/* Position the video card in the center of the screen */
	body {
		position: relative;
	}
	.video-card {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
