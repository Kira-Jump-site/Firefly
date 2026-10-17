/** One-time theme personalization. The repo should commit its results, not run this on production builds. */
import {readFile,writeFile} from 'node:fs/promises';
export function replaceExactly(source,find,replacement,name='string'){
 if(!source.includes(find))throw Error(`Unable to find ${name} in upstream theme; refusing unsafe patch`);
 return source.replace(find,replacement);
}
export async function customize({root='.'}={}){
 async function edit(filename,transform){const p=`${root}/${filename}`;const s=await readFile(p,'utf8');const x=transform(s);if(x===s)throw Error(`No change in ${filename}`);await writeFile(p,x,'utf8');}
 await edit('src/config/siteConfig.ts',s=>{
  s=replaceExactly(s,'title: "Firefly",','title: "星遐蝶梦",','site title');
  s=replaceExactly(s,'subtitle: "Demo site",','subtitle: "星穹漫遐，蝶携清梦。",','subtitle');
  s=replaceExactly(s,'site_url: "https://firefly.cuteleaf.cn",','site_url: "https://blog.casto.top",','domain');
  s=replaceExactly(s,'title: "Firefly Blog",','title: "Casto",','navbar title');
  return s;
 });
 await edit('src/config/profileConfig.ts',s=>{
  s=replaceExactly(s,'name: "XiaYe",','name: "Casto",','profile name');
  s=replaceExactly(s,'bio: "Hello, I\'m XiaYe.",','bio: "因为Casto.top便宜，所以叫Casto……其实是我推的遐蝶啦（Castorice）",','profile bio');
  s=replaceExactly(s,'avatar: "assets/images/avatar.avif",','avatar: "/assets/images/avatar-recovered.webp",','avatar');
  s=replaceExactly(s,'https://github.com/CuteLeaf','https://github.com/Kira-Jump-site','GitHub profile link');
  return s;
 });
 await edit('src/config/commentConfig.ts',s=>{
  s=replaceExactly(s,'type: "none",','type: "twikoo",','Twikoo');
  s=replaceExactly(s,'envId: "https://twikoo.vercel.app",','envId: "https://twikoo-netlify-casto.netlify.app/.netlify/functions/twikoo",','Twikoo origin');
  return s;
 });
 await edit('src/config/announcementConfig.ts',s=>replaceExactly(s,'欢迎来到我的博客！这是一则示例公告。','欢迎来到Casto！这是一则示例公告。','announcement'));
 await edit('src/pages/friends.astro',s=>{
  s=replaceExactly(s,'import MainGridLayout from "@/layouts/MainGridLayout.astro";',
   'import MainGridLayout from "@/layouts/MainGridLayout.astro";\nimport FriendCircle from "@/components/recovery/FriendCircle.astro";',
   'friends feature import');
  s=replaceExactly(s,'  {friendsPageConfig.showCustomContent !== false && (',
   '  <FriendCircle />\n\n  {friendsPageConfig.showCustomContent !== false && (',
   'friends circle placement');return s;
 });
 console.log('Theme personalization applied without deleting upstream layout, components or assets.');
}
if(process.argv[1]?.endsWith('apply-recovery-config.mjs'))await customize();
