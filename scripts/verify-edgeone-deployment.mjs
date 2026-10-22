import {strict as assert} from 'node:assert';
import {randomBytes} from 'node:crypto';
import {readFile,stat} from 'node:fs/promises';
const root='.edgeone';
const config=JSON.parse(await readFile(root+'/cloud-functions/api-node/config.json','utf8'));
assert.equal(config.version,3);
for(const route of [
 '/api/admin/auth/start','/api/admin/auth/me','/api/admin/auth/logout',
 '/api/firefly/session','/api/friend-circle.json','/api/cron/friend-circle'
])assert(config.routes.some(entry=>entry.dest===route),'Missing EdgeOne build-output route: '+route);
const {onRequest}=await import('../.edgeone/cloud-functions/api-node/index.mjs');
const site='https://firefly-preview.example';
const env={FIREFLY_ADMIN_PASSWORD:'local-test-password',FIREFLY_ADMIN_SESSION_KEY:randomBytes(48).toString('hex')};
async function call(path,options={},extra={}){return onRequest({request:new Request(site+path,options),env:{...env,...extra}})}
const form=await call('/api/admin/auth/start');
assert.equal(form.status,200,'EdgeOne builder index must route auth start');
const body=await form.text();
assert(body.includes('type="password"'),'Original admin should open password form');
assert(!body.includes(env.FIREFLY_ADMIN_PASSWORD),'Password must never appear in delivered HTML');
const me=await call('/api/admin/auth/me');
assert.equal(me.status,200);
assert.equal((await me.json()).authenticated,false);
const denied=await call('/api/admin/auth/start',{method:'POST',headers:{origin:site,'content-type':'application/x-www-form-urlencoded','x-real-ip':'192.0.2.11'},body:'password=nope'});
assert.equal(denied.status,401);
const passed=await call('/api/admin/auth/start',{method:'POST',headers:{origin:site,'content-type':'application/x-www-form-urlencoded','x-real-ip':'192.0.2.12'},body:'password=local-test-password'});
assert.equal(passed.status,303);assert.equal(passed.headers.get('location'),'/admin/');
const cookie=passed.headers.get('set-cookie');
assert(cookie?.includes('HttpOnly')&&cookie.includes('Secure'));
const session=await call('/api/admin/auth/me',{headers:{cookie:cookie.split(';')[0]}});
assert.equal((await session.json()).authenticated,true);
const friend=await call('/api/friend-circle.json');
assert.equal(friend.status,200);
assert((await friend.json()).article_data.length>=50);
const logout=await call('/api/admin/auth/logout',{method:'POST',headers:{origin:site}});
assert.equal(logout.status,200);
for(const path of ['index.html','admin/index.html','friends/index.html','_astro/AdminApp.FireflyEdgeOne.js']){
 assert((await stat(root+'/assets/'+path)).size>1000,'Missing static output: '+path);
}
console.log('EDGEONE_OUTPUT_V3_VERIFIED: 6 routable APIs; HTML GET, login 401/303, authenticated session, logout, friend feed and original assets');
