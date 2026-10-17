import test from 'node:test';import assert from 'node:assert/strict';
import {parseFeed,fetchSource,aggregateFeeds,isFresh,emptySnapshot,FRIEND_CIRCLE_SOURCES} from '../src/server/friend-circle.mjs';
const src=['测试朋友','https://example.com/'];
const rss=`<?xml version="1.0"?><rss><channel><item><title>第一篇 &amp; 更新</title><link>https://example.com/posts/one</link><pubDate>Sat, 17 Oct 2026 09:00:00 GMT</pubDate><description><![CDATA[<b>Hello</b> world]]></description></item><item><title>别的域名</title><link>https://attacker.test/steal</link><pubDate>Sat, 17 Oct 2026 09:00:00 GMT</pubDate></item></channel></rss>`;
test('RSS parsing sanitizes fields and only keeps friend-domain links',()=>{
 const a=parseFeed(rss,src);assert.equal(a.length,1);assert.equal(a[0].title,'第一篇 & 更新');assert.equal(a[0].summary,'Hello world');assert.equal(a[0].link,'https://example.com/posts/one');
});
test('Atom entries parse alternate links with dates',()=>{
 const xml='<feed><entry><title>新文章</title><link rel="alternate" href="https://example.com/atom-1"/><updated>2026-10-17T07:00:00Z</updated><summary>本文简介</summary></entry></feed>';
 const a=parseFeed(xml,src);assert.equal(a.length,1);assert.equal(a[0].title,'新文章');
});
test('manual redirect refuses to fetch uncontrolled destination',async()=>{
 const calls=[];const fetchFn=async(url,opts)=>{calls.push(url);assert.equal(opts.redirect,'manual');return {ok:false,status:302,headers:{get:()=>null}}};
 const a=await fetchSource(src,{fetchFn});assert.equal(a.length,0);assert.ok(calls.every(x=>x.startsWith('https://example.com/')));
});
test('aggregator deduplicates and keeps last good fetch available',async()=>{
 const res=await aggregateFeeds({sources:[src,src],fetchFn:async(_url,options)=>({ok:true,status:200,headers:{get:()=>null},text:async()=>rss}),now:Date.parse('2026-10-18T00:00:00Z')});
 assert.equal(res.article_data.length,1);assert.equal(res.statistical_data.active_num,2);assert.ok(isFresh(res,{now:Date.parse('2026-10-18T04:00:00Z')}));assert.equal(isFresh(res,{now:Date.parse('2026-10-19T04:00:00Z')}),false);
});
test('empty state and no GitHub Actions',()=>{assert.equal(emptySnapshot().article_data.length,0);assert.ok(FRIEND_CIRCLE_SOURCES.length>=15);assert.equal(JSON.stringify(FRIEND_CIRCLE_SOURCES).includes('github.com/SteveGuo'),false)});
