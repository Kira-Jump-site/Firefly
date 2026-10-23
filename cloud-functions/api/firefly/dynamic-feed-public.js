// EdgeOne live dynamic overlay with tombstone/private suppression.
import {createEdgeOneStore} from '../../../src/server/edgeone-store.mjs';
import {overlayPublicDynamic} from '../../../src/server/live-dynamic-feed.mjs';
export async function onRequest({request,env={}}){
 if(request.method!=='GET')return Response.json({error:'Method not allowed'},{status:405});
 try {
   const url=new URL('/assets/recovered-public-dynamic.json',request.url);
   const r=await fetch(url,{headers:{accept:'application/json'}});
   if(!r.ok)throw Error('Missing recovered public dynamic baseline');
   const baseline=await r.json();
   const rows=await overlayPublicDynamic(await createEdgeOneStore({env:{...process.env,...env}}),baseline);
   return Response.json(rows,{headers:{'cache-control':'public,max-age=15','x-content-type-options':'nosniff'}});
 }catch{return Response.json({error:'Dynamic feed temporarily unavailable'},{status:503,headers:{'cache-control':'no-store'}})}
}
