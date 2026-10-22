import {isAuthenticated,sessionHandler,sameOrigin} from '../../../../src/server/auth.mjs';

const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function loginHtml(error=''){
 const warning=error?'<p class="error" role="alert">'+esc(error)+'</p>':'';
 return '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>内容后台登录 - 星遐蝶梦</title><style>'+
 '*{box-sizing:border-box}body{margin:0;min-height:100dvh;display:grid;place-items:center;padding:24px;font:16px system-ui,-apple-system,"Microsoft YaHei",sans-serif;color:#ebe6f7;background:radial-gradient(ellipse at 20% 10%,#352744 0,transparent 55%),linear-gradient(135deg,#17151e,#282235)}main{width:min(100%,410px);padding:32px;border:1px solid #ffffff20;background:#ffffff0c;backdrop-filter:blur(24px);box-shadow:0 20px 70px #0a061866;border-radius:22px}h1{margin:0 0 10px;font-size:26px}.sub{color:#c4bace;line-height:1.65;margin:0 0 24px}label{display:block;margin-bottom:10px;color:#d8cce7}input{display:block;width:100%;border-radius:12px;padding:14px;font:inherit;color:#fff;background:#ffffff10;border:1px solid #ffffff40;outline-offset:3px}input:focus{outline:2px solid #b88de6}button{margin-top:22px;width:100%;border:0;background:#ae8ad0;color:#21182d;font:600 16px system-ui;border-radius:12px;padding:14px;cursor:pointer}button:hover{background:#c8a6e8}.error{color:#ffd0de;background:#a733462e;padding:12px;border-radius:10px}a{color:#d9b9ff;text-decoration:none}.back{margin-top:22px;text-align:center}</style></head><body><main><h1>内容后台</h1><p class="sub">使用管理员密码登录，管理站点内容。</p>'+warning+
 '<form method="post" action="/api/admin/auth/start"><label for="pw">管理员密码</label><input id="pw" name="password" type="password" autocomplete="current-password" autofocus required maxlength="512"><button type="submit">验证并进入后台</button></form><p class="back"><a href="/">← 返回博客</a></p></main></body></html>';
}
function page(message='',status=200){return new Response(loginHtml(message),{status,headers:{'content-type':'text/html;charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','content-security-policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"}})}
function redirectToAdmin(cookie=null){const headers={'cache-control':'no-store','location':'/admin/'};if(cookie)headers['set-cookie']=cookie;return new Response(null,{status:303,headers})}
const blocked=new Map();
function rateKey(request){return request.headers.get('x-real-ip')||request.headers.get('cf-connecting-ip')||'anonymous';}
export async function onRequest({request,env={}}){
 const config={...process.env,...env};
 if(request.method==='GET')return isAuthenticated(request,config)?redirectToAdmin():page();
 if(request.method!=='POST')return new Response('Method not allowed',{status:405});
 if(!sameOrigin(request))return page('请求来源无效。',403);
 const length=Number(request.headers.get('content-length')||0);
 if(length>4096)return page('请求内容过大。',413);
 const key=rateKey(request),now=Date.now(),old=blocked.get(key);
 if(old && old.until>now && old.count>=5)return page('登录尝试次数过多，请稍后重试。',429);
 const form=await request.formData().catch(()=>null);
 const password=form?.get('password');
 if(typeof password!=='string'||password.length>512)return page('请输入有效密码。',400);
 const loginRequest=new Request(request.url,{
  method:'POST',
  headers:{origin:new URL(request.url).origin,'content-type':'application/json'},
  body:JSON.stringify({password})
 });
 const response=await sessionHandler(loginRequest,config);
 if(!response.ok){
  if(blocked.size>2000)blocked.clear();
  const prev=old?.until>now?old.count:0;
  blocked.set(key,{count:prev+1,until:now+15*60*1000});
  return page(response.status===503?'后台认证尚未配置，请设置 EdgeOne 环境变量。':'密码错误，请重试。',response.status===503?503:401);
 }
 blocked.delete(key);
 return redirectToAdmin(response.headers.get('set-cookie'));
}
