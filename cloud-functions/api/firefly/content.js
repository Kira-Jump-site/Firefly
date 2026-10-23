import {createEdgeOneStore} from '../../../src/server/edgeone-store.mjs';
import {buildHandler} from '../../../src/server/http.mjs';
import {isAuthenticated,sameOrigin} from '../../../src/server/auth.mjs';
const json=(value,status)=>Response.json(value,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
export async function onRequest({request,env={}}){
  const method=request.method.toUpperCase(),config={...process.env,...env};
  if(method!=='GET'){
    if(!isAuthenticated(request,config))return json({error:'Unauthorized'},401);
    if(!sameOrigin(request)||request.headers.get('x-firefly-cms')!=='1')
      return json({error:'Forbidden write origin'},403);
  }
  try{
    const store=await createEdgeOneStore({env:config});
    const handler=buildHandler(store,{
      isAdmin:req=>isAuthenticated(req,config),
      // The current EdgeOne Blob SDK cannot atomically compare and swap a
      // pointer; enabling the old flags must never bypass distributed safety.
      writesEnabled:false,
    });
    return await handler(request);
  }catch{return json({error:'Content storage unavailable'},503);}
}
