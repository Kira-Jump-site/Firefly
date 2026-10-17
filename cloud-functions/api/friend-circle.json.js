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
 try{const response=await fetch(new URL('/assets/recovered-friend-circle.json',request.url));if(response.ok){const body=await response.json();if(Array.isArray(body.article_data)&&body.article_data.length>0)return Response.json(body,{headers:{'cache-control':'public,max-age=300'}})}}catch{}
 return Response.json(emptySnapshot(),{headers:{'cache-control':'public,max-age=60'}});
}
