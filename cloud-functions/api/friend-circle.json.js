import {createEdgeOneStore} from '../../src/server/edgeone-store.mjs';
import {FRIEND_CIRCLE_KEY,emptySnapshot} from '../../src/server/friend-circle.mjs';
export async function onRequest({request,env={}}){
 if(request.method!=='GET')return new Response('Method not allowed',{status:405});
 try{
  const store=await createEdgeOneStore({env});
  const result=await store.getJSON(FRIEND_CIRCLE_KEY);
  if(result?.schema==='firefly-friend-circle-edgeone-v2'&&Array.isArray(result.article_data))
   return Response.json(result,{headers:{'cache-control':'public,max-age=300,stale-while-revalidate=900'}});
 }catch{/* On first deploy, allow friends page to render an informative empty state. */}
 return Response.json(emptySnapshot(),{headers:{'cache-control':'public,max-age=60'}});
}
