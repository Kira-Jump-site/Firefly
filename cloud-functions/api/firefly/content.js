import {createEdgeOneStore} from '../../../src/server/edgeone-store.mjs';
import {buildHandler} from '../../../src/server/http.mjs';
import {isAuthenticated,sameOrigin} from '../../../src/server/auth.mjs';
export async function onRequest({request,env={}}){
  const method=request.method.toUpperCase();
  if(method!=='GET' && (!sameOrigin(request)||request.headers.get('x-firefly-cms')!=='1'))
    return new Response(JSON.stringify({error:'Forbidden write origin'}),{status:403,headers:{'content-type':'application/json'}});
  const store=await createEdgeOneStore({env});
  const handler=buildHandler(store,{
    isAdmin: req=>isAuthenticated(req,env),
    // No cross-instance atomic CAS in EdgeOne Blob; unsafe writes NEVER default on.
    writesEnabled:env.FIREFLY_ENABLE_WRITES==='1' && env.FIREFLY_SERIALIZED_WRITES_ACK==='1',
  });
  return handler(request);
}
