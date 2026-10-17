import test from 'node:test';import assert from 'node:assert/strict';
import {onRequest} from '../cloud-functions/api/gallery-image.js';
test('gallery image proxy rejects wrong paths and unsafe request methods',async()=>{
 for(const key of ['https://host/a.jpg','../../secrets','photos/fun/../secret.jpg','photos/_/evil.svg']){
  const x=await onRequest({request:new Request('https://blog.casto.top/api/gallery-image?key='+encodeURIComponent(key))});assert.equal(x.status,400);
 }
 const r=await onRequest({request:new Request('https://blog.casto.top/api/gallery-image',{method:'POST'})});assert.equal(r.status,405);
});
