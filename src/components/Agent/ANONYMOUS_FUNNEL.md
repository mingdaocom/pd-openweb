# 官网免登录生成应用漏斗（Anonymous Funnel）

> 配套后端契约见《官网免登录生成应用-前端对接完整文档》（§0-11 后端 API；§12-18 前端方案）。
> 本文档面向 `src/components/Agent` 维护者，记录目标与进度。

## 目标

营销官网（独立 Next.js 静态站）需要把「AI 搭建应用」的 plan 环节前置到官网首页：

1. **官网首页免登录输入** —— 访客不登录即可输入需求 / 传文档，触发匿名生成 plan。
2. **输入框组件 + plan 交付给 Next.js 调用** —— HAP 输出独立 `MingoEntry` JS bundle，官网通过 `<script>` 加载后 `mount` 到首页容器，复用既有 Agent 输入组件，官网零 React/ming-ui 依赖。
3. **Mingo 会话承接** —— 点「生成应用」确认登录；未登录跳注册，登录后进入 `/mingo/chat/:sessionId`，选择组织并认领匿名会话 + 已生成 plan，继续用产品版搭建。

官网输入框每次提交都会得到一个新的 `sessionId`。已登录用户直接使用新的产品版 Mingo session；未登录用户使用新的匿名 session 完成 plan，登录后在 Mingo 内认领并续建。

## 链路总览

```
官网首页 (Next.js)
  └ script /dist/mingo-entry-widget/mingo-entry-widget.js → MingoEntry.mount()
      └ 输入框 + 示例 chips + 换一批（匿名）
      └ 提交：
          ├ checkLogin=true：
          │   ├ PC：create sessionId → 写 webCache handoff(sessionId) → 新标签开 /mingo/chat/:sessionId?entry=1
          │   └ H5：create sessionId → 写 webCache handoff(sessionId) → 新标签开 /mobile/mingo/create-app?entry=1&handoffKey=:sessionId
          └ checkLogin=false：bootstrap 新匿名 sessionId → 匿名上传 → 写 webCache handoff → 新标签开 HAP plan 页
HAP /public/mingo/plan (匿名)
  └ 首次打开：POST /agent/session-token → sessionId；peekAnonHandoff() → <Agent runtime={anonymous}> 首发开始后 clearAnonHandoff()
      └ POST /agent/execute/stream {agentName,message,sessionId} 渲染 plan
      └ completed.data.{artifactId,artifactVersionId} 写入当前版本基线，URL replace 为 /public/mingo/plan/:sessionId
  └ 刷新 / 重开：按 sessionId 先 GET /agent/sessions/{id}/messages 判断是否有历史
      ├ 有历史：回填 user/assistant 消息；从 assistant.artifact 取 artifactId/versionId
      │   └ GET /artifacts/{artifactId}/versions/{versionId}/files/{path} 补 /plan.md 与 json 文件，恢复 plan-card/AppBuilder
      └ 无历史：再消费 handoff / pending message；有则重新 execute/stream，无则空态 / 回首页
  └ 续聊：用户输入新的 message → 再次 POST /agent/execute/stream，复用同一 sessionId
  └ 移动端使用匿名专用总览弹层：点击 plan-card 打开 /plan.md 预览，弹层内「生成应用」沿用同一套入口
  └ 移动端不挂 AppBuilder，不触发登录态预览/应用信息相关接口
  └ 点「生成应用」→ 已登录 /mingo/chat/:sessionId?anon=1；未登录 /register?ReturnUrl=/mingo/chat/:sessionId?anon=1
HAP /mingo/chat/:sessionId?entry=1 (登录态, preall 登录闸)
  └ peekAnonHandoff(sessionId) → 选择有创建应用权限的组织（仅 1 个时自动使用该 projectId）→ 首发开始后 clearAnonHandoff()
  └ runtime.initialSessionId=sessionId + runtime.projectId=projectId → 自动提交官网首条 prompt
HAP /mobile/mingo/create-app?entry=1&handoffKey=:sessionId (登录态, Mobile preall 登录闸)
  └ peekAnonHandoff(sessionId) → 选择有创建应用权限的组织（仅 1 个时自动使用该 projectId）→ 首发开始后 clearAnonHandoff()
  └ <ChatPanel runtime.initialSessionId=sessionId> 按所选 projectId 自动提交官网首条 prompt
HAP /mingo/chat/:sessionId?anon=1 (登录态, preall 登录闸)
  └ 选择有创建应用权限的组织（仅 1 个时自动使用该 projectId）
  └ claimAnonymousSession({sessionId, projectId})
HAP /mobile/mingo/create-app/:sessionId?anon=1 (登录态, Mobile preall 登录闸)
  └ 选择有创建应用权限的组织（仅 1 个时自动使用该 projectId）
  └ claimAnonymousSession({sessionId, projectId})
  └ claim 成功后 window.mingoInitialSessionId → <Agent> loadSession 还原 plan
  └ 继续 → 产品版搭建落库
```

