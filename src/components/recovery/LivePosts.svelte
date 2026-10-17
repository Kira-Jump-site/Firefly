<script lang="ts">
 import {onMount} from 'svelte';
 type Post={id:string;title:string;fields?:{description?:string;category?:string;tags?:string[]};updatedAt?:string;createdAt?:string};
 let posts:Post[]=$state([]);
 onMount(()=>{let stopped=false;fetch('/api/firefly/content?kind=posts',{cache:'no-store'}).then(r=>r.ok?r.json():{items:[]}).then(d=>{if(!stopped)posts=Array.isArray(d.items)?d.items:[]}).catch(()=>{});return()=>{stopped=true}});
</script>
{#if posts.length}
<section class="card-base p-5 md:p-7" aria-label="实时发布的文章"><h2 class="text-xl font-bold mb-4">最新在线文章</h2>
 {#each posts as post (post.id)}<a class="block p-3 rounded-lg border border-(--line-divider) hover:border-(--primary) mb-2" href={`/posts/${encodeURIComponent(post.id)}/`}><div class="font-bold text-lg">{post.title||post.id}</div>{#if post.fields?.description}<div class="text-sm opacity-70">{post.fields.description}</div>{/if}<small class="text-xs opacity-50">{post.updatedAt||post.createdAt||''}</small></a>{/each}
</section>{/if}
