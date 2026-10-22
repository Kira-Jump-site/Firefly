# Firefly 原站后台入口：EdgeOne 临时密码登录

对应站点 /admin/。保留原版编译后台，右上角原有 admin-panel-settings-outline 图标恢复。

## EdgeOne Pages 项目环境变量

目标项目：makers-uwovdt3b3agz（Firefly，不是 KIRA）。

- FIREFLY_ADMIN_PASSWORD：填入用户确认的临时登录密码，作为服务端 Secret，切勿提交到 GitHub。
- FIREFLY_ADMIN_SESSION_KEY：填入至少 32 个字符的强随机 Secret，例如使用本地终端 openssl rand -hex 32 生成。
- 如果同时设置了 FIREFLY_ADMIN_PASSWORD_HASH，FIREFLY_ADMIN_PASSWORD 优先；否则继续兼容原有 PBKDF2 哈希认证。
- 在 EdgeOne 的预览环境设置完毕后重新部署以生效。不要向网页代码公开这些值。

## 原站登录过程

- 右上角原版图标链接 /admin/。
- 原站后台通过 /api/admin/auth/me 查询会话（HTTP 200，X-Firefly-OAuth: enabled，供旧客户端探测）。
- 未登录点击登录按钮访问 /api/admin/auth/start，这里只展示密码输入框。
- 登录成功：303 跳转 /admin/，HttpOnly / Secure / SameSite=Strict 会话 Cookie，8 小时有效。
- 退出登录：原版后台请求 /api/admin/auth/logout，清理 Cookie。
- 原有 /api/firefly/session 同时保留，便于 EdgeOne 原生 CMS 逐步迁移。

## 部署与安全提醒

- 构建时将四个 Node API Function 打包到 dist/cloud-functions/api，避免只部署 dist 时 404。
- 临时短密码强度很弱：只能用于预览验收，正式对外使用前务必更换为强密码。单实例失败计数不是分布式防暴力破解方案。
- 只解决入口与认证链路；旧管理模块对 GitHub/旧 CMS API 的依赖不自动消失。编辑/删除等业务操作仍须逐项迁移及验证。
- 后台写入继续维持 FIREFLY_ENABLE_WRITES 等原有安全开关，不通过这次改动启用。
- 不修改 Twikoo 后端或正式生产数据。
