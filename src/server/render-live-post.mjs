const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function safeParagraph(body){return esc(body).replace(/^### (.*)$/gm,'<h3>$1</h3>').replace(/^## (.*)$/gm,'<h2>$1</h2>').replace(/^# (.*)$/gm,'<h1>$1</h1>').replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>');}
export function renderLivePost(item,{twikooEnv='' }={}){
 if(!item||item.state!=='published')throw Error('Only published items are renderable');
 const f=item.fields||{};if(f.hidden||f.private||f.draft||f.password||f.passwordHash||f.protected)throw Error('Protected content is not renderable');
 const id=encodeURIComponent(item.id);const title=esc(item.title||item.id);const description=esc(f.description||'星穹漫遐，蝶携清梦。');
 const canon='https://blog.casto.top/posts/'+id+'/';
 const published=esc(item.publishedAt||item.createdAt||'');const updated=esc(item.updatedAt||'');
 const comments=twikooEnv&&f.comment!==false?`<section class="card"><h2>评论</h2><div id="tcomment"></div><script src="https://registry.npmmirror.com/twikoo/1.7.14/files/dist/twikoo.min.js" onload="window.twikoo&&twikoo.init({envId:${JSON.stringify(twikooEnv)},el:'#tcomment',path:${JSON.stringify('/posts/'+item.id+'/')},lang:'zh-CN'})"></script></section>`:'';
 return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} - 星遐蝶梦</title><meta name="description" content="${description}"><link rel="canonical" href="${canon}"><link rel="stylesheet" href="/assets/live.css"><meta property="og:type" content="article"><meta property="og:title" content="${title}"></head><body><nav><a href="/">✦ 星遐蝶梦</a> · <a href="/archive/">归档</a> · <a href="/dynamic/">动态</a> · <a href="/gallery/">相册</a></nav><main class="card"><h1>${title}</h1><small>发布时间 ${published} · 最近更新 ${updated}</small><article class="body"><p>${safeParagraph(item.body)}</p></article></main>${comments}<footer>© 星遐蝶梦</footer></body></html>`;
}
