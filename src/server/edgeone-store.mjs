/** Verified against @edgeone/pages-blob getStore/setJSON/get SDK contracts. */
export async function createEdgeOneStore({env={},getStoreFactory=null}={}) {
  const getStore=getStoreFactory ?? (await import('@edgeone/pages-blob')).getStore;
  const name=env.FIREFLY_BLOB_STORE_NAME || process.env.FIREFLY_BLOB_STORE_NAME || 'firefly-content';
  const store=getStore({name,consistency:'strong'});
  if(!store||typeof store.get!=='function'||typeof store.setJSON!=='function')
    throw new Error('Incompatible @edgeone/pages-blob store interface');
  return {
    getJSON:async key=>(await store.get(key,{type:'json',consistency:'strong'}))??null,
    setJSON:async (key,data)=>store.setJSON(key,data),
    // Blob SDK currently has no documented CAS, strong get does NOT make writes atomic.
  };
}
