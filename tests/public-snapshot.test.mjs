import test from 'node:test';
import assert from 'node:assert/strict';
import {extractPublishedPost,dateTime,postMarkdown,dynamicMarkdown} from '../scripts/restore-public-snapshot.mjs';
test('extract public HTML only from post markdown section',()=>{
 const html='<html><div class="nav">secret nav</div><div data-pagefind-body class="markdown-content"><section><h1>标题</h1><div>nested</div></section></div><footer>unrelated</footer></html>';
 const body=extractPublishedPost(html);
 assert.match(body,/标题/);assert.match(body,/nested/);assert.doesNotMatch(body,/secret nav|unrelated/);
});
test('restores published time and image records',()=>{
 const body=dynamicMarkdown({id:'2026-07-19-230848',published:1784492928000,html:'<p>content</p>',images:['https://img.casto.top/hi.webp']});
 assert.match(body,/published: 2026-/);assert.match(body,/img.casto.top/);
});
test('rejects untrusted malformed IDs',()=>assert.throws(()=>dynamicMarkdown({id:'../foo',published:1,html:'a'})));
test('frontmatter preserves observed post path and title',()=>{
 const body=postMarkdown(['moments/mmd-start','2026-05-23',null,'Hello','日常','mmd, 教程','foo'],'<p>Body</p>');
 assert.match(body,/slug: "moments\/mmd-start"/);assert.match(body,/<p>Body<\/p>/);
});
