import {strict as assert} from 'node:assert';
import {randomBytes} from 'node:crypto';
import{readFile}from'node:fs/promises';
import {onRequest as start} from '../dist/cloud-functions/api/admin/auth/start.js';
import {onRequest as me} from '../dist/cloud-functions/api/admin/auth/me.js';
import {onRequest as logout} from '../dist/cloud-functions/api/admin/auth/logout.js';
import {onRequest as session} from '../dist/cloud-functions/api/firefly/session.js';

const host='https://preview.edgeone.example';
const env={FIREFLY_ADMIN_PASSWORD:'test-preview-pass',FIREFLY_ADMIN_SESSION_KEY:randomBytes(48).toString('hex')};
const mk=(route,init)=>new Request(host+route,init);
const auth=(value,nonce)=>start({request:mk('/api/admin/auth/start',{
 method:'POST',headers:{origin:host,'content-type':'application/x-www-form-urlencoded','x-real-ip':'198.51.100.'+nonce},
 body:new URLSearchParams({password:value}).toString()
}),env});
const log=await start({request:mk('/api/admin/auth/start'),env});
assert.equal(log.status,200);const html=await log.text();
assert(html.includes('type="password"')&&!html.includes('github_pat_'),'Password-only auth portal');
assert(!html.includes(env.FIREFLY_ADMIN_PASSWORD),'Password must never leak into HTML');
assert.equal((await me({request:mk('/api/admin/auth/me'),env})).status,200);
const anonymous=await me({request:mk('/api/admin/auth/me'),env});
assert.equal((await anonymous.json()).authenticated,false);
assert.equal(anonymous.headers.get('x-firefly-oauth'),'enabled','Original admin must detect password based OAuth compatibility');
const denied=await auth('incorrect',77);
assert.equal(denied.status,401);
assert(!(denied.headers.get('set-cookie')),'Failure must not set a session');
const passed=await auth(env.FIREFLY_ADMIN_PASSWORD,78);
assert.equal(passed.status,303);
assert.equal(passed.headers.get('location'),'/admin/');
const cookie=passed.headers.get('set-cookie');
assert(cookie?.includes('HttpOnly')&&cookie.includes('Secure')&&cookie.includes('SameSite=Strict'),'Secure cookie');
const sessionValue=cookie.split(';')[0];
const logged=await me({request:mk('/api/admin/auth/me',{headers:{cookie:sessionValue}}),env});
const loggedData=await logged.json();assert(loggedData.authenticated&&loggedData.user.login,'Original admin expects OAuth-style authenticated user');
const status=await session({request:mk('/api/firefly/session',{headers:{cookie:sessionValue}}),env});
assert.equal((await status.json()).authenticated,true);
const signout=await logout({request:mk('/api/admin/auth/logout',{method:'POST',headers:{origin:host,cookie:sessionValue}}),env});
assert.equal(signout.status,200);assert(signout.headers.get('set-cookie')?.includes('Max-Age=0'));
assert.equal((await logout({request:mk('/api/admin/auth/logout',{method:'POST'}),env})).status,403);
const noEnv=await auth('any',79); // separate explicit configuration test is covered via session below
assert.equal(noEnv.status,401);
const unconfigured=await session({request:mk('/api/firefly/session',{method:'POST',headers:{origin:host,'content-type':'application/json'},body:JSON.stringify({password:'a'})}),env:{}});
assert.equal(unconfigured.status,503);
const navbar=await readFile('dist/index.html','utf8');
assert(navbar.includes('data-admin-entry')&&navbar.includes('material-symbols:admin-panel-settings-outline'),'Original admin icon in top navigation');
const admin=await readFile('dist/admin/index.html','utf8');
assert(admin.includes('AdminApp.FireflyEdgeOne.js')&&!admin.includes('AdminApp.BvivyVgR.js'),'Original compiled admin patched for EdgeOne preview login');
const bundle=await readFile('dist/_astro/AdminApp.FireflyEdgeOne.js','utf8');
assert(!bundle.includes('window.location.hostname==="blog.casto.top"'),'Preview custom domain restriction removed');
console.log('EDGEONE_ADMIN_AUTH_VERIFIED: original icon, password login, cookie, logout, original dashboard, preview-domain OAuth detection');
