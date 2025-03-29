<script lang="ts">
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';

	import JsonSocket from '$lib/JsonSocket';
	import LocalScreen from '$components/LocalScreen.svelte';

	let stream: MediaStream | undefined;

	const uuid = uuidv4();

	onMount(async () => {
		stream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true
		});

		const battery = await navigator.getBattery();

		const socket = new JsonSocket(
			`ws://${location.hostname}:${location.port}/api/connect?type=camera&uuid=${uuid}`
		);

		function sendMetaDataUpdate() {
			socket.send({
				sender: uuid,
				recipient: 'monitors',
				subject: 'meta-data',
				data: {
					batteryStatus: {
						level: battery.level,
						charging: battery.charging,
					}
				}
			});
		}

		socket.connect().then(() => {
			sendMetaDataUpdate();
			battery.addEventListener("chargingchange", (event) => sendMetaDataUpdate());
			battery.addEventListener("levelchange", (event) => sendMetaDataUpdate());
		})
		socket.onMessage(async (message) => {
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
						socket.send({
							sender: uuid,
							recipient: monitorUuid,
							subject: 'ice-candidate',
							data: event.candidate
						});
					}
				});

				// Handling messages
				socket.onMessage((message) => {
					if (message.sender === monitorUuid && message.subject === 'ice-candidate') {
						peerConnection.addIceCandidate(message.data);
					}
				});

				peerConnection.setRemoteDescription(new RTCSessionDescription(message.data));

				const answer = await peerConnection.createAnswer();
				await peerConnection.setLocalDescription(answer);
				socket.send({
					sender: uuid,
					recipient: monitorUuid,
					subject: 'answer',
					data: answer
				});

				sendMetaDataUpdate();
			}
		});

	});
</script>

{#if stream}
	<LocalScreen mediaStream={stream} />
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
