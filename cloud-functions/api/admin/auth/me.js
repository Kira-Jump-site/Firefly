import {isAuthenticated} from '../../../../src/server/auth.mjs';
export function onRequest({request,env={}}){
 const config={...process.env,...env};
 const loggedIn=isAuthenticated(request,config);
 return Response.json({
  authenticated:loggedIn,
  ...(loggedIn ? {user:{login:'casto-admin'}} : {})
 },{headers:{'Cache-Control':'no-store','X-Firefly-OAuth':'enabled','X-Content-Type-Options':'nosniff'}});
}
