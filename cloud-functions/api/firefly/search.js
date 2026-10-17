import {createCms} from '../../../src/server/live-cms.mjs';
import {createEdgeOneStore} from '../../../src/server/edgeone-store.mjs';
import {searchPublicContent} from '../../../src/server/search.mjs';
export async function onRequest({request,env={}}){
 if(request.method!=='GET')return Response.json({error:'Method not allowed'},{status:405});
 const query=new URL(request.url).searchParams.get('q')||'';
 if(query.length>120)return Response.json({error:'Search phrase too long'},{status:400});
 if(query.trim().length<2)return Response.json({items:[]},{headers:{'cache-control':'no-store'}});
 try {const cms=createCms(await createEdgeOneStore({env}));
  const results=searchPublicContent(await cms.list('posts'),query);
  return Response.json({items:results},{headers:{'cache-control':'no-store'}});
 }catch{return Response.json({error:'Search not yet available'},{status:503})}
}
