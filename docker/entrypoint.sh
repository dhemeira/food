#!/bin/sh
# Entrypoint for the app container.
#
# The repo is bind-mounted over /app, so node_modules is a named volume that
# can outlive the image. Reinstall only when package.json or package-lock.json
# changes, and record the hash inside the volume so restarts are cheap.
set -eu

cd /app

if [ -f package.json ] && [ -f package-lock.json ]; then
    deps_hash="$(cat package.json package-lock.json | sha256sum | cut -d' ' -f1)"
    stamp="node_modules/.deps.sha256"
    installed_hash=""

    if [ -f "$stamp" ]; then
        installed_hash="$(cat "$stamp")"
    fi

    if [ "$deps_hash" != "$installed_hash" ]; then
        echo "[entrypoint] Dependencies are out of date; running npm ci..." >&2
        npm ci --no-audit --no-fund
        printf '%s\n' "$deps_hash" > "$stamp"
    fi

    # Husky's generated hooks directory is gitignored, so a fresh clone needs
    # them recreated. The bind-mounted copy may have been generated on the host
    # (or by root) and not be writable by the container user, so recreate it
    # before running husky.
    if [ -f .husky/pre-commit ]; then
        if [ -d .husky/_ ] && [ ! -w .husky/_ ]; then
            sudo rm -rf -- .husky/_
        fi
        npm run prepare
    fi
fi

# Optional, from .env: persist a git identity in the app home volume.
if [ -n "${GIT_USER_NAME:-}" ]; then
    git config --global user.name "$GIT_USER_NAME"
fi
if [ -n "${GIT_USER_EMAIL:-}" ]; then
    git config --global user.email "$GIT_USER_EMAIL"
fi

exec "$@"
