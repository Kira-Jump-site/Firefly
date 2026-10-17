import {publicSummary} from './live-cms.mjs';
const truncate=(s,max)=>String(s||'').replace(/\s+/g,' ').trim().slice(0,max);
export function searchPublicContent(entries,query,{limit=50}={}){
 const q=truncate(query,120).toLocaleLowerCase('zh-CN');
 if(q.length<2)return [];
 const hits=[];
 for(const item of entries){
  const summary=publicSummary(item);if(!summary)continue;
  const f=summary.fields||{};
  const needles=[item.title,f.description,f.category,(f.tags||[]).join(' '),item.body];
  if(!needles.some(x=>String(x||'').toLocaleLowerCase('zh-CN').includes(q)))continue;
  const raw=String(item.body||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const pos=raw.toLocaleLowerCase('zh-CN').indexOf(q);
  const excerpt=pos<0?truncate(f.description||raw,190):raw.slice(Math.max(0,pos-55),pos+135);
  hits.push({id:item.id,slug:f.slug||item.id,title:item.title,excerpt,
   category:truncate(f.category,80),tags:Array.isArray(f.tags)?f.tags.slice(0,10):[],
   publishedAt:item.publishedAt,updatedAt:item.updatedAt});
  if(hits.length>=Math.min(100,Math.max(1,limit)))break;
 }
 return hits;
}
