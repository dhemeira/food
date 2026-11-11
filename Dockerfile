# syntax=docker/dockerfile:1

FROM node:22.22.1-alpine

WORKDIR /app

# Dev tooling: VS Code needs git/ssh; Claude Code needs bash/ripgrep; curl, jq,
# gh, file, and unzip cover the usual API, GitHub, and archive tasks.
RUN apk add --no-cache bash curl file git github-cli jq openssh-client ripgrep unzip

# Install dependencies first so this layer is cached until manifests change.
# HUSKY=0 applies only to the install: hooks are not installed into the image,
# but they are not disabled at runtime, so commits made in the dev container
# run the hooks from the bind-mounted repo.
COPY package.json package-lock.json ./
RUN HUSKY=0 npm ci --no-audit --no-fund

COPY . .

EXPOSE 5050

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
