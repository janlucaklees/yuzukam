FROM oven/bun:1-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies first, to leverage docker build cache.
COPY ./bun.lock ./package.json ./
RUN bun install

# Build the frontend
COPY ./src ./src
COPY ./static ./static
COPY ./svelte.config.js ./tsconfig.json ./vite.config.ts ./
RUN bun run build:frontend

# Build the server
COPY ./src-server ./src-server
RUN bun run build:server


FROM oven/bun:1-alpine

WORKDIR /usr/src/app

# Create a non-root user
RUN addgroup -S yuzukam && adduser -S yuzukam -G yuzukam

# Copy files and set ownership
COPY --from=builder /usr/src/app/build/server/.   /usr/src/app/.
COPY --from=builder /usr/src/app/build/frontend/. /usr/src/app/public/.
RUN chown -R yuzukam:yuzukam /usr/src/app

USER yuzukam
EXPOSE 3000

CMD [ "run", "/usr/src/app/server.js" ]
