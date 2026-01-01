<script lang="ts">
	import '../app.css';

	import Settings from '$components/Settings.svelte';

	let { children } = $props();
</script>

{@render children()}

<Settings />
