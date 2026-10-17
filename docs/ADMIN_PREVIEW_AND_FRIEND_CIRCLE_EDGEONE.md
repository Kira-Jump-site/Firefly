# Firefly 恢复增量：后台实时预览 / EdgeOne 朋友圈（2026-10-17）

## 已写入工程，但不是已部署验收

- 原博客朋友圈此前依赖 `SteveGuo1726/Firefly@friend-circle-data/all.js`，当前 fork 并不包含这一分支。恢复增量**不再请求这两个旧 GitHub 地址**。
- `src/server/friend-circle.mjs`：使用 17 个源站的白名单地址，依次探测 RSS、Feed、Atom；仅 HTTPS、手动禁止跳转、有限大小、超时；去重与日期排序。该列表是从原站公开友链恢复的静态快照，后续应在后台提供维护入口。
- `cloud-functions/api/cron/friend-circle.js`：EdgeOne 每天 04:15 (Asia/Shanghai) 触发；仅从预先配置的可信地址抓取公开文章，写入 `firefly:friend-circle:v2` Blob；当抓取到 0 条时不覆盖上次成功数据。
- `cloud-functions/api/friend-circle.json.js`：只读 JSON 缓存。使用原站兼容的 `article_data`/`statistical_data` 格式。首次部署定时抓取前为空态；无需 GitHub Actions。
- `src/components/recovery/FriendCircle.astro`：随机推荐、每页 12 条、分页、空态、元信息，使用 DOM `textContent` 防止 RSS 文本 XSS；通过个性化脚本插入原主题的 `friends.astro`。
- `cloud-functions/api/firefly/preview.js`：管理员签名会话+同源保护，接收未发布草稿，渲染禁用脚本的 HTML，**不入库**；后台编辑时 380ms 防抖调用并在沙箱 iframe 展示。
- 后台保存改为先写后读并比较修订号，站点设置保存也会更新表单实际修订号。写入开关 `FIREFLY_ENABLE_WRITES` 仍**默认关闭**，不应声称已恢复正式实时修改。

## 仍待真正验收

1. 上游完整 Firefly 主题与恢复增量合并后，需要在 EdgeOne 真实构建；现有 Astro 成功日志来自此前的*独立恢复工程*，不代表本增量在主题内已通过构建。
2. EdgeOne Blob 存储需已配置 `FIREFLY_BLOB_STORE_NAME`；首次定时任务运行后才能看到真实朋友圈文章。每站 RSS 成功率与国内时延还需上线验证。Cron 路由无单独 token，但仅抓取写死的可信博客且 20 小时内不重复聚合；正式上线前需考虑平台防刷限制。
3. CMS 保存功能因 Blob 缺少已验证的原子 CAS，仍没有完成生产级并发保护，不得仅为通过预览而开启 `FIREFLY_ENABLE_WRITES`/`FIREFLY_SERIALIZED_WRITES_ACK`。
4. 相册目录与图库管理尚不等价于旧站的图片上传、删除、批量排序、线路切换功能。Twikoo 也需人工预览站联调。

## 当前本地测试

`node --test tests/*.test.mjs` → 12/12 成功。覆盖 RSS/Atom 解析、跨域来源阻止、跳转拒绝、去重、缓存时效、无登录拒绝实时预览、同源校验与 HTML 转义、原站公开内容解析。

## 合并及提交纪律

这个目录是**覆盖到完整上游仓库的增量**，不是替换全仓库。先把完整 `Kira-Jump-site/Firefly` 与当前文件叠加，执行脚本个性化和恢复公开内容，安装依赖真实构建并联调，**最后一次性 GitHub 提交**。不能只把这个增量 ZIP 当作完整可部署 Firefly 网站。
