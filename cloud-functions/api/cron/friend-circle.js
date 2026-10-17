import {createEdgeOneStore} from '../../../src/server/edgeone-store.mjs';
import {aggregateFeeds,FRIEND_CIRCLE_KEY,isFresh} from '../../../src/server/friend-circle.mjs';
// EdgeOne Makers schedules -> once daily, not GitHub Actions.
// Safe public endpoint: no arbitrary URL or credentials; if recent, never re-fetch.
let pending=null;
export async function onRequest({request,env={}}){
 if(request.method!=='POST')return new Response('Method not allowed',{status:405});
 if(request.headers.get('origin'))return new Response('Forbidden',{status:403});
 let store;try{store=await createEdgeOneStore({env})}catch{return Response.json({error:'Blob not configured'},{status:503})}
 try{
  const existing=await store.getJSON(FRIEND_CIRCLE_KEY);
  if(isFresh(existing))return Response.json({skipped:true,count:existing.article_data.length,updatedAt:existing.statistical_data.generated_at});
  if(!pending)pending=aggregateFeeds().then(async result=>{
   if(result.article_data.length>0){await store.setJSON(FRIEND_CIRCLE_KEY,result);return result}
   // An upstream outage must not destroy the last non-empty public friend circle.
   return existing||result;
  }).finally(()=>{pending=null});
  const result=await pending;
  return Response.json({ok:true,count:result.article_data.length,updatedAt:result.statistical_data.generated_at});
 }catch{return Response.json({error:'Feed refresh failed'},{status:503})}
}
