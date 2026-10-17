import {timingSafeEqual,createHash} from 'node:crypto';
import {createCms,CmsError,publicSummary,publicContentItem} from './live-cms.mjs';
import {createGalleryIndex,publicGalleryManifest} from './gallery.mjs';
import {toLegacyDynamicFeed} from './compat.mjs';
function response(value,status=200){return new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}})}
function equalSecret(a,b){
  if(!b||typeof a!=='string')return false;
  const x=createHash('sha256').update(a).digest(),y=createHash('sha256').update(b).digest();
  return timingSafeEqual(x,y);
}
function isAdmin(req,token){return equalSecret(req.headers.get('authorization')?.replace(/^Bearer\s+/i,'')||'',token)}
export function buildHandler(store,config={}) {
  const cms=createCms(store,{enableWrites:config.writesEnabled===true});
  const gallery=createGalleryIndex(store,{enableWrites:false});
  return async function handle(request){
    try {
      const url=new URL(request.url);
      const kind=url.searchParams.get('kind')||'posts';
      const id=url.searchParams.get('id');
      const admin=(typeof config.isAdmin==='function' && config.isAdmin(request)===true) || isAdmin(request,config.adminToken);
      const method=request.method.toUpperCase();
      if(url.pathname.endsWith('/gallery')) {
        if(method!=='GET')return response({error:'Method not allowed'},405);
        // No remote image mutation. Returns only EdgeOne imported index, else 503.
        const m=await gallery.get();
        return m?response(admin?m:publicGalleryManifest(m)):response({error:'Gallery manifest not imported or validated'},503);
      }
      if(url.pathname.endsWith('/dynamic-feed')) {
        if(method!=='GET')return response({error:'Method not allowed'},405);
        return response(toLegacyDynamicFeed(await cms.list('dynamic')));
      }
      if(url.pathname.endsWith('/activity')) {
        if(method!=='GET')return response({error:'Method not allowed'},405);
        return response({lastActivity:await cms.lastActivity()});
      }
      if(method==='GET' && !admin) {
        if(id){const item=await cms.publicItem(kind,id);return item?response(publicContentItem(item)):response({error:'Not found'},404);}
        return response({items:(await cms.list(kind)).map(publicSummary).filter(Boolean)});
      }
      if(!admin)return response({error:'Unauthorized'},401);
      if(method==='GET'){
        const action=url.searchParams.get('action');
        if(action==='history'&&id)return response({history:await cms.history(kind,id)});
        if(id){const item=await cms.load(kind,id);return item?response(item):response({error:'Not found'},404);}
        return response({items:await cms.list(kind,{publicOnly:false})});
      }
      if(method!=='POST')return response({error:'Method not allowed'},405);
      if(Number(request.headers.get('content-length')||0)>2_100_000)return response({error:'Too large'},413);
      const data=await request.json();
      const action=data.action||'update';
      const result=action==='delete'?await cms.tombstone(kind,id,{expectedRev:data.expectedRev}):
        action==='restore'?await cms.restore(kind,id,data.fromRev,{expectedRev:data.expectedRev}):
        await cms.commit(kind,id,data.item,{expectedRev:data.expectedRev??null,mode:action==='create'?'create':'update'});
      return response({item:result},action==='create'?201:200);
    } catch (error) {
      const code=error instanceof CmsError?error.status:error instanceof SyntaxError?400:500;
      return response({error:code===500?'Internal recovery API error':error.message},code);
    }
  }
}
