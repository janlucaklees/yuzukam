<script lang="ts">
	interface Props {
		imageSource: string;
		message: string;
		hint: string;
	}

	let { imageSource, message, hint }: Props = $props();
</script>

<div class="mx-auto flex h-svh max-w-3xl flex-col items-center justify-center px-4 py-4">
	<img src="/{imageSource}" class="max-h-56 min-h-0" />
	<div class="-mt-4 mb-6 text-center text-2xl">
		{message}
	</div>
	<div class="rounded-xl bg-yellow-200 px-4 py-3 text-center">
		{hint}
	</div>
</div>
