import {randomUUID} from 'node:crypto';
const KEY='firefly/site/config/current.json';
const REV_PREFIX='firefly/site/config/revisions/';
export const defaultSettings={title:'星遐蝶梦',description:'星穹漫遐，蝶携清梦。',tagline:'因为Casto.top便宜，所以叫Casto……其实是我推的遐蝶啦（Castorice）',accentHue:282};
export function publicSettings(settings){const s=settings||defaultSettings;return {title:typeof s.title==='string'?s.title:defaultSettings.title,description:typeof s.description==='string'?s.description:defaultSettings.description,tagline:typeof s.tagline==='string'?s.tagline:defaultSettings.tagline,accentHue:Number.isInteger(s.accentHue)&&s.accentHue>=0&&s.accentHue<=360?s.accentHue:282};}
export function createSettingsService(store,{enableWrites=false}={}){
 async function get(){return await store.getJSON(KEY)||null;}
 async function save(data,expectedRevision){
  if(!enableWrites)throw Object.assign(new Error('Settings writes disabled'),{status:503});
  if(!data||typeof data!=='object'||Array.isArray(data)||JSON.stringify(data).length>100000)throw Object.assign(new Error('Invalid config'),{status:400});
  const old=await get();if((old?.revision||null)!==(expectedRevision||null))throw Object.assign(new Error('Settings revision conflict'),{status:409});
  const pub=publicSettings(data);for(const [key,val] of Object.entries(pub))if(key!=='accentHue'&&(typeof val!=='string'||val.length>500))throw Object.assign(new Error('Invalid public text'),{status:400});
  const revision=randomUUID();const result={...data,revision,updatedAt:new Date().toISOString()};
  await store.setJSON(REV_PREFIX+revision+'.json',result);
  await store.setJSON(KEY,result);return result;
 }
 return {get,save};
}
