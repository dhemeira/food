# syntax=docker/dockerfile:1

# Keep this in sync with .nvmrc.
ARG NODE_VERSION=22.22.1

# The full (non-slim) image supplies the libraries VS Code Server expects.
FROM node:${NODE_VERSION}-bookworm

WORKDIR /app

ENV npm_config_audit=false \
    npm_config_fund=false \
    npm_config_update_notifier=false \
    CLAUDE_CONFIG_DIR=/home/node/.claude

# Claude Code, git, GitHub CLI, and the tools needed by VS Code Server and an
# interactive shell. The web dependencies run as the `node` user.
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        bash \
        ca-certificates \
        curl \
        file \
        gh \
        git \
        jq \
        less \
        libsecret-1-0 \
        openssh-client \
        procps \
        ripgrep \
        sudo \
        tar \
        unzip \
        vim-tiny \
        wget \
    && rm -rf /var/lib/apt/lists/* \
    && echo 'node ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/node \
    && chmod 0440 /etc/sudoers.d/node \
    && git config --system --add safe.directory /app

ARG CLAUDE_CODE_VERSION=latest
RUN npm install --global --no-audit --no-fund \
        "@anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}"

RUN chown node:node /app \
    && mkdir -p /home/node/.claude \
    && chown node:node /home/node/.claude

# Install dependencies in the image so a fresh node_modules volume can be
# seeded without a network round trip. The stamp is checked by the entrypoint.
COPY --chown=node:node package.json package-lock.json ./
USER node
RUN HUSKY=0 npm ci --no-audit --no-fund \
    && cat package.json package-lock.json | sha256sum | cut -d' ' -f1 > node_modules/.deps.sha256

COPY --chown=node:node . .
COPY --chown=node:node --chmod=0755 docker/entrypoint.sh /usr/local/bin/docker-entrypoint

EXPOSE 5050

ENTRYPOINT ["/usr/local/bin/docker-entrypoint"]
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
