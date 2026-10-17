/** EdgeOne-owned public friend-circle feed aggregation. No GitHub Actions or GitHub data dependency. */
export const FRIEND_CIRCLE_SOURCES = Object.freeze([
  ['星宇安全实验室','https://bk.zhaozhiqiang.pw/'],
  ['Lin Blog','https://linlog.top/'],
  ['星空驿站 Starlight Station','https://baiyangmu.xyz/'],
  ['星诺的博客','https://blog.astrvow.com/'],
  ['Aimerting','https://blog.xuioo.com/'],
  ['SengokuCola’sBlog','https://home.nibutupaopao.top/'],
  ['Eric-Termina的博客','https://blog.ericterminal.com/'],
  ['MmzMing的知识库','https://tblog.mmzhiku.xyz/'],
  ['Elykia','https://blog.elykia.cn/'],
  ['十三','https://blog.nw177.cn/'],
  ['versus0','https://blog.542000.xyz/'],
  ['年华','https://blog.520781.xyz/'],
  ['L!!!!ght','https://sunlight.kejk.cn/'],
  ['Hyde Blog','https://seasir.top/'],
  ['番茄主理人','https://fqzlr.com/'],
  ['若木秋光の Blog Ver.3.0','https://blog.rmqg.org/'],
  ['夏夜流萤','https://blog.cuteleaf.cn/'],
]);
export const FRIEND_CIRCLE_KEY='firefly:friend-circle:v2';
export const FRIEND_CIRCLE_STALE_MS=20*60*60*1000;
const decodeEntities=text=>String(text??'').replace(/&(?:amp|lt|gt|quot|apos|nbsp|#(x[0-9a-fA-F]+|\d+));/g,(s,n)=>{
  if(n){const hex=n[0]?.toLowerCase()==='x';const code=Number.parseInt(hex?n.slice(1):n,hex?16:10);return code>0&&code<=0x10ffff?String.fromCodePoint(code):'';}
  return {'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&nbsp;':' '}[s]||s;
});
const strip=text=>decodeEntities(String(text??'').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
const tag=(s,name)=>s.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`,'i'))?.[1]||'';
const attr=(s,name)=>s.match(new RegExp(`\\b${name}=["']([^"']+)["']`,'i'))?.[1]||'';
const validHttpUrl=value=>{try{const u=new URL(decodeEntities(value));return u.protocol==='https:' && !u.username && !u.password && u.hostname.length>3 ?u.href:null}catch{return null}};
export function parseFeed(xml,source,{maxEntries=12}={}){
  if(typeof xml!=='string'||xml.length>800000)return [];
  const site=new URL(source[1]);const blockTag=/<item(?:\s[^>]*)?>[\s\S]*?<\/item>|<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/gi;
  const items=[];
  for(const match of xml.matchAll(blockTag)){
    if(items.length>=maxEntries)break;
    const b=match[0],isAtom=/^<entry/i.test(b);
    const rawLink=isAtom ? (attr(b.match(/<link\b[^>]*rel=['"]alternate['"][^>]*\/?>/i)?.[0]||b.match(/<link\b[^>]*\/?>/i)?.[0]||'','href')||strip(tag(b,'link'))) : strip(tag(b,'link'));
    const link=validHttpUrl(rawLink),title=strip(tag(b,'title')).slice(0,180);
    if(!link||!title)continue;
    const u=new URL(link);if(u.hostname!==site.hostname && !u.hostname.endsWith('.'+site.hostname))continue;
    const rawDate=strip(tag(b,'pubDate')||tag(b,'published')||tag(b,'updated')||tag(b,'dc:date'));
    const timestamp=Date.parse(rawDate);if(!Number.isFinite(timestamp))continue;
    const summary=strip(tag(b,'description')||tag(b,'summary')||tag(b,'content:encoded')||tag(b,'content')).slice(0,240);
    items.push({title,link,summary,author:source[0],avatar:'',created:new Date(timestamp).toISOString()});
  }
  return items;
}
export function feedCandidates(site){const root=new URL(site[1]);if(root.protocol!=='https:')return [];const base=root.origin;
 return [`${base}/rss.xml`,`${base}/feed`,`${base}/atom.xml`];
}
export async function fetchSource(source,{fetchFn=fetch,timeoutMs=1800}={}){
 for(const url of feedCandidates(source)){
   try{
    const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),timeoutMs);
    let resp;try{resp=await fetchFn(url,{method:'GET',redirect:'manual',signal:ctl.signal,headers:{Accept:'application/rss+xml,application/atom+xml,application/xml,text/xml'}})}finally{clearTimeout(timer)}
    if(!resp.ok||resp.status>=300)continue;
    const clen=Number(resp.headers?.get('content-length')||0);if(clen>800000)continue;
    const xml=await resp.text();const items=parseFeed(xml,source);if(items.length)return items;
   }catch{/* Unavailable feed must never fail the entire daily refresh. */}
 }
 return [];
}
export async function aggregateFeeds({sources=FRIEND_CIRCLE_SOURCES,fetchFn=fetch,now=Date.now(),concurrency=5}={}){
 const rows=new Array(sources.length);let next=0;
 const worker=async()=>{while(next<sources.length){const i=next++;rows[i]=await fetchSource(sources[i],{fetchFn});}};
 await Promise.all(Array.from({length:Math.min(Math.max(concurrency,1),sources.length)},worker));
 const seen=new Set();const articles=rows.flat().filter(item=>{if(!item||seen.has(item.link))return false;seen.add(item.link);return true})
  .sort((a,b)=>Date.parse(b.created)-Date.parse(a.created)).slice(0,180);
 const generated=new Date(now).toISOString();return {
  article_data:articles,
  statistical_data:{active_num:rows.filter(x=>x?.length).length,article_num:articles.length,generated_at:generated,last_updated_time:generated.slice(0,10)},
  schema:'firefly-friend-circle-edgeone-v2',
 };
}
export function isFresh(snapshot,{now=Date.now(),ttlMs=FRIEND_CIRCLE_STALE_MS}={}){
 const stamp=Date.parse(snapshot?.statistical_data?.generated_at||'');return Array.isArray(snapshot?.article_data)&&Number.isFinite(stamp)&&now-stamp>=0&&now-stamp<ttlMs;
}
export function emptySnapshot(){return {schema:'firefly-friend-circle-edgeone-v2',article_data:[],statistical_data:{active_num:0,article_num:0,last_updated_time:'尚未采集',generated_at:null},initializing:true};}
