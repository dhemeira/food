# syntax=docker/dockerfile:1

FROM node:22.22.1-alpine

WORKDIR /app

# Husky hook installation is a repo-only concern, not needed inside the image.
ENV HUSKY=0

# Install dependencies first so this layer is cached until manifests change.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

EXPOSE 5050

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
