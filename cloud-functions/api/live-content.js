/**
 * Backwards-compatible read API for the recovered 2026-10-13 admin bundles.
 * Read permissions are REQUIRED for all endpoints because the index includes
 * drafts and private data. Writes return 503 until atomic coordination exists.
 * No GitHub access/token is required.
 */
import {createEdgeOneStore} from '../../src/server/edgeone-store.mjs';
import {createCms,publicContentItem} from '../../src/server/live-cms.mjs';
import {isAuthenticated,sameOrigin} from '../../src/server/auth.mjs';
function frontmatter(body,fields){
 const keys=Object.entries(fields).filter(([k,v])=>typeof k==='string'&&v!==undefined);
 return '---\n'+keys.map(([k,v])=>JSON.stringify(k)+': '+JSON.stringify(v)).join('\n')+'\n---\n'+body;
}
const json=(value,status=200)=>Response.json(value,{status,headers:{'cache-control':'private,no-store','x-content-type-options':'nosniff'}});
function kindOf(raw) {
 if(raw==='post'||raw==='posts')return 'posts';
 if(raw==='dynamic')return 'dynamic';
 return null;
}
const idValid=id=>typeof id==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}$/.test(id);
function asLegacy(item){
 const kind=item.kind==='posts'?'post':'dynamic',meta={...(item.fields||{})};
 const source=typeof item.source==='string'?item.source:frontmatter(item.body||'',meta);
 return {kind,id:item.id,path:meta.path||'src/content/'+(kind==='post'?'posts':'dynamic')+'/'+item.id+'.md',
  source,meta:{...meta,title:item.title,published:item.publishedAt||meta.published||'',draft:item.state!=='published'},
¶»§q«^