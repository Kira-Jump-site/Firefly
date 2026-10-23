/**
 * EdgeOne Makers Build Output API v3.
 *
 * IMPORTANT: a Node route file copied to dist/cloud-functions/api is NOT an
 * api-node Build Output API bundle, so the prior deployment returned 404.
 * EdgeOne's recognized artifact is .edgeone/cloud-functions/api-node/
 * alongside .edgeone/assets/.
 */
import {build} from 'esbuild';
import {cp,mkdir,readFile,writeFile,rm,readdir,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const target=resolve('.edgeone');
const assets=join(target,'assets');
const api=join(target,'cloud-functions','api-node');
await rm(target,{recursive:true,force:true});
await mkdir(assets,{recursive:true});
await mkdir(api,{recursive:true});
await cp('dist',assets,{recursive:true,filter:source=>!source.includes('/cloud-functions/')&&!source.endsWith('/cloud-functions')});
// Isolate API sources in the single supported index.mjs; no runtime imports
// from the working tree, pnpm workspace or Vercel sandbox.
const entries={
  '/api/admin/auth/start':'./cloud-functions/api/admin/auth/start.js',
  '/api/admin/auth/me':'./cloud-functions/api/admin/auth/me.js',
  '/api/admin/auth/logout':'./cloud-functions/api/admin/auth/logout.js',
  '/api/firefly/session':'./cloud-functions/api/firefly/session.js',
  '/api/firefly/content':'./cloud-functions/api/firefly/content.js',
  '/api/firefly/preview':'./cloud-functions/api/firefly/preview.js',
  '/api/firefly/settings':'./cloud-functions/api/firefly/settings.js',
  '/api/firefly/gallery':'./clou¶»§q«^