---
title: "Firefly 本地管理器"
published: 2026-05-12
description: ""
category: "工具"
tags: ["工具"]
slug: "firefly-config-manager"
---

<section><h1 id="firefly-本地管理器">Firefly 本地管理器</h1><a id="GC17k22i-card" class="card-github no-styling" href="https://github.com/SteveGuo1726/firefly-config-manager" target="_blank" repo="SteveGuo1726/firefly-config-manager"><div class="gc-titlebar"><div class="gc-titlebar-left"><div class="gc-owner"><div id="GC17k22i-avatar" class="gc-avatar" style="background-image: url(&#x22;https://avatars.githubusercontent.com/u/175320411?v=4&#x26;s=32&#x22;); background-color: transparent;"></div><div class="gc-user">SteveGuo1726</div></div><div class="gc-divider">/</div><div class="gc-repo">firefly-config-manager</div></div><div class="github-logo"></div></div><div id="GC17k22i-description" class="gc-description">基于简单html文件的专门为Firefly博客模板设计的管理器（GPT5.5配合codex编写，人工检查）</div><div class="gc-infobar"><div id="GC17k22i-stars" class="gc-stars">—</div><div id="GC17k22i-forks" class="gc-forks">—</div><div id="GC17k22i-license" class="gc-license">no-license</div><span id="GC17k22i-language" class="gc-language">HTML</span></div></a><p><a href="https://github.com/SteveGuo1726/firefly-config-manager" target="_blank" rel="noopener noreferrer">https://github.com/SteveGuo1726/firefly-config-manager</a></p><p><code>firefly-config-manager.html</code> 是一个用于管理 Firefly / Fuwari / Astro 博客的本地图形化工具。它通过浏览器的本地目录读写能力修改仓库里的配置文件和文章文件，不会上传任何内容。</p><section><h2 id="打开方式">打开方式</h2><ol>
<li>
<p>使用最新版 Chrome 或 Edge 打开 <code>firefly-config-manager.html</code>。</p>
</li>
<li>
<p>点击左侧的“选择网站仓库”。</p>
</li>
<li>
<p>选择 Firefly 网站仓库目录，例如：</p>
</li>
</ol><div class="expressive-code"><link rel="stylesheet" href="/_astro/ec.a8dky.css"><figure class="frame"><figcaption class="header"></figcaption><pre data-language="text"><code><div class="ec-line"><div class="gutter"><div class="ln" aria-hidden="true">1</div></div><div class="code"><span style="--0:#abb2bf;--1:#383a42">E:\Blog\Firefly</span></div></div></code></pre><div class="copy"><div aria-live="polite"></div><button title="Copy to clipboard" data-copied="Copied!" data-code="E:\Blog\Firefly"><div></div></button></div></figure></div><ol start="4">
<li>
<p>在界面中修改配置或文章。</p>
</li>
<li>
<p>点击右上角“保存全部修改”写入磁盘。</p>
</li>
</ol><p>Firefox 和 Safari 通常不支持这个 HTML 文件所需的目录写入 API，因此建议使用 Chrome 或 Edge。</p></section><section><h2 id="主要功能">主要功能</h2><section><h3 id="配置管理">配置管理</h3><p>工具会读取 <code>src/config</code> 下的主要配置文件，并把常用设置做成表单：</p><p>左侧导航栏可以折叠，适合在小屏幕或编辑长配置时腾出更多横向空间。</p><ul>
<li>
<p>站点与 SEO：标题、副标题、站点 URL、语言、描述、关键词、favicon、建站日期、时区、OpenGraph、分享海报、最后修改时间。</p>
</li>
<li>
<p>主题与布局：主题色、默认亮暗模式、页面宽度、卡片边框、分类栏、文章列表布局、分页、图片优化。</p>
</li>
<li>
<p>首页与壁纸：banner / overlay / none 模式、桌面和移动端壁纸、首页标题和副标题、打字机、署名、透明导航栏、轮播、水波、遮罩透明度。</p>
</li>
<li>
<p>导航与页面：导航 Logo、导航标题、菜单对齐、粘性导航栏、搜索方式、朋友页、赞助页、留言页、Bangumi、画廊、侧边栏组件。</p>
</li>
<li>
<p>导航栏高级配置：<code>navBarConfig.ts</code> 中 <code>getDynamicNavBarConfig()</code> 的基础 <code>links</code> 数组和后续 <code>links.push(...)</code> 动态追加逻辑都可以在“导航与页面”页直接编辑，支持 <code>LinkPreset.*</code>、自定义链接、多级菜单、外链和图标。</p>
</li>
<li>
<p>个人资料：头像、名称、简介、社交链接、许可证、页脚配置、页脚 HTML。</p>
</li>
<li>
<p>内容组件：公告、随机封面、友链、画廊、赞助、广告。</p>
</li>
<li>
<p>评论系统：none、Twikoo、Waline、Giscus、Disqus、Artalk 及其详细参数。</p>
</li>
<li>
<p>音乐播放器：Meting、本地播放列表、平台、歌单 ID、音量、循环模式、歌词、备用 API。</p>
</li>
<li>
<p>外观增强：字体、樱花、Live2D / Spine、代码块、PlantUML。</p>
</li>
<li>
<p>统计分析：Google Analytics、Microsoft Clarity、Umami、Relpays、51la。</p>
</li>
</ul><p>新版 Firefly 的部分配置支持多种写法，例如壁纸 <code>src</code> 可以是字符串、数组或 <code>{ desktop, mobile }</code> 对象，Banner 署名、水波、Overlay 可切换项也可以是布尔值或桌面/移动端对象。管理器会优先提供直观字段，同时保留“完整配置”编辑框，方便处理这些联合类型结构。</p><p>新版 <code>siteConfig.ts</code> 顶部使用 <code>SITE_LANG</code> 常量定义站点语言，表单里的“站点语言”会直接读写这个常量，不再把底部 <code>lang: SITE_LANG</code> 改成固定字符串。</p><p>新版 <code>navBarConfig.ts</code> 的导航链接由 <code>getDynamicNavBarConfig()</code> 动态生成，普通表单只管理搜索方式和页面开关。若要调整复杂导航层级、自定义菜单或动态逻辑，请到“源码编辑”页打开 <code>navBarConfig.ts</code> 修改原始 TypeScript。</p><p>如果某些设置过于复杂，或者配置文件中有动态函数，可以到“源码编辑”页直接修改原始 TypeScript / HTML。</p><p>新版进一步把赞助方式、赞助者列表、广告、看板娘、页脚开关等配置做成了结构化表单，减少直接写 JSON 的情况。</p><p>如果某个配置字段在当前文件中没有显式写出，但类型定义允许它作为可选字段存在，管理器会先显示一个默认空值；修改后会自动把该属性插入到对应配置对象中。这样上游新增的可选字段不会再因为“未找到”而只能去源码页手改。</p><p>上游近期把樱花特效配置从 <code>sakuraConfig.ts</code> 重命名并集中到 <code>effectsConfig.ts</code>，壁纸配置也把首页文字、导航透明、水波和渐变等通用项移动到了 <code>backgroundWallpaper.common.*</code>，并新增 <code>fullscreen</code> 壁纸模式。当前管理器已按这些新字段读取和写入。</p><p>侧边栏组件数组支持编辑组件类型、启用状态、位置、文章页/非文章页显示、广告配置 ID、响应式隐藏设备、折叠阈值和自定义属性。复杂对象仍可通过对应完整配置或源码页兜底编辑。</p></section><section><h3 id="文章元数据管理">文章元数据管理</h3><p>工具会读取：</p><div class="expressive-code"><figure class="frame"><figcaption class="header"></figcaption><pre data-language="text"><code><div class="ec-line"><div class="gutter"><div class="ln" aria-hidden="true">1</div></div><div class="code"><span style="--0:#abb2bf;--1:#383a42">src/content/posts</span></div></div></code></pre><div class="copy"><div aria-live="polite"></div><button title="Copy to clipboard" data-copied="Copied!" data-code="src/content/posts"><div></div></button></div></figure></div><p>支持管理 <code>.md</code> 和 <code>.mdx</code> 文件的 Frontmatter：</p><ul>
<li>
<p>文章列表搜索。</p>
</li>
<li>
<p>在文章详情中提供“打开源文件”入口，方便直接跳到 <code>.md</code> / <code>.mdx</code> 文件。</p>
</li>
<li>
<p>新建文章。</p>
</li>
<li>
<p>编辑标题、发布时间、更新时间、分类、标签、封面、描述、slug、语言、作者、来源链接。</p>
</li>
<li>
<p>切换草稿、置顶、评论。</p>
</li>
<li>
<p>编辑许可证字段。</p>
</li>
<li>
<p>编辑文章密码和密码提示。</p>
</li>
</ul><p>正文内容不会在这个工具中编辑，保存文章时会保留原正文，只重写 Frontmatter。文章保存时同样会进入备份会话。</p></section><section><h3 id="资源预览">资源预览</h3><ul>
<li>
<p>图片、头像、封面、广告图、二维码、Logo 等图片类路径会尽量显示紧凑缩略图。</p>
</li>
<li>
<p>外链图片会直接预览。</p>
</li>
<li>
<p>本地图片路径会尝试从仓库根目录、<code>public</code>、<code>src</code> 中读取，并用浏览器 <code>blob:</code> URL 显示。</p>
</li>
<li>
<p>壁纸配置的桌面和移动端路径支持图库式预览，缩略图按比例缩小，不会拉长界面。</p>
</li>
<li>
<p>修改图片类路径后，界面会自动刷新预览。</p>
</li>
<li>
<p>在友链头像、画廊封面、赞助二维码、本地音乐封面、广告图片、文章封面等列表项中输入图片路径时，对应缩略图会原地刷新，不会重建整个页面或打断光标位置。</p>
</li>
<li>
<p>壁纸路径输入后会即时刷新对应预览区，不会重建输入框，也不会把光标跳回旧位置。</p>
</li>
<li>
<p>修改主题色 Hue 后，管理器界面的主色和主题色预览会实时同步变化。</p>
</li>
<li>
<p>主题色 Hue 会保存到 <code>src/config/siteConfig.ts</code> 的 <code>siteConfig.themeColor.hue</code>。预览按 Firefly 当前 <code>src/styles/variables.styl</code> 中的 OKLCH 变量计算：亮色 <code>oklch(0.70 0.14 hue)</code>，暗色 <code>oklch(0.75 0.14 hue)</code>，不是旧的 HSL 算法。</p>
</li>
<li>
<p>Firefly 网站前端会优先读取访问者浏览器里的 <code>localStorage.hue</code>，所以如果你曾在网站显示设置里手动调过主题色，构建后仍可能看到旧颜色；需要在网站显示设置中重置主题色，或清除该站点的 <code>localStorage.hue</code>，才会显示新的配置默认色。</p>
</li>
</ul></section><section><h3 id="备份恢复">备份恢复</h3><p>每次点击“保存全部修改”前，工具会在仓库根目录创建备份：</p><div class="expressive-code"><figure class="frame"><figcaption class="header"></figcaption><pre data-language="text"><code><div class="ec-line"><div class="gutter"><div class="ln" aria-hidden="true">1</div></div><div class="code"><span style="--0:#abb2bf;--1:#383a42">.firefly-config-manager-backups</span></div></div></code></pre><div class="copy"><div aria-live="polite"></div><button title="Copy to clipboard" data-copied="Copied!" data-code=".firefly-config-manager-backups"><div></div></button></div></figure></div><p>备份包含一个 JSON manifest 和对应文件的 <code>.bak</code> 内容。manifest 会记录本次保存前备份的原因、涉及文件，以及每个文件对应的改动说明；为了避免泄露文章密码、API token 等内容，说明只记录字段名和来源，不记录具体新旧值。界面中的“备份恢复”页可以按保存会话整体恢复，并显示这些改动说明。</p><p>保存前可以在右上角填写“备份名称”。名称会写入 manifest，也会作为安全化后的片段加入备份文件名，方便在 <code>.firefly-config-manager-backups</code> 文件夹中直接识别。备份页支持重命名和删除备份；删除会同时移除 manifest 和对应的 <code>.bak</code> 文件。</p><p>备份页支持全选、取消选择和批量删除。批量删除会并行移除选中会话的 manifest 和 <code>.bak</code> 文件，适合清理多次试错产生的备份。</p><p>为减少保存卡顿，保存后不会重新全量扫描配置和文章；只会清空当前脏状态、追加本次备份会话并刷新当前界面。多个待保存文件和备份文件会并行写入。</p><p>恢复备份前，工具还会再创建一次“恢复前备份”，用于避免误恢复后无法找回当前状态。</p><p>说明：旧版本工具曾把备份放在 <code>src/config/.firefly-config-manager-backups</code>，新版不会删除旧备份，但“备份恢复”页只管理新版根目录备份。</p></section></section><section><h2 id="安全建议">安全建议</h2><ul>
<li>
<p>修改前建议先查看 Git 工作区状态。</p>
</li>
<li>
<p>保存后建议运行博客项目自己的检查命令，例如 <code>pnpm build</code>。</p>
</li>
<li>
<p>“源码编辑”和 JSON 编辑区域不会自动理解所有业务规则，只负责写回文件，请保持 TypeScript / JSON / Markdown 语法有效。</p>
</li>
<li>
<p>如果需要回退，优先使用 Git；没有 Git 提交时，可使用“备份恢复”。</p>
</li>
</ul></section><section><h2 id="参考">参考</h2><ul>
<li>
<p>Firefly 文档：<a href="https://docs-firefly.cuteleaf.cn/zh/guide/getting-started.html" target="_blank" rel="noopener noreferrer">https://docs-firefly.cuteleaf.cn/zh/guide/getting-started.html</a></p>
</li>
<li>
<p>Astro 中文文档：<a href="https://docs.astro.build/zh-cn/getting-started/" target="_blank" rel="noopener noreferrer">https://docs.astro.build/zh-cn/getting-started/</a></p>
</li>
<li>
<p>Firefly GitHub：<a href="https://github.com/CuteLeaf/Firefly" target="_blank" rel="noopener noreferrer">https://github.com/CuteLeaf/Firefly</a></p>
</li>
</ul></section></section>