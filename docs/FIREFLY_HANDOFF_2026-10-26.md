# Firefly 项目交接（2026-10-26）

项目：用户个人博客 Firefly（星遐蝶梦），不是 KIRA，也不是上游演示站。
生产：https://blog.casto.top
仓库：https://github.com/Kira-Jump-site/Firefly
分支：master
本次核查 HEAD：09246f9af27efaec6ddef1bb3de5695b01f3b3fe

## 最高优先级警告：当前 HEAD 文件完整性风险

最新提交“feat(firefly): package EdgeOne CMS routes and secure original admin read compatibility”里，多份源码文件从 GitHub 插件读取时都恰好约 1,506 字符并在代码中间结束，疑似上传截断。例子：
- scripts/package-edgeone-deployment.mjs：GitHub 返回 1,506 字符，结尾断在 gallery 路由映射；上一轮沙盒里同一路径实际完整文件是 4,390 字节。
- scripts/verify-edgeone-deployment.mjs：末尾截在测试代码中间。
- cloud-functions/api/live-content.js：末尾截在对象字面量中间。
- cloud-functions/api/firefly/imagebed.js：末尾截断。
- tests/edgeone-cms-routes.test.mjs：末尾截在 helper 中间。
- 多个其他新增文件也有相似风险。

因此上一轮沙盒构建/测试通过不代表 GitHub 当前 HEAD 可以构建。**先停止部署，先救仓库完整性。**
曾创建完整 scripts/package-edgeone-deployment.mjs blob SHA：ef109239f40746b4351c2f306f8b69fc589eaa18（沙盒文件 4,390 bytes），但尚未合入任何新 tree/commit。Vercel 沙盒随后停止，其他修复文件没有恢复。

