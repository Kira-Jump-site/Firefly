// Cache-only public photo delivery. No arbitrary URL proxying or private album access.
const PUBLIC='https://gallery-api.casto.top/api/gallery/public';
const ORIGIN='https://img.casto.top/file/';
export async function onRequest({request}){
 if(request.method!=='GET')return new Response('Method not allowed',{status:405});
 const key=new URL(request.url).searchParams.get('key')||'';
 if(!/^photos\/[a-z0-9_-]+\/[a-zA-Z0-9_.-]{1,180}\.(?:jpg|jpeg|png|webp|avif|gif)$/i.test(key)||key.includes('..'))return new Response('Invalid image key',{status:400});
 try{
  // The gallery API returns only publicly listed photos; protected albums never expose their keys.
  const r=await fetch(PUBLIC,{headers:{accept:'application/json'}});
  if(!r.ok)return new Response('Gallery unavailable',{status:503});
  const d=await r.json();const allowed=Array.isArray(d.albums)&&d.albums.some(a=>!a.encrypted&&!a.private&&!a.protected&&!a.password&&!a.passwordHash&&Array.isArray(a.photos)&&a.photos.some(p=>p.key===key));
  if(!allowed)return new Response('Not found',{status:404});
  const url=ORIGIN+key.split('/').map(encodeURIComponent).join('/');const image=await fetch(url,{headers:{accept:'image/avif,image/webp,image/jpeg,image/png,image/gif'}});
  if(!image.ok)return new Response('Photo unavailable',{status:502});
  const type=(image.headers.get('content-type')||'').split(';')[0];if(!/^image\/(?:jpeg|png|webp|avif|gif)$/.test(type))return new Response('Unsupported image',{status:415});
  const size=Number(image.headers.get('content-length')||0);if(size>18_000_000)return new Response('Image too large',{status:413});
  return new Response(image.body,{status:200,headers:{'content-type':type,'cache-control':'public,max-age=3600,s-maxage=86400,stale-while-revalidate=3600','x-content-type-options':'nosniff','x-robots-tag':'noindex'}});
 }catch{return new Response('Image proxy temporarily unavailable',{status:503})}
}
