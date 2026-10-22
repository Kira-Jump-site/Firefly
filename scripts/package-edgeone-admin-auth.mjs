import{build}from'esbuild';
import{mkdir,stat,readFile,writeFile}from'node:fs/promises';
import{join}from'node:path';
const out='dist/cloud-functions/api';
await mkdir(join(out,'admin/auth'),{recursive:true});
await build({
 entryPoints:{
  'admin/auth/me':'cloud-functions/api/admin/auth/me.js',
  'admin/auth/start':'cloud-functions/api/admin/auth/start.js',
  'admin/auth/logout':'cloud-functions/api/admin/auth/logout.js',
  'firefly/session':'cloud-functions/api/firefly/session.js'
 },
 outdir:out,platform:'node',format:'esm',target:'node20',bundle:true,logLevel:'warning'
});
for(const path of ['admin/auth/me.js','admin/auth/start.js','admin/auth/logout.js','firefly/session.js']){
 if((await stat(join(out,path)).catch(()=>({size:0}))).size<200)throw Error('EdgeOne admin auth route missing: '+path);
}
const original='dist/_astro/AdminApp.BvivyVgR.js';
let js=await readFile(original,'utf8');
const before='e(q)?.oauth||typeof window<"u"&&window.location.hostname==="blog.casto.top"';
if(!js.includes(before))throw Error('Original AdminApp login guard changed. Refusing fragile patch.');
js=js.replace(before,'e(q)?.oauth||typeof window<"u"');
 // The existing PreviewDemoAdmin component is read-only and requires no
 // administrator or GitHub session. Open this existing interface for preview
 // hosts; keep the production site's login flow unchanged.
const previewDemoPatches=[
 ['const q=!1,Q=new Set(', 'const q=typeof window<"u"&&window.location.hostname!=="blog.casto.top",Q=new Set('],
 ['t(B,Q.has(window.location.hostname))','t(B,!q&&Q.has(window.location.hostname))'],
 ['if(e(D)){try{t(w,sessionStorage.getItem(X)==="1")}catch{t(w,!1)}e(w)&&le();return}','if(e(D)){t(w,!0);le();return}']
];
for(const [from,to] of previewDemoPatches){
 if(!js.includes(from))throw Error('Original demo runtime changed: '+from);
 js=js.replace(from,to);
}

const output='AdminApp.FireflyEdgeOne.js';
await writeFile('dist/_astro/'+output,js);
const originalHtml='dist/admin/index.html';
let html=await readFile(originalHtml,'utf8');
if(!html.includes('AdminApp.BvivyVgR.js')&&!html.includes(output))throw Error('Original admin HTML no longer references expected application');
html=html.replaceAll('AdminApp.BvivyVgR.js',output);
await writeFile(originalHtml,html);
console.log('EDGEONE_ADMIN_ENTRY_RESTORED: 4 auth functions, original AdminApp OAuth probe and static page');
