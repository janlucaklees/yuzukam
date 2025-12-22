.PHONY=start
start:
	docker compose stop
	docker compose up -d
	docker compose logs -f frontend

.PHONY=image-build
image-build:
	docker build -t ghcr.io/janlucaklees/yuzukam:latest .

.PHONY=image-publish
image-publish:
	docker push ghcr.io/janlucaklees/yuzukam:latest
