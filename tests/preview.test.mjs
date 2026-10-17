import test from 'node:test';import assert from 'node:assert/strict';
import {makePasswordHash,issueSession,SESSION_COOKIE} from '../src/server/auth.mjs';
import {onRequest} from '../cloud-functions/api/firefly/preview.js';
const env={FIREFLY_ADMIN_SESSION_KEY:'a'.repeat(64),FIREFLY_ADMIN_PASSWORD_HASH:makePasswordHash('test-password-safe')};
function req({cookie='',origin='https://blog.casto.top',header='1',item={title:'尚未发布',body:'# 草稿\n\n安全内容 <script>alert(1)</script>'}}={}){
 return new Request('https://blog.casto.top/api/firefly/preview',{method:'POST',headers:{'content-type':'application/json','origin':origin,'x-firefly-cms':header,'cookie':cookie},body:JSON.stringify(item)});
}
test('draft preview needs signed admin session',async()=>{let r=await onRequest({request:req(),env});assert.equal(r.status,401)});
test('draft preview refuses foreign origin',async()=>{const c=`${SESSION_COOKIE}=${issueSession(env.FIREFLY_ADMIN_SESSION_KEY)}`;let r=await onRequest({request:req({cookie:c,origin:'https://evil.test'}),env});assert.equal(r.status,403)});
test('authorized preview renders escaped draft without publishing',async()=>{const c=`${SESSION_COOKIE}=${issueSession(env.FIREFLY_ADMIN_SESSION_KEY)}`;const r=await onRequest({request:req({cookie:c}),env});assert.equal(r.status,200);const d=await r.json();assert.ok(d.html.includes('尚未发布'));assert.ok(d.html.includes('&lt;script&gt;'));assert.equal(d.html.includes('<script>alert'),false);assert.equal(r.headers.get('cache-control'),'private,no-store')});
