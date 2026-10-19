/**
 * EdgeOne Node Function: GET /api/friend-circle.json
 * Original Firefly friend-circle JSON protocol; no GitHub Actions dependency.
 */
import {createEdgeOneStore} from '../../src/server/edgeone-store.mjs';
import {FRIEND_CIRCLE_KEY} from '../../src/server/friend-circle.mjs';
import originalSnapshot from '../../public/assets/recovered-friend-circle.json';

const isValid = value => value && typeof value === 'object' &&
  Array.isArray(value.article_data) && value.article_data.length > 0 &&
  value.statistical_data && typeof value.statistical_data === 'object';

export async function onRequest({request,env={}}){
  if(request.method!=='GET' && request.method!=='HEAD')
    return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});

  // An initial deployment MUST work before any cron has populated Blob.
  // The snapshot is packaged into the EdgeOne function at build time.
  let result=originalSnapshot;
  let source='bundled-snapshot';
  try{
    const store=await createEdgeOneStore({env});
    const latest=await store.getJSON(FRIEND_CIRCLE_KEY);
    if(isValid(latest)){ result=latest; source='edgeone-blob'; }
  }catch{
    // No Blob binding or a temporary storage outage must not hide all friends.
  }

  if(!isValid(result))return Response.json({error:'Friend circle data unavailable'},{status:503});
  const headers={
    'content-type':'application/json; charset=utf-8',
    'cache-control':'public, max-age=120, stale-while-revalidate=600',
    'x-content-type-options':'nosniff',
    'x-firefly-friend-circle-source':source
  };
  return request.method==='HEAD' ? new Response(null,{status:200,headers})
    : new Response(JSON.stringify(result),{status:200,headers});
}