后端 API → 前端调用点：见对接文档 §17。

## 历史对话恢复（已接入）

对接文档 §01·B / §02-§06 的核心要求是：匿名 plan 页恢复必须以服务端历史为准，而不是只依赖本地 snapshot。完整流程按下面顺序实现。

1. **取 sessionId**：没有可信 session 时先调 `POST /agent/session-token`，请求体固定带 `agentName:"app-plan-builder-public"`，成功后把 `sessionId` 存 `localStorage` 并写回 URL。URL 中的 `sessionId` 只能作为刷新恢复线索，不能无条件接受外部注入；应与本地签发记录 / 后端可读历史至少一项对上。
2. **生成计划**：首轮发送 `POST /agent/execute/stream`，带 `{ agentName:"app-plan-builder-public", sessionId, message, attachments? }`。流式 `text-delta` 继续实时渲染；`completed.data` 中的 `artifactId`、`artifactVersionId` 是本轮产物版本基线，需保存到当前会话状态，后续历史恢复、读文件、登录认领都用它。
3. **刷新门控**：进入 `/public/mingo/plan/:sessionId` 时先拉 `GET /agent/sessions/{sessionId}/messages?page=1&size=50&includeUsage=false`。
   - `totalCount > 0` 或 `items.length > 0`：判定为 resume，直接回填历史，忽略本地暂存首条 prompt，避免刷新时重复发送。
   - `404 session_not_found` 或空列表：按空历史处理，再看 handoff / pending message；有待发内容才调用 `execute/stream`，没有则展示空态或回首页。
   - `403 anon_session_invalid`：清本地 sessionId 并重新 `session-token`；若页面已有服务端历史但匿名会话 TTL 过期，只允许回看，不应静默用新 session 续聊旧历史。
4. **回填消息与文件**：把历史 `items` 转成 ChatPanel 的 `messages/parts`。`user` 消息还原文本和附件；`assistant.content` 还原主气泡 / 工作阶段；`assistant.artifact` 生成 committed `plan-card`。artifact 字段需兼容 `{ artifactId, versionId }` 与现有 `{ id, versionId }`，其中历史里的 `versionId` 等价于流式 completed 的 `artifactVersionId`。拿到最新 plan-card 后，用 `GET /artifacts/{artifactId}/versions/{versionId}/files/{path}` 逐个补 `/plan.md` 与允许的 json 文件：接口先返回签名 `url`，前端再 `fetch(url).text()` 并通过 agent bus 写入文件区。
5. **恢复后续聊**：历史回填完成后，只在用户明确输入新的 `message`（或存在一次性 pending 续聊消息）时再次调用 `POST /agent/execute/stream`，继续带同一个 `sessionId`。后端会注入最近 6 轮历史；本轮 `completed` 返回新的 `artifactVersionId`（通常 `artifactId` 不变），前端用它刷新最新版本基线。

实现落点建议：

