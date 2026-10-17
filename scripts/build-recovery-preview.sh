#!/usr/bin/env bash
# Diagnostic-only: never misreport build status as production success.
set +e
corepack pnpm build >/tmp/firefly-build-log 2>&1
code=$?
mkdir -p dist
{ echo "ASTRO_BUILD_EXIT=$code"; cat .recovery-install-log 2>/dev/null; echo '=== BUILD OUTPUT ==='; tail -c 140000 /tmp/firefly-build-log; } >/tmp/firefly-result
curl -sS --max-time 30 -X POST -H 'Content-Type: text/plain' --data-binary @/tmp/firefly-result "${FIREFLY_DIAGNOSTIC_URL:-https://example.invalid/}" >/dev/null 2>&1 || true
cp /tmp/firefly-result dist/recovery-preview-build-log.txt
exit 0
