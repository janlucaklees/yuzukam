<script lang="ts">
	import { v4 as uuidv4 } from 'uuid';

	import JsonSocket from '$lib/JsonSocket';

	const uuid = uuidv4();
	const socket = new JsonSocket(
		`ws://${location.hostname}:3000/api/connect?type=monitor&uuid=${uuid}`
	);
	socket.connect();
	socket.onMessage((message) => {
		console.log(message);
	});
</script>