- `PlanPage`：已从“完整 localStorage snapshot 才 loadSession”改成“有 sessionId 即先 GET 历史”的三态门控；snapshot 不再作为历史恢复来源。
- `agentService.fetchAgentSessionMessages`：保留通用历史解析，并补齐匿名契约字段兼容（`artifact.artifactId` / `artifact.id`、`artifact.versionId` / `artifact.artifactVersionId`）。
- `ChatPanel.loadSession`：匿名 plan 恢复时优先使用服务端历史消息；存在 committed plan-card 后调用 artifact file 读回，自动恢复 AppBuilder / 移动端总览所需的文件内容。
- 首轮 handoff / pending message：读取用 `peekAnonHandoff`，首发开始后由 `ChatPanel` 统一 `clearAnonHandoff`，避免“读到即删”导致刷新丢消息，也避免成功首发后重复消费。

## 已做

**适配层 / 组件**

- `anonymous.js` —— 匿名链路全套：`bootstrapAnonymousSession`(§2) / `uploadAnonymousFiles`（upload-token + 七牛直传，§3）/ `claimAnonymousSession`(§7) / `withCaptcha` 被动式验证码(§5) / handoff 读写（`peekAnonHandoff` + 首发后 `clearAnonHandoff`，支持已登录直进时以 sessionId 作 key）。
- `ui/AnonAttachmentSlot.jsx` —— 匿名附件入口（替代登录态 plupload/UploadFiles），惰性 bootstrap（访客不上传不 mint 会话）。
- `agentService.js` + `ChatPanel.loadSession` —— 已有 `fetchAgentSessionMessages` / `fetchArtifactFile` / committed `plan-card` / artifact 文件读回能力；登录态历史会话继续复用这套路径，匿名 plan 页已按上方三态门控接入服务端历史优先恢复。
- `index.jsx` + `ChatPanel.jsx` —— 新增可选 `runtime` 配置，**默认不传＝登录态既有行为零变化**：
  - `anonymous`：跳过登录态 context / commonApps / @ 应用，附件走匿名链路，输入框 placeholder 切换。
  - `agentName`：钉住目标 agent（匿名版 `app-plan-builder-public`）并关自动路由（`forceReroute:false`）。
  - `initialSessionId`：用后端签发的匿名 sessionId 作会话 id（不自生成）。
  - `onRequestBuild`：匿名态点「生成应用」转登录跳转，而非直接搭建（拦在 `builder:generate`）。

**页面 / 入口**

- 旧 iframe/独立访问入口已下线；`EntryWidget` 仅保留给官网 JS 直嵌 bundle 使用。
- `src/pages/embed/mingoEntry/widgetEntry.js` + `CI/webpack.mingo-entry-widget.config.js` —— 官网首页 JS 直嵌入口，输出 `build/dist/mingo-entry-widget/mingo-entry-widget.js`，暴露 `window.MingoEntry.mount(container, { webUrl, apiServer, agentUrl })`。提交时调用 `Login.CheckLogin` 区分登录态：已登录 PC 直进 `/mingo/chat/:sessionId?entry=1`，已登录 H5 直进 `/mobile/mingo/create-app?entry=1&handoffKey=:sessionId`，未登录进入 `/public/mingo/plan`。
  - 多语言遵循官网（MDHome）当前语言：优先读取 `mount` 参数 / `sys_lang` / `i18n_langtag` / `<html lang>`，非简体中文时按需加载 HAP locale 脚本，再异步加载 `EntryWidget`，避免首包直接内置多语言全集。
