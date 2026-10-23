/**
 * Capability negotiation for the restored CMS UI.
 * Never imply that a preview identity can edit or that Blob supplies atomic CAS.
 */
import {isAuthenticated} from '../../../src/server/auth.mjs';
export function onRequest({request,env={}}){
 if(request.method!=='GET')return Response.json({error:'Method not allowed'},{status:405});
 const config={...process.env,...env};
 return Response.json({
  schema:'firefly-cms-capabilities-v1',
  authenticated:isAuthenticated(request,config),
  storage:'edgeone-blob',
  reads:true,
  writes:false,
  revisions:true,
  reason:'Atomic distributed compare-and-swap coordinator is not configured'
 },{headers:{'cache-control':'private, no-store','x-content-type-options':'nosniff'}});
}
