/** Read-only recovery of posts/dynamics already publicly visible on blog.casto.top.
 * This is an explicit one-time tool, NOT part of the EdgeOne build pipeline.
 * Requires internet; run only in an isolated development environment.
 */
import {writeFile,mkdir,readdir,unlink} from 'node:fs/promises';
import path from 'node:path';
const BASE='https://blog.casto.top';
const items=[
 ['moments/mmd-start','2026-05-23','2026-05-24','尝试做mmd （1/∞）（还没完成）','日常','mmd, 教程','众所周知：做mmd死路一条……'],
 ['firefly-config-manager','2026-05-12',null,'Firefly 本地管理器','工具','工具','基于简单html文件的专门为Firefly博客模板设计的管理器（GPT5.5配合codex写的）'],
 ['firefly','2026-05-08',null,'Firefly 一款清新美观的 Astro 博客主题模板','文章示例','','Firefly 是一款基于 Astro 框架和 Fuwari 模板开发的清新美观且现代化个人博客主题模板。']
];
export function extractPublishedPost(html){
 const marker='data-pagefind-body class=';const pos=html.indexOf(marker);
 if(pos<0)throw Error('Public post body marker missing');
 const start=html.lastIndexOf('<div ',pos);
 if(start<0)throw Error('Public body container missing');
 const tags=/<\/?div\b[^>]*>/g;tags.lastIndex=start;
 let depth=0,end=0,match;
 while((match=tags.exec(html))){
  if(match[0].startsWith('</'))depth--;else depth++;
  if(depth===0){end=tags.lastIndex;break;}
 }
 if(!end||end<=start)throw Error('Public body container unbalanced');
 return html.slice(start,end).replace(/^<div\b[^>]*>/,'').replace(/<\/div>\s*$/,'')
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')
  .replace(/<a class="anchor"[^>]*>[\s\S]*?<\/a>/gi,'');
}
export function dateTime(ms){
 const d=new Date(ms);if(!Number.isFinite(d.getTime()))throw Error('Invalid published date');
 return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')} ${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}:${String(d.getUTCSeconds()).padStart(2,'0')}`;
}
export function yamlScalar(value){return JSON.stringify(value).replace(/\\n/g,' ')}
export function postMarkdown(meta,body){
 const [slug,published,updated,title,category,tags,description]=meta;
 const front=['---',`title: ${yamlScalar(title)}`,`published: ${published}`];
 if(updated)front.push(`updated: ${updated}`);
 front.push(`description: ${yamlScalar(description)}`,`category: ${yamlScalar(category)}`,`tags: [${tags}]`,`slug: ${yamlScalar(slug)}`,'---','');
 return front.join('\n')+'\n'+body+'\n';
}
export function dynamicMarkdown(item){
 if(!item||!/^\d{4}-\d{2}-\d{2}-\d{6}$/.test(item.id))throw Error('Invalid public dynamic ID');
 let html=String(item.html||'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
 for(const src of item.images||[]){const url=typeof src==='string'?src:(src?.url||src?.src||'');if(/^https?:\/\//.test(url)&&!html.includes(url))html+=`\n\n![原动态图片](${url})`;}
 return `---\npublished: ${dateTime(item.published)}\n---\n\n${html}\n`;
}
export async function recover({fetchFn=fetch,write=true}={}){
 const tasks=[];
 const dyn=await (await fetchFn(`${BASE}/api/dynamic.json`)).json();
 if(!Array.isArray(dyn)||dyn.length<8)throw Error('Refuse to overwrite data with incomplete public dynamic feed');
 for(const d of dyn) tasks.push({path:`src/content/dynamic/${d.id}.md`,body:dynamicMarkdown(d)});
 for(const meta of items){const r=await fetchFn(`${BASE}/posts/${meta[0]}/`);if(!r.ok)throw Error(`Missing published post ${meta[0]} (${r.status})`);tasks.push({path:`src/content/posts/${meta[0]}.md`,body:postMarkdown(meta,extractPublishedPost(await r.text()))});}
 if(write){
  // Remove only known upstream demo content, not the user's restored records.
  for(const folder of ['src/content/dynamic','src/content/posts']){
    async function removeDemo(dir){try{for(const entry of await readdir(dir,{withFileTypes:true})){
      const target=path.join(dir,entry.name);
      if(entry.isDirectory())await removeDemo(target);
      else if(/\.(?:md|mdx)$/.test(entry.name))await unlink(target);
    }}catch(e){if(e.code!=='ENOENT')throw e}}
    await removeDemo(folder);
  }
  for(const t of tasks){await mkdir(path.dirname(t.path),{recursive:true});await writeFile(t.path,t.body,'utf8');}
 }
 return tasks;
}
if(process.argv[1]?.endsWith('restore-public-snapshot.mjs')){
 const tasks=await recover();console.log(`Recovered ${tasks.length} public content files without inventing missing data.`);
}