- `src/pages/embed/mingoPlan/`（`PlanPage` / `index`）+ `public-mingo-plan.html` —— 匿名 plan 页，复用 `<Agent runtime={anonymous}>`；「生成应用」PC 进入 `/mingo/chat/:sessionId?anon=1`，H5 进入 `/mobile/mingo/create-app/:sessionId?anon=1`，未登录先走注册页 ReturnUrl。
- `src/pages/agent/AgentLand.jsx` —— 仅处理官网标记链路：`entry=1` 消费官网 handoff，先选择组织（单组织直走）再自动发送；`anon=1` 选择组织、认领匿名会话并还原 plan。普通 Mingo 历史会话不受影响。
- `src/pages/Mobile/Mingo/` —— 仅处理官网 H5 标记链路：`entry=1&handoffKey=...` 消费官网 handoff，先选择组织（单组织直走）再自动进入创建应用；`anon=1` 选择组织、认领匿名会话并还原 plan。普通 H5 创建应用不受影响。
- `src/pages/AuthService/` —— 注册成功允许 `/mingo/chat/:sessionId?anon=1` 与 `/mobile/mingo/create-app/:sessionId?anon=1` 作为官网匿名链路 ReturnUrl，登录 / 两步验证 / 第三方登录继续沿用原 ReturnUrl 逻辑。
- `src/pages/embed/mingoPlan/AnonymousMobileOverview.jsx` —— 官网匿名 H5 专用 plan-card 总览弹层；只消费 agent bus 的 `/plan.md` 流式内容，不挂 AppBuilder。
- `docker/rewrite.setting` —— 提供 `/public/mingo/plan` nginx 路由（html-template 由 generate 自动扫描）。
- `staticfiles/html/embed-demo.html` —— **测试用**：模拟官网嵌入 iframe 的宿主页（还原设计稿导航/标题/渐变底 + resize 自适应）。
- `MDHome/src/components/HomeMingoWidget.jsx` —— 官网首页加载 HAP widget JS；`HomeBanner.jsx` 已替换原 iframe 直嵌。

**校验**：全部文件 Babel 解析 / ESLint 0 报错 / Prettier / `git diff --check` 通过。

## 未做 / 待确认

**功能侧**

- [x] MDHome 首页已切到 JS widget 方式，旧 iframe 高度自适应逻辑不再参与首页首屏。
- [ ] plan 页多轮追加附件、验证码 UI 在弱网/取消下的边界，未做端到端回归。
- [x] 匿名 plan 页刷新 / 重开已从本地 snapshot 恢复升级为服务端历史优先：`/agent/sessions/{id}/messages` 非空即 resume，空历史才消费 handoff / pending message 并触发首轮 `execute/stream`。
- [x] 历史回填时按 assistant `artifact` 自动读 `/artifacts/{artifactId}/versions/{versionId}/files/{path}`，补齐 `/plan.md` 与 json 文件后恢复 plan-card、AppBuilder 和移动端总览。
- [x] 恢复后的续聊复用原 `sessionId` 再调 `agent/execute/stream` 传新的 `message`，并用 completed 的新 `artifactVersionId` 刷新当前版本基线。
- [x] Mingo 多组织选择器：仅展示 `!cannotCreateApp` 的组织；多组织点击行即选中，单组织不弹选择器并直接按该 `projectId` 创建 / 认领；无权限组织弹提示兜底全新搭建。
- [ ] §8 续建当前复用「登录态自动路由 + 还原会话」；若后端要求严格钉 `app-plan-builder` + `artifactId`，给 Mingo 承接页 `<Agent>` 传 `runtime={{ agentName:'app-plan-builder' }}` 即可（已预留）。

**环境 / 后端（前端绕不过，需运维/后端确认）**

- [ ] 匿名版 `app-plan-builder-public` / 产品版 `app-plan-builder` 在目标环境已部署且 `AllowAnonymous` 配置就绪。缺此配置时 session-token / execute 报 `agent does not allow anonymous sessions.`，属后端鉴权 gate，非前端漏参。
- [ ] HAP widget JS、API、Agent 服务代理在目标环境可访问；`MingoEntry.mount` 需要 MDHome 传入 `{ webUrl, apiServer, agentUrl }`。
- [ ] 反代透传真实 IP（§11.6），否则 bootstrap per-IP 限流 / 验证码按出口 IP 误判。
- [ ] 腾讯云 `CaptchaAppId` 与官网现有集成同一个（§5）。

## 端到端自测

单独构建 widget：`npm run build-mingo-entry-widget`，产物为 `build/dist/mingo-entry-widget/mingo-entry-widget.js`。MDHome 首页通过 `HomeMingoWidget` 加载 `${hapServer}/dist/mingo-entry-widget/mingo-entry-widget.js` 后挂载输入框。
