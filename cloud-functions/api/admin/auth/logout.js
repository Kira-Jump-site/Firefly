import {SESSION_COOKIE,sameOrigin} from '../../../../src/server/auth.mjs';
export function onRequest({request}){
 if(request.method!=='POST')return new Response('Method not allowed',{status:405});
 if(!sameOrigin(request))return new Response('Forbidden',{status:403});
 return Response.json({authenticated:false},{headers:{
  'Cache-Control':'no-store','Set-Cookie':SESSION_COOKIE+'=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict'
 }});
}
