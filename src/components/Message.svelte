<script lang="ts">
	export let imageSource: string;
	export let message: string;
	export let hint: string;
</script>

<div class="flex h-full flex-col items-center justify-center">
	<img src="/{imageSource}" class="h-56 w-auto" />
	<div class="-mt-4 mb-6 text-2xl">
		{message}
	</div>
	<div class="rounded-xl bg-yellow-200 px-4 py-3 text-center">
		{hint}
	</div>
</div>
