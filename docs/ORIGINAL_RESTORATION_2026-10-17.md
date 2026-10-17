# Original Firefly recovery · 2026-10-17
- Source of truth: immutable EdgeOne deployment dpo6mvx7243c, not upstream CuteLeaf or Oct-11 preview.
- Post-build restorer downloads a SHA-256 pinned 6,907,376-byte backup from a separate Cloudflare KV-backed readonly Worker; verifies all 482 admin assets and restores 9 original images.
- Restored /admin frontend is the actual six-module compiled original, not re-authored Svelte sources. Publishing this does not prove live write APIs are complete.
- Personal profile, banners, fixed navbar, 19 original friends (direct original avatar links) and public gallery same-origin route are restored.
- Do not enable weak temporary credentials on production blog.casto.top. The separate temporary writer must have isolated EdgeOne Blob store, strong random server-side cookie key and WAF rate limits. Legacy GitHub OAuth is not migrated by this frontend-only recovery.
- For EdgeOne builder use `pnpm install --no-frozen-lockfile && pnpm build` if the committed pnpm lockfile remains older than @edgeone/pages-blob. Replace with a regenerated lockfile in subsequent maintenance. No GitHub user token or password belongs in source control.
