import {strict as assert} from 'node:assert';
import {randomBytes} from 'node:crypto';
import {readFile,stat} from 'node:fs/promises';
const root='.edgeone';
const config=JSON.parse(await readFile(root+'/cloud-functions/api-node/config.json','utf8'));
assert.equal(config.version,3);
for(const route of [
 '/api/admin/auth/start','/api/admin/auth/me','/api/admin/auth/logout',
 '/api/firefly/session','/api/friend-circle.json','/api/cron/friend-circle',
 '/api/firefly/content','/api/firefly/preview','/api/firefly/settings',
 '/api/firefly/gallery','/api/firefly/imagebed','/api/firefly/backup',
 '/api/firefly/activity','/api/firefly/search','/api/firefly/visibility',
 '/api/firefly/dynamic-feed','/api/firefly/dynamic-feed-public',
 '/api/firefly/capabilities','/api/gallery-public',
 '/api/gallery-image','/api/admin-content-index.json','/api/admin/private-index',
 '/api/live-content/index','/api/live-content/item','/api/live-content/history',
 '/api/live-content/export','/api/live-content/restore','/api/live-content/undo-delete'
])assert(config.routes.some(entry=>entry.dest===route),'Missing EdgeOne build-output route: '+route);
const {onRequest}=await import('../.edgeone/cloud-functions/api-node/index.mjs');
const site='https://firefly-preview.example';
const env={FIREFLY_ADMIN_PASSWORD:'local-test-password',FIREFLY_ADMIN_SESSION_KEY:randomBytes(48).toString('hex')};
async function call(path,options={},extra={}){return onRequest({request:new Request(site+path,options),env:{...env,¶»§q«^