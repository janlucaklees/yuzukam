<script lang="ts">
</script>

<div class="canvas">
	<p class="text-laptop">Put this next to your child</p>
	<img class="arrow-laptop" src="/mockup/arrow.png" alt="" />

	<div class="laptop">
		<img src="/mockup/laptop-screen.png" class="laptop-screen" />
		<img src="/mockup/laptop-mockup.png" class="laptop-mockup" />
	</div>

	<p class="text-phone">Keep watch on your phone</p>
	<img class="arrow-phone" src="/mockup/arrow.png" alt="" />

	<div class="phone">
		<img src="/mockup/phone-screen.png" alt="" class="phone-screen" />
		<img src="/mockup/phone-mockup.png" alt="" class="phone-mockup" />
	</div>
</div>

<style>
	.canvas {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		aspect-ratio: 4 /3;
		width: 1800px;

		outline: 1000px solid black;

		box-sizing: content-box;
	}

	.text-laptop {
		position: absolute;
		top: 130px;
		left: 200px;

		font-size: 80px;
	}

	.arrow-laptop {
		position: absolute;
		top: 240px;
		left: 330px;

		aspect-ratio: 1 / 1;
		height: 180px;

		transform: rotate(100deg);
	}

	.text-phone {
		position: absolute;
		top: 320px;
		left: 780px;

		font-size: 80px;
	}

	.arrow-phone {
		position: absolute;
		top: 420px;
		left: 1280px;

		aspect-ratio: 1 / 1;
		height: 180px;

		transform: rotate(72deg) scale(0.9, 1.1);
	}

	.laptop {
		position: absolute;
		top: 380px;
		left: 80px;
		transform: scale(1.3);

		width: 940.67px;
		height: 940.67px;

		.laptop-screen {
			position: absolute;

			top: 236px;
			left: 154px;
			width: 575px;
			height: 316px;

			object-fit: cover;

			transform-origin: top left;
			transform: perspective(1000px) skewX(15.3deg) skewY(-11deg) rotateY(25deg) rotateX(-3deg);

			border: 4px solid black;
			border-top-width: 6px;
		}

		.laptop-mockup {
			position: absolute;

			width: inherit;
			height: inherit;
		}
	}

	.phone {
		position: absolute;
		top: 370px;
		left: 800px;
		transform: scale(1.3);

		width: 940.67px;
		height: 940.67px;

		.phone-screen {
			position: absolute;

			top: 290px;
			left: 128px;
			width: 694px;
			height: 335px;

			border-radius: 35px;

			/* object-fit: cover; */

			border: 6px solid black;
		}
		.phone-mockup {
			position: absolute;
		}
	}
</style>
