/**
 * EdgeOne Makers Build Output API v3.
 *
 * IMPORTANT: a Node route file copied to dist/cloud-functions/api is NOT an
 * api-node Build Output API bundle, so the prior deployment returned 404.
 * EdgeOne's recognized artifact is .edgeone/cloud-functions/api-node/
 * alongside .edgeone/assets/.
 */
import {build} from 'esbuild';
import {cp,mkdir,readFile,writeFile,rm,readdir,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const target=resolve('.edgeone');
const assets=join(target,'assets');
const api=join(target,'cloud-functions','api-node');
await rm(target,{recursive:true,force:true});
await mkdir(assets,{recursive:true});
await mkdir(api,{recursive:true});
await cp('dist',assets,{recursive:true,filter:source=>!source.includes('/cloud-functions/')&&!source.endsWith('/cloud-functions')});
// Isolate API sources in the single supported index.mjs; no runtime imports
// from the working tree, pnpm workspace or Vercel sandbox.
const entries={
  '/api/admin/auth/start':'./cloud-functions/api/admin/auth/start.js',
  '/api/admin/auth/me':'./cloud-functions/api/admin/auth/me.js',
  '/api/admin/auth/logout':'./cloud-functions/api/admin/auth/logout.js',
  '/api/firefly/session':'./cloud-functions/api/firefly/session.js',
  '/api/friend-circle.json':'./cloud-functions/api/friend-circle.json.js',
  '/api/cron/friend-circle':'./cloud-functions/api/cron/friend-circle.js',
};
const imports=Object.values(entries).map((p,i)=>'import {onRequest as fn'+i+'} from '+JSON.stringify(p)+';').join('\n');
const dispatch=Object.keys(entries).map((p,i)=>'  '+JSON.stringify(p)+': fn'+i+',').join('\n');
const source=`${imports}
const routes={
${dispatch}
};
export async function onRequest(context){
 const path=new URL(context.request.url).pathname.replace(/\\/$/, '') || '/';
 const run=routes[path];
 if(!run)return new Response('Not Found',{status:404});
 return run(context);
}
export default onRequest;
`;
await build({stdin:{contents:source,resolveDir:process.cwd(),sourcefile:'firefly-api-node-router.mjs',loader:'js'},
 outfile:join(api,'index.mjs'),platform:'node',format:'esm',target:'node20',bundle:true,legalComments:'none',logLevel:'warning'});
const config={version:3,routes:Object.keys(entries).map(path=>({src:'^'+path.replaceAll('.','\\.')+'/?$',dest:path}))};
await writeFile(join(api,'config.json'),JSON.stringify(config,null,2)+'\n');
if((await stat(join(api,'index.mjs'))).size<8000)throw Error('Missing full API Node bundle');
for(const file of ['index.html','admin/index.html','friends/index.html']){
 if((await stat(join(assets,file)).catch(()=>({size:0}))).size<1000)throw Error('Original static output missing: '+file);
}
console.log('EDGEONE_OUTPUT_V3: '+config.routes.length+' registered API routes; static assets + api-node bundle');
