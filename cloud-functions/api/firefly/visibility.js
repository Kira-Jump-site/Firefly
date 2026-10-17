import {createCms,publicSummary} from '../../../src/server/live-cms.mjs';
import {createEdgeOneStore} from '../../../src/server/edgeone-store.mjs';
// Only these *already public* baseline slugs may have their visibility disclosed.
const baseline=new Set(['firefly','firefly-config-manager','mmd-recovery']);
export async function onRequest({request,env={}}){
 if(request.method!=='GET')return Response.json({error:'Method not allowed'},{status:405});
 const ids=(new URL(request.url).searchParams.get('ids')||'').split(',').filter(x=>baseline.has(x)).slice(0,50);
 try{const cms=createCms(await createEdgeOneStore({env}));const statuses={};for(const id of ids){const item=await cms.load('posts',id);statuses[id]=item?(publicSummary(item)?'published':'hidden'):'baseline';}return Response.json({statuses},{headers:{'cache-control':'no-store'}})}catch{return Response.json({error:'Visibility check unavailable'},{status:503})}
}
