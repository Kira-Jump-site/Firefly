import {createCms,publicContentItem} from './live-cms.mjs';
import {toLegacyDynamic} from './compat.mjs';

// Overlay from EVERY revision head, not just public ones: deleted and private
// records must remove an old public snapshot, never resurrect it.
export async function overlayPublicDynamic(store,baseline=[]){
  const cms=createCms(store);
  const all=await cms.list('dynamic',{publicOnly:false});
  const out=new Map();
  for(const row of Array.isArray(baseline)?baseline:[]){
    if(row && typeof row.id==='string')out.set(row.id,row);
  }
  for(const item of all){
    out.delete(item.id);
    const safe=publicContentItem(item);
    if(safe){
      const legacy=toLegacyDynamic(safe);
      if(legacy)out.set(item.id,legacy);
    }
  }
  return [...out.values()].sort((a,b)=>Number(b.published||0)-Number(a.published||0));
}
