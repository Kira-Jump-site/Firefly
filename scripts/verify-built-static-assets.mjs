import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';
const root='dist';
const html=[];
const walk=(dir)=>{for(const entry of readdirSync(dir,{withFileTypes:true})){const p=join(dir,entry.name);if(entry.isDirectory())walk(p);else if(entry.name.endsWith('.html'))html.push(p)}};
walk(root);
const missing=new Map();
for(const f of html){
 const source=readFileSync(f,'utf8');
 for(const match of source.matchAll(/\b(?:src|href)=["'](\/(?:_astro|assets|fonts|gallery-thumbs)\/[^"'?#]+)["']/g)){
  const key=match[1];if(!existsSync(root+key)){const xs=missing.get(key)||[];xs.push(f);missing.set(key,xs)}
 }
}
const article=readFileSync('dist/posts/firefly-config-manager/index.html','utf8');
if(!article.includes('class="expressive-code"')||!article.includes('href="/_astro/ec.a8dky.css"'))throw Error('Expected original Expressive Code HTML and theme stylesheet');
const ec='dist/_astro/ec.a8dky.css';
if(!existsSync(ec)||statSync(ec).size<10000)throw Error('Original syntax highlight CSS missing');
if(missing.size){for(const [p,from] of missing)console.error('MISSING',p,'in',from.slice(0,3).join(', '));throw Error('Dist has '+missing.size+' missing static references')}
console.log('STATIC_ASSETS_VERIFIED: '+html.length+' HTML files; all local asset links resolve; Expressive Code original CSS present');
