/** Authenticated photo management. The original Cloudflare image bed remains the sole photo store. */
import {isAuthenticated,sameOrigin} from '../../../src/server/auth.mjs';
const BASE='https://img.casto.top';
const validFolder=v=>typeof v==='string'&&/^photos\/[a-zA-Z0-9_-]{1,100}$/.test(v);
const validKey=v=>typeof v==='string'&&/^photos\/[a-zA-Z0-9_-]{1,100}\/[a-zA-Z0-9_.-]{1,190}$/.test(v)&&!v.includes('..');
function respond(x,status=200){return Response.json(x,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}})}
export async function onRequest({request,env={}}){
 const config={...process.env,...env};
 if(!isAuthenticated(request,config))return respond({error:'Unauthorized'},401);
 if(request.method!=='GET'&&(!sameOrigin(request)||request.headers.get('x-firefly-cms')!=='1'))return respond({error:'Forbidden origin'},403);
 const token=config.FIREFLY_IMAGEBED_TOKEN; if(!token)return respond({error:'Configure FIREFLY_IMAGEBED_TOKEN in EdgeOne (not in GitHub)'},503);
 const url=new URL(request.url),action=url.searchParams.get('action')||'list';
 async function upstream(path,init={}){
   const headers=new Headers(init.headers);headers.set('Authorization',token);headers.set('Accept','application/json');
   const r=await fetch(BASE+path,{...init,headers});const payload=await r.json().catch(()=>({error:'Invalid imagebed response'}));if(!r.ok)throw Object.assign(new Error(payload.message||payload.error||'Imagebed request failed'),{status:r.status})¶»§q«^