修复顺序：
1. 尝试通过 GitHub API 读取 blob ef109239f40746b4351c2f306f8b69fc589eaa18，核验解码长度、末尾和完整内容。
2. 逐个审计 master 所有新增/修改文件的真实 blob 大小、内容结尾，确定受损清单。
3. 能恢复就恢复；若不能可靠恢复，安全回退到父提交 b1bb21537be8e1f0d5d24843693b733146eba16b，再从已知完整版本重新实现。
4. 重建文件时必须校验源字节数、Base64 长度、解码字节数、GitHub blob SHA 和回读文件内容。不要用工具截断的输出作为源码。
5. 重新运行 pnpm build、node scripts/package-edgeone-deployment.mjs、node scripts/verify-edgeone-deployment.mjs、node --test tests/*.test.mjs。之后才部署 EdgeOne 预览，禁止直接推生产。

## 架构和边界
- EdgeOne Pages 是生产、预览、Functions、未来 CMS/Blob 的主平台。项目 firefly-blog，ID makers-uwovdt3b3agz。控制台：https://console.cloud.tencent.com/edgeone/makers/project/makers-uwovdt3b3agz/index?name=firefly-blog。预览域名随机生成，不能硬编码。
- GitHub 仅源代码和必要备份，不作为每次编辑内容的数据库。
- Cloudflare DNS 和既有服务保留。
- 原图床 https://img.casto.top 不得迁移、清空、覆盖。
- Netlify 上原 Twikoo 评论服务和数据严禁修改、迁移、清空。
- 不碰 KIRA；不向用户索取 PAT；Vercel 免费沙盒节约使用。
- 用户旧账号 SteveGuo1726 已暂停，不能作为开发/写入依赖。

## 已恢复且必须保留
- 原站主页、导航、头像、Logo、Favicon、背景和资源。
- 原版 Expressive Code CSS/语法高亮；曾修复缺失的 /_astro/ec.a8dky.css。
- 原版相册页面/查看器、友链朋友圈、分页/随机推荐结构。
- 右上角后台入口和 /admin/ 原版编译后台 UI。
- 原版后台从 2026-10-13 真实部署产物恢复，不是上游演示后台。历史部署 dpo6mvx7243c。
- 归档：https://firefly-archive-keeper.guojunyang666666.workers.dev/firefly-original-20261013-bae2cf47.tar.gz
- SHA-256：bae2cf471317ba0813e30df964c044b81ec13f11f990da24067878c6b36e764b
- scripts/restore-casto-20261013.mjs 负责恢复/校验约 482 个原版后台相关资源。
- 后台六模块 Dashboard / Post / Dynamic / Gallery / Site Settings / Backup。
- src/components/recovery/AdminApp.svelte 是恢复时另一套实现，不一定控制当前线上原版后台。务必先检查 dist/admin/index.html 实际引用的 JS。
- 不要重新恢复 UI，不要拿上游示例内容覆盖真实用户内容。

## 后台登录
之前 public/assets/recovery-admin-gate.js 调用不存在的 /api/admin/auth/temporary-login，造成 HTTP 404 弹窗。提交 b1bb21537be8e1f0d5d24843693b733146eba16b 已移除该拦截脚本，并调整 scripts/restore-casto-20261013.mjs 和 scripts/package-edgeone-admin-auth.mjs。预览免密码只是允许查看 UI，不是管理员写权限，不要重加旧临时密码或前端伪造授权。

认证基础 src/server/auth.mjs：
- PBKDF2 密码校验，HMAC 会话；
- Cookie __Host-firefly-session，约 8 小时；
- HttpOnly / Secure / SameSite；
- 环境变量 FIREFLY_ADMIN_PASSWORD_HASH、FIREFLY_ADMIN_PASSWORD、FIREFLY_ADMIN_SESSION_KEY。
还需验证登录、登出、过期、频率限制、CSRF/Origin、跨设备会话、环境隔离。服务端必须授权，不能信任前端变量。

## 构建与路由
Astro 7 + Svelte + pnpm；已知 pnpm@11.22.0、Astro 7.3.2、@edgeone/pages-blob ^0.0.18。edgeone.json 输出 .edgeone。scripts/package-edgeone-deployment.mjs 应打包 Build Output API v3：
- .edgeone/assets/
- .edgeone/cloud-functions/api-node/index.mjs
- .edgeone/cloud-functions/api-node/config.json

源码文件存在不代表线上路由已注册。必须检查 .edgeone 路由配置和 EdgeOne 实际 HTTP 响应。历史曾因 Node 文件复制到错误目录而 404。需要审计 /api/admin/auth/*、/api/firefly/*、/api/live-content/*、/api/admin-content-index.json、/api/admin/private-index、friend-circle 和 cron 路由。

关键文件：
src/server/auth.mjs、live-cms.mjs、http.mjs、edgeone-store.mjs、settings.mjs、gallery.mjs、post-resolver.mjs、render-live-post.mjs、compat.mjs、live-dynamic-feed.mjs、search.mjs；
cloud-functions/api/firefly/*.js、cloud-functions/api/live-content.js、cloud-functions/api/admin-content-index.json.js、cloud-functions/api/admin/private-index.js；
scripts/package-edgeone-deployment.mjs、scripts/verify-edgeone-deployment.mjs。

## CMS 已有基础与风险
src/server/live-cms.mjs 已有文章/动态模型、draft/published/private/deleted、索引和 revision pointer、不可变修订、expectedRev/409、历史查询/恢复、公开内容私密过滤等。
src/server/edgeone-store.mjs 使用 @edgeone/pages-blob 提供 JSON 读写。
但 Blob 强一致不等于跨 Function 实例原子 Compare-And-Swap。进程内锁不够，不能仅打开 FIREFLY_ENABLE_WRITES / FIREFLY_SERIALIZED_WRITES_ACK 就宣称生产安全。没有分布式协调前写入必须关闭并 fail-closed。
只写 Blob 不会自动更新静态 Astro HTML，需打通运行时文章 resolver、动态 feed、列表/分类/标签/归档/搜索、缓存和 SEO。
cloud-functions/api/firefly/capabilities.js 的设计意图是明确报告 writes:false，而不是误导用户。兼容旧版后台的只读请求必须认证，因为索引包含草稿/私密内容；不能假装保存成功。

## 功能目标
文章：新建、编辑、删除、发布/下架、草稿/私密、Markdown/MDX、slug/分类/标签/封面/置顶/时间、预览、历史/差异/恢复、expectedRev 并发冲突、前台实时更新。
动态：新建/编辑/删除、图片/时间/Markdown/状态/历史，/dynamic/ 和首页/侧栏实时更新。最后活动时间要综合文章和动态。删除/私密 tombstone 必须抑制旧静态基线，防止内容复活。
相册：目录、排序、封面、manifest、上传/查找；原图继续使用 img.casto.top；私密相册由服务端隔离，公开 manifest 不泄露元数据。
设置：站名/描述/主题/导航/友链/侧栏/小组件等运行时设置集中读取；明确哪些只能构建期生效。
其他：仪表盘、友链、备份导入导出、修订历史、搜索同步、原版操作提示。每个按钮都要审计其 endpoint 和数据结构，保留原版 UI，不要降级成 JSON 编辑器。

## 历史资料
用户资料库 /KIRA-Firefly-项目交接/：
00_README_START_HERE.md、01_EDGEONE_FIRST_ARCHITECTURE.md、02_FIREFLY_FULL_RECOVERY_SPEC.md、03_CLOUDFLARE_TO_EDGEONE_BRIDGE.md、04_EXECUTION_AND_ONE_PUSH_RULES.md、05_NEXT_AI_FIREFLY_HANDOFF.md、06_EVIDENCE_SOURCE_STATUS.md 及恢复 ZIP/修复记录。资料可能过期，先与最新代码比较。
仓库 docs 中有 FIREFLY_ADMIN_EDGEONE_LOGIN.md、ADMIN_PREVIEW_AND_FRIEND_CIRCLE_EDGEONE.md、FIREFLY_RESTORE_DEPLOY_2026-10-17.md、CASTO_CONTENT_RECOVERY_2026-10-17.md、ORIGINAL_RESTORATION_2026-10-17.md、RECOVERY_CHANGELOG_2026-10-17.md。

## 开发纪律
- 先核验 HEAD 与源码，别盲信前 AI 的口头总结。
- 不重做视觉恢复、不替换上游示例、不碰无关服务。
- 先在临时环境批量修改、验证后一次集中提交，少触发部署。
- GitHub 直连曾有网络问题，优先使用已连接的 GitHub 插件。
- EdgeOne 实际预览才是部署证据，Vercel 本地构建不能替代。
- 汇报区分源码/单测/构建/EdgeOne 部署/Blob 读写/前后台同步。
- **第一件事是修复当前 HEAD 的截断文件完整性，之后才继续开发。**
