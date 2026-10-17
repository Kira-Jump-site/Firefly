# Firefly 恢复版 / EdgeOne Makers 发布须知

本仓库沿用 CuteLeaf/Firefly 6.16.8 原主题，恢复 **blog.casto.top** 当时公开可读的三篇文章与八条动态，修改星遐蝶梦资料、19 个友链、相册 UI、朋友圈、后台。原内容只可公开恢复 HTML；原始 Markdown、私密草稿、秘钥、原图不能从公开页面还原，不允许伪造。

## 预览/生产

- EdgeOne 项目：`makers-uwovdt3b3agz`，EdgeOne Pages 关联 GitHub `Kira-Jump-site/Firefly` master。
- 静态输出 `dist`，Node 24.18.0，pnpm 11.22.0。根目录 `edgeone.json` 含每天北京时间 04:15 刷新朋友圈的计划任务；它不触发网站重新构建。
- 文章/动态原主题仍可预览；新发布的内容会被 EdgeOne Blob API 读取并反映在首页的「最新在线文章」和动态 API。部分静态归档、标签导航未完全动态化。
- 图床与图库保持使用原 Cloudflare，公开图库从 `https://gallery-api.casto.top/api/gallery/public` 读取，不迁移原图；图库线路设置存在浏览器本地。
- Twikoo 指向 `https://twikoo-netlify-casto.netlify.app/.netlify/functions/twikoo`；没有修改 Netlify 函数。

## 必须由有权账户在 EdgeOne 控制台设置的环境变量

- `FIREFLY_ADMIN_PASSWORD_HASH`：PBKDF2 密码哈希，不能把明文密码/哈希写入公开 GitHub。
- `FIREFLY_ADMIN_SESSION_KEY`：长度至少 32 字符的随机字符串，仅服务器可见。
- `FIREFLY_IMAGEBED_TOKEN`：原图片床的管理员 API 令牌，仅在需要图片上传、删除、重命名时提供。无法从 Cloudflare 自动透传到 EdgeOne。
- `FIREFLY_BLOB_STORE_NAME=firefly-content`：对应 EdgeOne Blob 的持久存储名（需要可用的 Blob 额度及绑定）。
- 写入开关 `FIREFLY_ENABLE_WRITES`、`FIREFLY_SERIALIZED_WRITES_ACK` 默认 0。现有 Blob SDK 没有可靠的跨实例原子 CAS；只有在对存储写入加锁、确保单写入者时，才能安全打开两个开关，否则管理员保存接口会返回 503。**不能在未落实互斥锁时作为多用户可用 CMS。**

## 未完成或需要实际在 EdgeOne 上验收

1. 后台登录、草稿预览、文章/动态保存、删除与恢复、图库编辑以及原图上传/重命名/删除的完整 E2E。
2. 私有文章、站点设置、原始 Markdown 源码及不在公开站点中出现的个人配置无法恢复，需用户再校核。
3. 后台写入需要解决可靠的 Blob 原子更新/互斥机制，运行前不可擅自开启。
4. 定时函数首次抓取可能无可用 RSS，前台展示空状态，但不影响友链。

恢复原则：不再删除原始 Cloudflare Workers/KV、Netlify/Twikoo 或旧照片；GitHub 仅提交一批审核过的代码，后续由用户验收 EdgeOne 效果。
