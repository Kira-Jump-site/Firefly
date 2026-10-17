// Upstream DynamicFeed contract, combines the 8 recovered public posts with freshly written EdgeOne CMS items.
import {createEdgeOneStore} from '../../src/server/edgeone-store.mjs';
import {createCms} from '../../src/server/live-cms.mjs';
import {toLegacyDynamicFeed} from '../../src/server/compat.mjs';
export async function onRequest({request,env={}}){
 if(request.method!=='GET')return new Response('Method not allowed',{status:405});
 let baseline=[];
 try{const r=await fetch(new URL('/assets/recovered-public-dynamic.json',request.url));if(r.ok)baseline=await r.json()}catch{}
 let live=[];
 try{const cms=createCms(await createEdgeOneStore({env}));live=toLegacyDynamicFeed(await cms.list('dynamic'))}catch{}
 const m=new Map();for(const d of baseline)if(d?.id)m.set(d.id,d);for(const d of live)if(d?.id)m.set(d.id,d);
 const out=[...m.values()].sort((a,b)=>b.published-a.published);
 return Response.json(out,{headers:{'cache-control':'public,max-age=20,stale-while-revalidate=60','x-content-type-options':'nosniff'}});
}
