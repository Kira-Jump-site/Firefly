/** Original managers request this path BEFORE loading live overrides.
 * Fail closed for anonymous clients: static content must not reveal drafts.
 */
import {isAuthenticated} from '../../src/server/auth.mjs';
import {createCms} from '../../src/server/live-cms.mjs';
import {createEdgeOneStore} from '../../src/server/edgeone-store.mjs';
const json=(v,status=200)=>Response.json(v,{status,headers:{'cache-control':'private,no-store','x-content-type-options':'nosniff'}});
export async function onRequest({request,env={}}){
 if(request.method!=='GET')return json({error:'Method not allowed'},405);
 const config={...process.env,...env};
 if(!isAuthenticated(request,config))return json({error:'Unauthorized'},401);
 try{
  const cms=createCms(await createEdgeOneStore({env:config}));
  const [posts,dynamics]=await Promise.all([
   cms.list('posts',{publicOnly:false}),cms.list('dynamic',{publicOnly:false})]);
  return json({posts:posts.filter(x=>x.state!=='deleted').map(x=>({
    id:x.id,path:x.fields?.path||'src/content/posts/'+x.id+'.md',title:x.title,
    description:x.fields?.description||'',published:x.publishedAt||'',updated:x.updatedAt||'',
    category:x.fields?.category||'',tags:x.fields?.tags||[],draft:x.state!=='published',
    pinned:x.fields?.pinned===true,image:x.fields?.image||''
   })),dynamics:dynamics.filter(x=>x.state!=='deleted').map(x=>({
    id:x.id,path:x.fields?.path||'src/content/dynamic/'+x.id+'.md',
    published:x.publishedAt||'',pinned:x.fields?.pinned===true¶»§q«^