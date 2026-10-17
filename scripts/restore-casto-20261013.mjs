import {mkdtemp,mkdir,readFile,writeFile,rm,cp,stat} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
const URL="https://firefly-archive-keeper.guojunyang666666.workers.dev/firefly-original-20261013-bae2cf47.tar.gz";
const SHA="bae2cf471317ba0813e30df964c044b81ec13f11f990da24067878c6b36e764b",BYTES=6907376;
const modules=["AdminApp.BvivyVgR.js","AdminDashboard.vfh0FXr2.js","AdminPostManager.BFNSyUTB.js","AdminDynamicManager.DmUPNvw0.js","GalleryAdminManager.DgIVl1e9.js","AdminSiteSettings.u4IzuQYO.js","AdminBackup.y-T-uhdG.js"];
export async function restoreOriginalAdmin(dist="dist",{fetcher=fetch}={}){
 const temp=await mkdtemp(join(tmpdir(),"firefly-20261013-"));
 try{
  let archive=process.env.FIREFLY_ORIGINAL_ARCHIVE||"";
  if(!archive){
   const response=await fetcher(URL,{redirect:"error",signal:AbortSignal.timeout(90000)});
   if(!response.ok)throw Error("Original archive HTTP "+response.status);
   const bytes=Buffer.from(await response.arrayBuffer());
   if(bytes.length!==BYTES||createHash("sha256").update(bytes).digest("hex")!==SHA)throw Error("Original archive mismatch");
   archive=join(temp,"verified.tar.gz");await writeFile(archive,bytes);
  }else{
   const bytes=await readFile(archive);
   if(bytes.length!==BYTES||createHash("sha256").update(bytes).digest("hex")!==SHA)throw Error("Offline original archive mismatch");
  }
  const files=execFileSync("tar",["-tzf",archive],{encoding:"utf8",maxBuffer:3000000}).split("\n").filter(Boolean);
  if(files.some(x=>x.startsWith("/")||x.split("/").includes("..")||!/^firefly-original-(20261013|media)(\/|$)/.test(x)))throw Error("Unsafe original archive");
  execFileSync("tar",["-xzf",archive,"-C",temp],{timeout:30000});
  const root=join(temp,"firefly-original-20261013"),manifest=JSON.parse(await readFile(join(root,"capture-manifest.json"),"utf8"));
  if(manifest.originalDeploymentId!=="dpo6mvx7243c"||manifest.assets.length<480)throw Error("Wrong original backend build");
  const has=new Set(manifest.assets.map(x=>x.path));
  if(modules.some(n=>!has.has("/_astro/"+n)))throw Error("Missing original backend module");
  for(const a of manifest.assets){
   const path=a.path==="/admin/"?join(root,"admin/index.html"):join(root,a.path.slice(1));
   const bytes=await readFile(path);
   if(bytes.length!==a.size||createHash("sha256").update(bytes).digest("hex")!==a.sha256)throw Error("Original asset corrupted: "+a.path);
  }
  const out=resolve(dist);
  if(!(await stat(join(out,"index.html")).catch(()=>null))?.isFile())throw Error("Astro output missing");
  await cp(join(root,"_astro"),join(out,"_astro"),{recursive:true,force:true});
  const media=join(out,"assets/casto-original");await mkdir(media,{recursive:true});
  const names=["favicon.ico","logo.png","avatar.webp","desktop-1.webp","desktop-2.webp","desktop-3.webp","mobile-1.webp","mobile-2.webp","mobile-3.webp"];
  for(const name of names)await cp(join(temp,"firefly-original-media",name),join(media,name));
  await mkdir(join(out,"favicon"),{recursive:true});await cp(join(media,"favicon.ico"),join(out,"favicon/favicon.ico"));
  const html=(await readFile(join(root,"admin/index.html"),"utf8")).replace("</body>",'<script src="/assets/recovery-admin-gate.js" defer></script></body>');
  if(!html.includes("AdminApp.BvivyVgR.js")||!html.includes("astro-island"))throw Error("Original backend shell invalid");
  await mkdir(join(out,"admin"),{recursive:true});await writeFile(join(out,"admin/index.html"),html);
  await writeFile(join(out,"admin/restoration-provenance.json"),JSON.stringify({deployment:"dpo6mvx7243c",assetCount:manifest.assets.length,sha256:SHA}));
  console.log("Firefly original Oct 13 admin restored:",manifest.assets.length,"verified files");
 }finally{await rm(temp,{recursive:true,force:true})}
}
if(import.meta.url===new URL("file://"+process.argv[1]).href)restoreOriginalAdmin(process.argv[2]||"dist").catch(e=>{console.error(e);process.exitCode=1});
