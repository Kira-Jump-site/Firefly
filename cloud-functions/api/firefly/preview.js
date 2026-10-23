import {isAuthenticated,sameOrigin} from '../../../src/server/auth.mjs';
import {renderLivePost} from '../../../src/server/render-live-post.mjs';
// Authenticated draft preview. Does NOT write, publish, or change any storage.
export async function onRequest({request,env={}}){
 if(request.method!=='POST')return Response.json({error:'Method not allowed'},{status:405});
 const config={...process.env,...env};
 if(!isAuthenticated(request,config))return Response.json({error:'Unauthorized'},{status:401});
 if(!sameOrigin(request)||request.headers.get('x-firefly-cms')!=='1')return Response.json({error:'Invalid origin'},{status:403});
 try{
  if(Number(request.headers.get('content-length')||0)>400000)return Response.json({error:'Preview too large'},{status:413});
  const item=await request.json();
  if(!item||typeof item!=='object'||typeof item.body!=='string'||item.body.length>150000||typeof item.title!=='string'||item.title.length>300)
   return Response.json({error:'Invalid draft'},{status:400});
  // Prevent unpublished content or editor metadata being disclosed through public APIs.
  const html=renderLivePost({id:'preview-only',title:item.title,body:item.body,state:'published',fields:{}},{twikooEnv:''});
  return Response.json({html},{headers:{'cache-control':'private,no-store','x-content-type-options':'nosniff'}});
 }catch{return Response.json({error:'Preview failed'},{status:400})}
}
