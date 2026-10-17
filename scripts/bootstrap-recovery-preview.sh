#!/usr/bin/env bash
# Preview-only, not part of EdgeOne production: reconstruct full original-theme tree.
set -uo pipefail
mkdir -p /tmp/firefly-original
curl -fsSL --retry 2 --max-time 180 'https://codeload.github.com/Kira-Jump-site/Firefly/zip/refs/heads/master' -o /tmp/firefly-original.zip || { echo 'UPSTREAM_DOWNLOAD_FAILED' >.recovery-install-log; exit 0; }
unzip -q /tmp/firefly-original.zip -d /tmp/firefly-original
cp -a /tmp/firefly-original/Firefly-master/. .
unzip -qo overlay.zip -d .
node scripts/apply-recovery-config.mjs >>.recovery-install-log 2>&1 || { echo 'PERSONAL_CONFIG_PATCH_FAILED' >>.recovery-install-log; exit 0; }
node scripts/restore-public-snapshot.mjs >>.recovery-install-log 2>&1 || { echo 'PUBLIC_CONTENT_IMPORT_FAILED' >>.recovery-install-log; exit 0; }
node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json'));p.dependencies['@edgeone/pages-blob']='^0.0.18';fs.writeFileSync('package.json',JSON.stringify(p,null,2)+'\n');"
corepack pnpm install --no-frozen-lockfile --ignore-scripts >>.recovery-install-log 2>&1
printf 'install_exit:%s\n' "$?" >>.recovery-install-log
exit 0
