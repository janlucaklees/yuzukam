.PHONY=dev
dev:
	docker compose up -d

.PHONY=image-build
image-build:
	docker build -t ghcr.io/janlucaklees/yuzukam:latest .

.PHONY=image-publish
image-publish:
	docker push ghcr.io/janlucaklees/yuzukam:latest
