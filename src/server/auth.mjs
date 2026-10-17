import {pbkdf2Sync,randomBytes,createHmac,timingSafeEqual} from 'node:crypto';
export const SESSION_COOKIE='__Host-firefly-session';
const invalid='Authentication unavailable';
function safeEquals(a,b){const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&timingSafeEqual(x,y)}
export function makePasswordHash(password,{iterations=210000,salt=randomBytes(18).toString('hex')}={}){
  if(typeof password!=='string'||password.length<12)throw Error('Administrator password must have at least 12 characters');
  const value=pbkdf2Sync(password,Buffer.from(salt,'hex'),iterations,32,'sha256').toString('hex');
  return `pbkdf2_sha256$${iterations}$${salt}$${value}`;
}
export function verifyPassword(password,stored){
  if(typeof password!=='string'||password.length>4096||typeof stored!=='string')return false;
  const pieces=stored.split('$');if(pieces.length!==4||pieces[0]!=='pbkdf2_sha256')return false;
  const iterations=Number(pieces[1]);const [_,__,salt,digest]=pieces;
  if(!Number.isInteger(iterations)||iterations<100000||iterations>2000000||!/^[0-9a-f]{32,128}$/.test(salt)||!/^[0-9a-f]{64}$/.test(digest))return false;
  const input=pbkdf2Sync(password,Buffer.from(salt,'hex'),iterations,32,'sha256');return safeEquals(input,Buffer.from(digest,'hex'));
}
function digest(secret,data){return createHmac('sha256',secret).update(data).digest('base64url')}
export function issueSession(secret,{now=Date.now(),ttlMs=8*60*60*1000}={}){
  if(!secret||String(secret).length<32)throw Error(invalid);
  const payload=Buffer.from(JSON.stringify({v:1,exp:now+ttlMs,nonce:randomBytes(12).toString('hex')})).toString('base64url');
  return `${payload}.${digest(secret,payload)}`;
}
export function verifySession(token,secret,{now=Date.now()}={}){
  if(typeof token!=='string'||typeof secret!=='string'||secret.length<32)return false;
  const [payload,signature,...extra]=token.split('.');if(!payload||!signature||extra.length||token.length>2000||!safeEquals(signature,digest(secret,payload)))return false;
  try{const data=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));return data.v===1&&Number.isFinite(data.exp)&&data.exp>=now&&data.exp<=now+9*60*60*1000}catch{return false}
}
export function cookieValue(req,name=SESSION_COOKIE){const raw=req.headers.get('cookie')||'';return raw.split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1)||''}
export function isAuthenticated(req,env={}){return verifySession(cookieValue(req),env.FIREFLY_ADMIN_SESSION_KEY)}
export function sameOrigin(req){const origin=req.headers.get('origin');if(!origin)return false;try{return new URL(origin).origin===new URL(req.url).origin}catch{return false}}
const json=(o,status=200,extra={})=>new Response(JSON.stringify(o),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...extra}});
export function sessionHandler(request,env={}) {
  const method=request.method.toUpperCase();
  if(method==='GET')return json({authenticated:isAuthenticated(request,env)});
  if(!sameOrigin(request))return json({error:'Invalid request origin'},403);
  if(method==='DELETE')return json({authenticated:false},200,{'set-cookie':`${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`});
  if(method!=='POST')return json({error:'Method not allowed'},405);
  if(!env.FIREFLY_ADMIN_PASSWORD_HASH||!env.FIREFLY_ADMIN_SESSION_KEY)return json({error:invalid},503);
  if(Number(request.headers.get('content-length')||0)>5000)return json({error:'Request too large'},413);
  return request.json().then(data=>{
    if(!verifyPassword(data?.password,env.FIREFLY_ADMIN_PASSWORD_HASH))return json({error:'Invalid credentials'},401);
    const session=issueSession(env.FIREFLY_ADMIN_SESSION_KEY);
    return json({authenticated:true},200,{'set-cookie':`${SESSION_COOKIE}=${session}; Max-Age=28800; Path=/; HttpOnly; Secure; SameSite=Strict`});
  }).catch(()=>json({error:'Invalid JSON'},400));
}
