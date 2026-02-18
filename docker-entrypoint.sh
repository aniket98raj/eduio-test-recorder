#!/bin/sh
set -e

# Configure git to trust the mounted testing-stack directory
git config --global --add safe.directory /app/testing-stack 2>/dev/null || true

# Execute the main command
exec "$@"