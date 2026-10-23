import {createEdgeOneStore} from '../../../src/server/edgeone-store.mjs';
import {isAuthenticated} from '../../../src/server/auth.mjs';
import {createCms} from '../../../src/server/live-cms.mjs';
import {createGalleryIndex} from '../../../src/server/gallery.mjs';
import {createSettingsService} from '../../../src/server/settings.mjs';
export async function onRequest({request,env={}}){
 const config={...process.env,...env};
 if(!isAuthenticated(request,config))return Response.json({error:'Unauthorized'},{status:401});
 if(request.method!=='GET')return Response.json({error:'Method not allowed'},{status:405});
 try{
  const store=await createEdgeOneStore({env:config});const cms=createCms(store);
  const [posts,dynamic,gallery,settings]=await Promise.all([cms.list('posts',{publicOnly:false}),cms.list('dynamic',{publicOnly:false}),createGalleryIndex(store).get(),createSettingsService(store).get()]);
  const backup={schema:'firefly-recovery-backup-v1',createdAt:new Date().toISOString(),sourceProject:'makers-uwovdt3b3agz',posts,dynamic,gallery,settings};
  return new Response(JSON.stringify(backup,null,2),{headers:{'content-type':'application/json','content-disposition':'attachment; filename="firefly-cms-backup.json"','cache-control':'no-store, private'}});
 }catch{return Response.json({error:'Backup currently unavailable'},{status:503})}
}
