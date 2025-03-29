<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import { v4 as uuidv4 } from 'uuid';

	import JsonSocket from '$lib/JsonSocket';
	import RemoteScreen from '$components/RemoteScreen.svelte';

	type ConnectedCamera = {
		uuid: string;
		connection: RTCPeerConnection;
		stream?: MediaStream;
		metaData?: {
			batteryStatus: {
				level: number;
				charging: boolean;
			};
		};
	};

	let connectedCameras = new SvelteMap<string, ConnectedCamera>();

	const uuid = uuidv4();

	const socket = new JsonSocket(
		`ws://${location.hostname}:${location.port}/api/connect?type=monitor&uuid=${uuid}`
	);
	socket.connect();
	socket.onMessage(async (message) => {
		if (message.subject === 'camera-connected') {
			const camera: ConnectedCamera = $state({
				uuid: message.data.uuid,
				connection: new RTCPeerConnection()
			});

			connectedCameras.set(camera.uuid, camera);

			// We need to state that we want to receive video, without sending.
			camera.connection.addTransceiver('video', { direction: 'recvonly' });
			camera.connection.addTransceiver('audio', { direction: 'recvonly' });

			// Eventlistener for ice candidates
			camera.connection.addEventListener('icecandidate', (event) => {
				if (event.candidate) {
					socket.send({
						sender: uuid,
						recipient: camera.uuid,
						subject: 'ice-candidate',
						data: event.candidate
					});
				}
			});

			// Event listener for displaying remote stream
			camera.connection.addEventListener('track', (event) => {
				camera.stream = event.streams[0];
			});

			// Handling messages
			socket.onMessage((message) => {
				if (message.sender === camera.uuid && message.subject === 'answer') {
					camera.connection.setRemoteDescription(new RTCSessionDescription(message.data));
				}

				if (message.sender === camera.uuid && message.subject === 'ice-candidate') {
					camera.connection.addIceCandidate(message.data);
				}
			});

			const offer = await camera.connection.createOffer();
			await camera.connection.setLocalDescription(offer);
			socket.send({
				sender: uuid,
				recipient: camera.uuid,
				subject: 'offer',
				data: offer
			});
		}

		if (message.subject === 'camera-disconnected') {
			connectedCameras.delete(message.data.uuid);
		}

		if (message.subject === 'meta-data') {
			const camera = connectedCameras.get(message.sender);
			camera.metaData = message.data;
		}
	});
</script>

{#key connectedCameras}
	{#each connectedCameras.values() as camera (camera.uuid)}
		{#if camera.stream}
			<RemoteScreen mediaStream={camera.stream} batteryStatus={camera.metaData.batteryStatus} />
		{/if}
	{/each}
{/key}
