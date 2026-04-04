<script lang="ts">
	import Message from '$components/Message.svelte';
	import pickOne from '$lib/pickOne';
	import UserMediaPermissionHelper, {
		type UserMediaPermissionState
	} from '$lib/UserMediaPermissionHelper';
	import { onMount } from 'svelte';

	let { children } = $props();

	let userMediaPermissionHelper: UserMediaPermissionHelper | undefined;
	let userMediaPermissionState = $state<UserMediaPermissionState>({
		isSupported: undefined,
		state: undefined
	});

	onMount(() => {
		//
		// Setup permissions monitoring.
		userMediaPermissionHelper = new UserMediaPermissionHelper();

		// Listen for changing user permission
		userMediaPermissionHelper.on('change', (state) => {
			userMediaPermissionState.isSupported = state.isSupported;
			userMediaPermissionState.state = state.state;
		});

		// Initialize the helper and prompt for permissions if not already granted
		userMediaPermissionHelper.initialize().then(() => {
			const state = userMediaPermissionHelper!.getState();

			if (state.isSupported && state.state === 'prompt') {
				userMediaPermissionHelper!.promptForPermissions();
			}
		});

		return (): void => {
			void userMediaPermissionHelper!.destroy();
			userMediaPermissionHelper = undefined;
		};
	});
</script>

{#if userMediaPermissionState.state === 'granted'}
	{@render children()}
{:else if userMediaPermissionState.state === 'prompt'}
	<Message
		imageSource="yuzu_covering_eyes.png"
		message={pickOne([
			'Can you tap the button so I can look?',
			'Umm... can you help me see?',
			"Peekaboo! I can't see your little one yet."
		])}
		hint="Please click “Allow while visiting the site” to give access to your camera and microphone."
	/>
{:else if userMediaPermissionState.state === 'denied'}
	<Message
		imageSource="yuzu_pouting.png"
		message={pickOne([
			'Oops! The camera is shy.',
			'Looks like you told the camera nope!',
			'Eep! The camera says no!',
			'Oh no... the camera told me no.'
		])}
		hint="Please reset your camera and microphone permissions and reload this page."
	/>
{/if}
