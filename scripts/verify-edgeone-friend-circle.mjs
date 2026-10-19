import {readFile} from 'node:fs/promises';
import {strict as assert} from 'node:assert';
import {onRequest as friend} from '../dist/cloud-functions/api/friend-circle.json.js';
import {onRequest as cron} from '../dist/cloud-functions/api/cron/friend-circle.js';

const response=await friend({request:new Request('https://preview.example/api/friend-circle.json'),env:{}});
assert.equal(response.status,200,'GET must work before Blob is initialized');
assert.equal(response.headers.get('x-firefly-friend-circle-source'),'bundled-snapshot');
const feed=await response.json();
assert(Array.isArray(feed.article_data)&&feed.article_data.length>=50,'original public articles required');
assert(feed.article_data.every(a=>typeof a.title==='string'&&typeof a.link==='string'&&typeof a.author==='string'));
assert(typeof feed.statistical_data==='object','original friend-circle stats required');
assert.equal((await friend({request:new Request('https://preview.example/api/friend-circle.json',{method:'POST'}),env:{}})).status,405);
assert.equal((await friend({request:new Request('https://preview.example/api/friend-circle.json',{method:'HEAD'}),env:{}})).status,200);
assert.equal((await cron({request:new Request('https://preview.example/api/cron/friend-circle',{method:'GET'}),env:{}})).status,405);

const html=await readFile('dist/friends/index.html','utf8');
assert(html.includes('data-friend-circle'),'original friend-circle structure must remain');
assert(html.includes('data-random-refresh'),'original change-article button must remain');
assert(html.includes('/api/friend-circle.json'),'same-origin EdgeOne endpoint must be present');
assert(html.includes('data-fallback-api-urls="[&quot;/assets/recovered-friend-circle.json&quot;]"'),'original UI must have a separate static first-paint fallback');
console.log('EDGEONE_FRIEND_CIRCLE_OK: GET/HEAD/405, bundled 75-article fallback, original HTML, cron entry');
