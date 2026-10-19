/**
 * EdgeOne deploys outputDirectory=dist, so root cloud-functions/ files alone
 * do NOT become deployed routes. Build self-contained Node Function bundles.
 * Packaging only these two friend-circle routes avoids altering unrelated CMS.
 */
import {build} from 'esbuild';
import {mkdir,writeFile,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';

const out=resolve('dist/cloud-functions/api');
await mkdir(out,{recursive:true});
await build({
  entryPoints:{
    'friend-circle.json':'cloud-functions/api/friend-circle.json.js',
    'cron/friend-circle':'cloud-functions/api/cron/friend-circle.js'
  },
  outdir:out,
  platform:'node',
  format:'esm',
  target:'node20',
  bundle:true,
  minify:false,
  logLevel:'warning',
  legalComments:'none'
});
for(const file of ['friend-circle.json.js','cron/friend-circle.js']){
  const path=join(out,file);
  if((await stat(path)).size<1000)throw Error('Missing/invalid EdgeOne Function: '+file);
}
await writeFile('dist/package.json',JSON.stringify({
  name:'firefly-edgeone-function-output',private:true,type:'module'
},null,2)+'\n');
console.log('EDGEONE_FRIEND_CIRCLE_FUNCTIONS_PACKAGED: /api/friend-circle.json and /api/cron/friend-circle');
