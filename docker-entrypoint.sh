#!/bin/sh
set -e

# Create git config directory if it doesn't exist
mkdir -p /home/nextjs
touch /home/nextjs/.gitconfig || true

# Configure git to trust the mounted testing-stack directory
git config --global --add safe.directory /app/testing-stack 2>/dev/null || true

# Execute the main command
exec "$@"