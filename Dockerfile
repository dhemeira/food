# syntax=docker/dockerfile:1

FROM node:22.22.1-alpine

WORKDIR /app

# Husky hook installation is a repo-only concern, not needed inside the image.
ENV HUSKY=0

# Install dependencies first so this layer is cached until manifests change.
COPY package.json package-lock.json ./

# The committed lock is generated on Windows and only pins the win32 native
# optional deps, so `npm ci` on Linux installs no rolldown binding. Resolve fresh
# inside the image so the correct platform bindings get installed.
RUN rm -f package-lock.json && npm install --no-audit --no-fund

COPY . .

EXPOSE 5050

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
