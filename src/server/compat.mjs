/** Adapter from recovered CMS records to upstream Firefly DynamicFeed.svelte.
 * The live API uses a NEW path because Makers static files shadow Functions.
 * All article body text is escaped: do not turn saved Markdown into raw HTML.
 */
function escapeHtml(v) {
  return String(v ?? '').replace(/[&<>"']/g, c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}
function safeImageSource(src){
  if(typeof src!=='string' || src.length>4096)return null;
  if (/^https:\/\/[^\s]+$/i.test(src)) return src;
  if (/^\/(?!\/)[a-zA-Z0-9_~%/.\-]+$/.test(src) && !src.split('/').includes('..')) return src;
  return null;
}
function imageList(raw){
  if(!Array.isArray(raw)) return [];
  return raw.slice(0,100).flatMap(x=>{
    const src = safeImageSource(typeof x==='string'?x:x?.src);
    return src?[{src, alt:typeof x?.alt==='string'?x.alt.slice(0,300):'',
      ...(typeof x?.title==='string'?{title:x.title.slice(0,300)}:{})}]:[];
  });
}
export function toLegacyDynamic(item){
  if(!item || item.state!=='published') return null;
  const fields=item.fields??{};
  const publishedText = item.publishedAt || item.createdAt || item.updatedAt;
  const published=Date.parse(publishedText ?? '');
  if(!Number.isFinite(published))return null;
  const body=typeof item.body==='string'?item.body:'';
  const rendered=body.split(/\r?\n/).map(escapeHtml).join('<br>');
  const html = `<div class="firefly-dynamic-recovery">${rendered}</div>`;
  const title=typeof item.title==='string'?item.title:'';
  return {id:item.id, published, html, images:imageList(fields.images),
    searchText:`${title} ${body}`.toLocaleLowerCase(),
    pinned:fields.pinned===true,
    ...(typeof fields.location==='string'?{location:fields.location.slice(0,300)}:{})};
}
export function toLegacyDynamicFeed(items){
  if(!Array.isArray(items))throw new TypeError('CMS item list required');
  return items.map(toLegacyDynamic).filter(Boolean).sort((a,b)=>b.published-a.published);
}
