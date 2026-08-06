/**
 * 该文件由 scripts/agentApiGen.js 自动生成,请勿手动编辑。
 * 如需更新: npm run api:agent
 */
export default {
  /**
   * V4.0：用户主动取消同 sessionId 的活跃 Agent 执行（典型场景：build-app-agent 搭建中途点"停止搭建"）。 鉴权由 service 层 M:MD.AgentService.Core.Agenting.Abstractions.IAgentApplicationService.CancelAsync(MD.AgentService.Core.Agenting.Contracts.AgentCancelRequest,System.Threading.CancellationToken) 内部用 accountId 拼 registry key 隐式完成—— 跨账号自然 NotFound（返回 not_in_flight），无需额外 403 分支。 详见 docs/architecture/api-design.md §10.1。
   * @param {Object} args 请求参数
   * @param {string} args.sessionId 要取消的会话 ID。后端用此值 + 当前用户的 accountId 拼出 registry key（与 checkpoint 同口径）， 在 MD.AgentService.Core.Agenting.Abstractions.IAgentExecutionRegistry 中查找活跃 CTS 触发取消。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  agentCancel: function (args, options = {}) {
    return agentAPI(args, {
      ...options,
      url: '/api/agent/cancel',
      method: 'POST',
    });
  },

  /**
   * 路由并执行已配置的 Agent，同步返回完整 ExecuteAgentResponse。
   * @param {Object} args 请求参数
   * @param {string} args.message 用户输入的原始消息。
   * @param {array} args.attachments V2.10 新增：随本轮消息一起提交的附件列表。null / 空数组视为无附件。 合法性判定升级为「Message / Attachments / CheckpointId 至少一个非空」， 即：纯图片无文字的场景也允许。
   * @param {string} args.agentName 外部显式指定执行的 Agent 名称；存在时优先执行该 Agent。
   * @param {string} args.sessionId 当前请求所属的会话标识。
   * @param {string} args.projectId V3.4.5：当前请求关联的明道网络/组织 ID（顶层显式传参）。 与 MD.AgentService.Core.Agenting.Contracts.ExecuteAgentRequest.Context["projectId"] 等价，但更显眼且类型固定为 string。 优先级（在 ICurrentUserContext.InitializeProjectId 实现里生效）： HTTP query `?projectId=` → 本字段 → `Context["projectId"]` → null。 服务端在 AgentApplicationService 入口完成装配，下游统一通过 ICurrentUserContext.ProjectId 取。
   * @param {string} args.captchaTicket V5.6：腾讯云图形验证码票据（前端验证码组件回吐的 ticket）。仅匿名访问 allowAnonymous agent 且触发验证码阈值时需要； 登录用户无需携带。与 MD.AgentService.Core.Agenting.Contracts.ExecuteAgentRequest.CaptchaRandstr 成对，由匿名访问闸调腾讯云校验。
   * @param {string} args.captchaRandstr V5.6：腾讯云图形验证码随机串（randstr），与 MD.AgentService.Core.Agenting.Contracts.ExecuteAgentRequest.CaptchaTicket 成对提交。
   * @param {boolean} args.forceReroute 是否显式要求重新路由。
   * @param {boolean} args.forceRefresh V5.9.2：是否强制刷新（对应前端「强制刷新」按钮）。仅对启用了 V5.9 响应缓存（`responseCache.enabled`）的 agent 有意义： `true` 时<b>跳过缓存读、强制走 LLM 重新生成</b>，但仍把新结果<b>写回缓存</b>（覆盖旧值，后续普通请求命中刷新后的答案）。 按「意图」命名而非缓存实现——调用方只表达「我要新的」，不必知道背后有缓存。不参与 cache key（控制开关，非语义输入）。
   * @param {object} args.context 传递给 Agent 的附加上下文数据。
   * @param {Object} args.confirmation
   * @param {string} args.routedIntent V4.2.1：服务端内部装配的"续传/重建"意图（`WorkflowConstants.RoutedIntents`：resume / rebuild）。 由 `AgentApplicationService` 在进可恢复 a2a 前按 LLM 分类器/关键词写入，executor 据此分流； 前端传入无效（不参与 JSON 绑定的业务语义，服务端覆盖）。null = 未判定，引擎按默认续传。
   * @param {string} args.routedIntentConfidence V5.19：MD.AgentService.Core.Agenting.Contracts.ExecuteAgentRequest.RoutedIntent 的置信度（`WorkflowConstants.IntentConfidence`：high / low）。 由 `AgentApplicationService` 同 RoutedIntent 一起写入（二者恒同时设/同时清，不会单独为 null）； 分级：unrelated+high → 静默重路由；resume/rebuild 的 low → 弹层；unrelated 不在 executor 弹（需 none_of_these）。 null = 未判定（非 high 也非 low）→ **不重路由、不弹层 → 等价 resume 默认走（保守）**；不是"视为 high"。
   * @param {string} args.checkpointId 用于工作流恢复的 checkpoint 标识。前端可通过该字段提交上次中断时返回的 checkpointId， 服务端将从 checkpoint 存储中读取最后状态并继续执行。
   * @param {string} args.artifactId V3.0：客户端可显式指定本轮操作的 artifact ID。空时由 AgentApplicationService 自动选择 / 创建。
   * @param {string} args.basedOnVersionId V3.0：客户端可显式指定本轮 fork draft 时基于哪个版本（label 或 versionId）。 空时优先走 LLM 意图识别，再回落到 active。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  agentExecute: function (args, options = {}) {
    return agentAPI(args, {
      ...options,
      url: '/api/agent/execute',
      method: 'POST',
    });
  },

  /**
   * 路由并以 SSE（text/event-stream）方式流式执行已配置的 Agent；同源 text-delta / subagent-text-delta / reasoning-delta（V3.5）事件按 MD.AgentService.API.Controllers.AgentController.MessageDeltaFlushWindowMs 窗口合并下发。
   * @param {Object} args 请求参数
   * @param {string} args.message 用户输入的原始消息。
   * @param {array} args.attachments V2.10 新增：随本轮消息一起提交的附件列表。null / 空数组视为无附件。 合法性判定升级为「Message / Attachments / CheckpointId 至少一个非空」， 即：纯图片无文字的场景也允许。
   * @param {string} args.agentName 外部显式指定执行的 Agent 名称；存在时优先执行该 Agent。
   * @param {string} args.sessionId 当前请求所属的会话标识。
   * @param {string} args.projectId V3.4.5：当前请求关联的明道网络/组织 ID（顶层显式传参）。 与 MD.AgentService.Core.Agenting.Contracts.ExecuteAgentRequest.Context["projectId"] 等价，但更显眼且类型固定为 string。 优先级（在 ICurrentUserContext.InitializeProjectId 实现里生效）： HTTP query `?projectId=` → 本字段 → `Context["projectId"]` → null。 服务端在 AgentApplicationService 入口完成装配，下游统一通过 ICurrentUserContext.ProjectId 取。
   * @param {string} args.captchaTicket V5.6：腾讯云图形验证码票据（前端验证码组件回吐的 ticket）。仅匿名访问 allowAnonymous agent 且触发验证码阈值时需要； 登录用户无需携带。与 MD.AgentService.Core.Agenting.Contracts.ExecuteAgentRequest.CaptchaRandstr 成对，由匿名访问闸调腾讯云校验。
   * @param {string} args.captchaRandstr V5.6：腾讯云图形验证码随机串（randstr），与 MD.AgentService.Core.Agenting.Contracts.ExecuteAgentRequest.CaptchaTicket 成对提交。
   * @param {boolean} args.forceReroute 是否显式要求重新路由。
   * @param {boolean} args.forceRefresh V5.9.2：是否强制刷新（对应前端「强制刷新」按钮）。仅对启用了 V5.9 响应缓存（`responseCache.enabled`）的 agent 有意义： `true` 时<b>跳过缓存读、强制走 LLM 重新生成</b>，但仍把新结果<b>写回缓存</b>（覆盖旧值，后续普通请求命中刷新后的答案）。 按「意图」命名而非缓存实现——调用方只表达「我要新的」，不必知道背后有缓存。不参与 cache key（控制开关，非语义输入）。
   * @param {object} args.context 传递给 Agent 的附加上下文数据。
   * @param {Object} args.confirmation
   * @param {string} args.routedIntent V4.2.1：服务端内部装配的"续传/重建"意图（`WorkflowConstants.RoutedIntents`：resume / rebuild）。 由 `AgentApplicationService` 在进可恢复 a2a 前按 LLM 分类器/关键词写入，executor 据此分流； 前端传入无效（不参与 JSON 绑定的业务语义，服务端覆盖）。null = 未判定，引擎按默认续传。
   * @param {string} args.routedIntentConfidence V5.19：MD.AgentService.Core.Agenting.Contracts.ExecuteAgentRequest.RoutedIntent 的置信度（`WorkflowConstants.IntentConfidence`：high / low）。 由 `AgentApplicationService` 同 RoutedIntent 一起写入（二者恒同时设/同时清，不会单独为 null）； 分级：unrelated+high → 静默重路由；resume/rebuild 的 low → 弹层；unrelated 不在 executor 弹（需 none_of_these）。 null = 未判定（非 high 也非 low）→ **不重路由、不弹层 → 等价 resume 默认走（保守）**；不是"视为 high"。
   * @param {string} args.checkpointId 用于工作流恢复的 checkpoint 标识。前端可通过该字段提交上次中断时返回的 checkpointId， 服务端将从 checkpoint 存储中读取最后状态并继续执行。
   * @param {string} args.artifactId V3.0：客户端可显式指定本轮操作的 artifact ID。空时由 AgentApplicationService 自动选择 / 创建。
   * @param {string} args.basedOnVersionId V3.0：客户端可显式指定本轮 fork draft 时基于哪个版本（label 或 versionId）。 空时优先走 LLM 意图识别，再回落到 active。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  agentExecuteStream: function (args, options = {}) {
    return agentAPI(args, {
      ...options,
      url: '/api/agent/execute/stream',
      method: 'POST',
      isStream: true,
    });
  },

  /**
   * V5.7：免登录会话「转正」认领（需登录）。把匿名账户名下、该 sessionId 的 artifact + 会话历史改派给当前登录账号， 之后用产品版 `app-plan-builder`（带租户 / 计费）以 artifactId + 原 sessionId 续聊 / 续建。 故意不走匿名旁路（MD.AgentService.Core.Agenting.Contracts.SessionClaimRequest 不实现 IAgentNameCarrier）→ 无登录态由 `[Authorize]` 拦回 401； 租户非成员由 service 抛 PermissionException、经 AppFilter 映射 403。
   * @param {Object} args 请求参数
   * @param {string} args.sessionId 待认领的匿名会话 id（前端 bootstrap 时由后端签发、整段复用的那个）。必填。
   * @param {string} args.projectId 认领归属的组织 id（必填）。复用 V5.1 租户校验确认登录账号隶属该组织，防认领进非自己组织。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  agentSessionClaim: function (args, options = {}) {
    return agentAPI(args, {
      ...options,
      url: '/api/agent/session-claim',
      method: 'POST',
    });
  },

  /**
   * 会话改名：把 sessionId 在会话列表里展示的标题（FirstMessage）改为请求体里的 title。 sessionId 必须属于当前登录用户，越权 / 不存在一律 404 不区分；title 必填非空白且 ≤ 100 字，超界 400。
   * @param {Object} args 请求参数
   * @param {string} args.sessionId 会话标识（路径参数），必须属于当前登录用户。
   * @param {string} args.title 新标题（必填、非空白）。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  agentSessionsRename: function (args = {}, options = {}) {
    const { sessionId, ...rest } = args;
    return agentAPI(rest, {
      ...options,
      url: `/api/agent/sessions/${encodeURIComponent(sessionId)}/rename`,
      method: 'POST',
    });
  },

  /**
   * V3.4：手动重摘 session 摘要。清掉 summary 子文档，下一次 InvocationCompleted 抢锁后从 0 重摘。 用途：摘要质量异常 / 字段损坏时救场；不会同步触发摘要生成（异步由 InvocationCompleted hook 触发）。
   * @param {Object} args 请求参数
   * @param {string} args.sessionId 会话标识（路径参数），必须属于当前登录用户；越权一律 404 不区分"不存在"与"他人所有"。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  agentSessionsResummarize: function (args = {}, options = {}) {
    const { sessionId, ...rest } = args;
    return agentAPI(rest, {
      ...options,
      url: `/api/agent/sessions/${encodeURIComponent(sessionId)}/resummarize`,
      method: 'POST',
    });
  },

  /**
   * V5.7：申请临时匿名会话 token（官网免登录漏斗入口）。鉴权层只放行 `allowAnonymous` agent 的无登录请求； 本 action 顺序：① agentName 必填 → ② 显式校验目标 agent `AllowAnonymous`（覆盖登录用户也来调的情况）→ ③ bootstrap 按 client IP 的验证码闸（超 IP 阈值要求验证码，挡「重复申请会话刷量」）→ ④ 生成高熵 sessionId + Redis 登记（TTL 15min，绑定 agentName）。 bootstrap 按 client IP 的限流由 RateLimitMiddleware（Public 档）兜底。
   * @param {Object} args 请求参数
   * @param {string} args.agentName 显式点名的目标 Agent（必填）。须为 `allowAnonymous:true` 的 agent；签发的 sessionId 与该 agentName 绑定， 后续 execute / upload-token 必须用同一 agentName，否则被匿名访问闸拒（防「拿给 agent A 申请的 session 调 agent B」）。
   * @param {string} args.captchaTicket V5.7：腾讯云图形验证码 ticket（条件必填）。bootstrap 端按 <b>client IP</b> 计验证码阈值——同一 IP 申请会话超过 该 agent `captcha.triggerAfter` 次后必带，与 MD.AgentService.Core.Agenting.Contracts.SessionTokenRequest.CaptchaRandstr 成对。前 N 次免验。
   * @param {string} args.captchaRandstr V5.7：腾讯云图形验证码 randstr（条件必填），与 MD.AgentService.Core.Agenting.Contracts.SessionTokenRequest.CaptchaTicket 成对。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  agentSessionToken: function (args, options = {}) {
    return agentAPI(args, {
      ...options,
      url: '/api/agent/session-token',
      method: 'POST',
    });
  },

  /**
   * V5.6.1：匿名批量上传 token 发放（官网免登录漏斗）。鉴权层只放行 `allowAnonymous` agent 的匿名请求； 本 action 顺序：① 验证码阈值闸（与 execute 共享计数）+ 合成匿名身份 → ② 数量上限（MaxCount）→ ③ 独立发 token 限流（ma:rl:upload，按 IP）→ ④ 逐文件签发受限 Qiniu 上传 token。 响应字段对齐 MDAPI `api/Qiniu/GetUploadToken`（`data[]` + `state`）。
   * @param {Object} args 请求参数
   * @param {string} args.agentName 显式点名的目标 Agent（必填）。鉴权层据此判定是否 `allowAnonymous`；匿名请求不走自动路由。
   * @param {array} args.files 本次申请上传 token 的文件列表。条数受 `FileStore.AnonymousUpload.MaxCount` 约束。
   * @param {string} args.sessionId 前端匿名会话 id（可选）：仅用于合成匿名 telemetry 身份 / 日志串联，不持久化历史。
   * @param {string} args.captchaTicket 腾讯云图形验证码 ticket（条件必填）：当该 IP 超过验证码阈值时需携带，与 MD.AgentService.Core.Agenting.Contracts.UploadTokenRequest.CaptchaRandstr 成对。
   * @param {string} args.captchaRandstr 腾讯云图形验证码 randstr（条件必填），与 MD.AgentService.Core.Agenting.Contracts.UploadTokenRequest.CaptchaTicket 成对。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  agentUploadToken: function (args, options = {}) {
    return agentAPI(args, {
      ...options,
      url: '/api/agent/upload-token',
      method: 'POST',
    });
  },

  /**
   * V5.6.2：匿名语音输入凭证发放（官网免登录漏斗输入框语音输入）。鉴权层只放行 `allowAnonymous` agent 的匿名请求； 本 action 顺序：① agentName 必填 + 公开漏斗 sessionId 必传 → ② 验证码阈值闸（scene=voice 独立计数）+ 合成匿名身份 → ③ 独立发凭证限流（ma:rl:voice，按 sessionId）→ ④ gRPC 代理 MD.OCR 取腾讯 ASR STS 临时凭证。 凭证字段对齐 MDAPI `Mingo/GetFederationToken`（`token/tmpSecretId/tmpSecretKey/expiredTime/expiration/appId`）+ `state` 信封。
   * @param {Object} args 请求参数
   * @param {string} args.agentName 显式点名的目标 Agent（必填）。鉴权层据此判定是否 `allowAnonymous`；匿名请求不走自动路由。
   * @param {string} args.sessionId 后端签发的匿名会话 id（`allowAnonymous` agent 必填）：先调 `POST /api/agent/session-token` 获取， 匿名访问闸据此校验有效性 + 计发凭证限流 / 验证码维度。
   * @param {string} args.captchaTicket 腾讯云图形验证码 ticket（条件必填）：当该会话超过验证码阈值时需携带，与 MD.AgentService.Core.Agenting.Contracts.VoiceTokenRequest.CaptchaRandstr 成对。
   * @param {string} args.captchaRandstr 腾讯云图形验证码 randstr（条件必填），与 MD.AgentService.Core.Agenting.Contracts.VoiceTokenRequest.CaptchaTicket 成对。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  agentVoiceToken: function (args, options = {}) {
    return agentAPI(args, {
      ...options,
      url: '/api/agent/voice-token',
      method: 'POST',
    });
  },

  /**
   * 兼容 CopilotKit REST runtime 的 agent connect 入口。
   * @param {Object} args 请求参数
   * @param {string} args.agentId 目标 agent 名称（路径参数）；当前实现仅做握手探测，不实际使用该值
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  aguiAgentConnect: function (args = {}, options = {}) {
    const { agentId, ...rest } = args;
    return agentAPI(rest, {
      ...options,
      url: `/api/agui/agent/${encodeURIComponent(agentId)}/connect`,
      method: 'POST',
    });
  },

  /**
   * 兼容 CopilotKit REST runtime 的 agent run 入口。
   * @param {Object} args 请求参数
   * @param {string} args.agentId 目标 agent 名称（路径参数）；优先级高于 body.context.agentName，但 "default" 视为未指定 → 回退路由器
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  aguiAgentRun: function (args = {}, options = {}) {
    const { agentId, ...rest } = args;
    return agentAPI(rest, {
      ...options,
      url: `/api/agui/agent/${encodeURIComponent(agentId)}/run`,
      method: 'POST',
    });
  },

  /**
   * 兼容需要通过 POST 探测 runtime 信息的客户端。
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  aguiInfo: function (args, options = {}) {
    return agentAPI(args, {
      ...options,
      url: '/api/agui/info',
      method: 'POST',
    });
  },

  /**
   * 以 AG-UI SSE 协议执行请求。
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  aguiRun: function (args, options = {}) {
    return agentAPI(args, {
      ...options,
      url: '/api/agui',
      method: 'POST',
      isStream: true,
    });
  },

  /**
   * 取消指定线程下的所有活跃运行。
   * @param {Object} args 请求参数
   * @param {string} args.threadId 线程标识（路径参数），即 AG-UI 协议的 threadId；不存在活跃 run 返回 404、已完成返回 409
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  aguiThreadsCancel: function (args = {}, options = {}) {
    const { threadId, ...rest } = args;
    return agentAPI(rest, {
      ...options,
      url: `/api/agui/threads/${encodeURIComponent(threadId)}/cancel`,
      method: 'POST',
    });
  },

  /**
   * 切换 artifact 的 active 版本。POST body: { "versionId": "ver-xxx" }。
   * @param {Object} args 请求参数
   * @param {string} args.artifactId artifact 业务 ID
   * @param {string} args.versionId 目标版本业务 ID（形如 `ver-xxxx`）。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  artifactsActive: function (args = {}, options = {}) {
    const { artifactId, ...rest } = args;
    return agentAPI(rest, {
      ...options,
      url: `/api/artifacts/${encodeURIComponent(artifactId)}/active`,
      method: 'POST',
    });
  },

  /**
   * 会话软删除：把 sessionId 在 agent_sessions 元数据上打删除标记，之后该会话不再出现在会话列表里。 仅改元数据状态，消息正文不动。sessionId 必须属于当前登录用户，越权 / 不存在一律 404 不区分。
   * @param {Object} args 请求参数
   * @param {string} args.sessionId 会话标识（路径参数），必须属于当前登录用户。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  deleteAgentSessions: function (args = {}, options = {}) {
    const { sessionId, ...rest } = args;
    return agentAPI(rest, {
      ...options,
      url: `/api/agent/sessions/${encodeURIComponent(sessionId)}`,
      method: 'DELETE',
    });
  },

  /**
   * 删除整个 artifact（级联删版本与文件记录；Qiniu blob 走 GC 回收）。
   * @param {Object} args 请求参数
   * @param {string} args.artifactId artifact 业务 ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  deleteArtifacts: function (args = {}, options = {}) {
    const { artifactId, ...rest } = args;
    return agentAPI(rest, {
      ...options,
      url: `/api/artifacts/${encodeURIComponent(artifactId)}`,
      method: 'DELETE',
    });
  },

  /**
   * 删除某个版本（级联删该版本 artifact_files；不影响其他版本）。
   * @param {Object} args 请求参数
   * @param {string} args.artifactId artifact 业务 ID
   * @param {string} args.versionId 版本业务 ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  deleteArtifactsVersions: function (args = {}, options = {}) {
    const { artifactId, versionId, ...rest } = args;
    return agentAPI(rest, {
      ...options,
      url: `/api/artifacts/${encodeURIComponent(artifactId)}/versions/${encodeURIComponent(versionId)}`,
      method: 'DELETE',
    });
  },

  /**
   * 查询指定组织当月(自然月,按容器时区)的免费额度:发放总额、已消耗、剩余可用。 要求:用户已登录(401) 且 隶属于该组织(403);projectId 必传(400 invalid_request,errorMessage 说明缺 projectId)。
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织 ID(query 参数 ?projectId=xxx),必传。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getAgentBillingFreeQuota: function (args = {}, options = {}) {
    return agentAPI(args, {
      ...options,
      url: '/api/agent/billing/free-quota',
      method: 'GET',
    });
  },

  /**
   * V5.11.8：翻页查询指定组织的账单列表——<b>按 traceId 聚合</b>(一笔请求一行),按各 trace 最新时间倒序(最新在前)。 单 agent=1 行、a2a 编排=1 行(N 条逐 agent 明细聚合);逐 agent 明细点开走 `transactions/{traceId}`。 鉴权与 free-quota 同口径(登录 401 + 隶属该组织 403);projectId 必传(400)。 翻页口径对齐会话历史:page 从 1 起、size 默认 20、单页最多 100 条、page * size ≤ 1000(防深翻);<b>page 按 trace 笔数翻、TotalCount=去重 trace 数</b>。 支持按 startDate/endDate(yyyy-MM-dd,容器本地时区、含首尾整天)过滤创建时间; token 默认<b>不返回</b>(列表轻量化),仅当 includeTokens=true 时附带。
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织 ID(query 参数 ?projectId=xxx),必传。
   * @param {integer} args.page 页码(从 1 起,默认 1)。
   * @param {integer} args.size 单页条数(默认 20,硬上限 100)。
   * @param {string} args.startDate 可选:起始日期 yyyy-MM-dd(含当天 00:00,本地时区);格式非法 400。
   * @param {string} args.endDate 可选:结束日期 yyyy-MM-dd(含当天整日,本地时区);格式非法 400。
   * @param {boolean} args.includeTokens 可选:是否返回 token 汇总(默认 false=不返回,响应省略 tokens 字段)。
   * @param {boolean} args.onlyWithFreeQuota 可选:为 true 时只返回用了免费额度(聚合后 FreeApplied>0)的笔。<b>默认 true</b>(不传即只返免费额度笔)。 注意 a2a 聚合行拆分留空=0、会被漏掉(见 §15.6)——默认 true 下 a2a 账单及未用免费额度的笔均不显示,要看全部传 false。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getAgentBillingTransactions: function (args = {}, options = {}) {
    return agentAPI(args, {
      ...options,
      url: '/api/agent/billing/transactions',
      method: 'GET',
    });
  },

  /**
   * V5.11.4：按 traceId 查询该次请求的扣款明细(a2a 编排=N 条逐 agent 明细;单 agent=1 条),按创建时间正序。 鉴权与列表接口同口径(登录 401 + 隶属该组织 403);projectId + traceId 必传(400)。 存储层按 (projectId, traceId) 双条件查询,租户隔离落数据层——即便知道别组织 traceId 也读不到。
   * @param {Object} args 请求参数
   * @param {string} args.traceId 请求级真实 traceId(路由参数,前端从账单列表项的 TraceId 拿到)。
   * @param {string} args.projectId 组织 ID(query 参数 ?projectId=xxx),必传。
   * @param {boolean} args.includeTokens 可选:是否返回各明细行的 token 数(默认 false=不返回,响应省略 inputTokens/outputTokens/cachedInputTokens)。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getAgentBillingTransactionsByTraceId: function (args = {}, options = {}) {
    const { traceId, ...rest } = args;
    return agentAPI(rest, {
      ...options,
      url: `/api/agent/billing/transactions/${encodeURIComponent(traceId)}`,
      method: 'GET',
    });
  },

  /**
   * V5.11.8：按 traceId 查该次请求的<b>用量汇总</b>(只返总数,不返逐 agent 明细——与 §17.18 的唯一区别)。 供前端在一次请求(尤其单 agent)结束后回看「这一次共花了多少」:总信用点 + 总 token(+ 免费/账户拆分)。 鉴权 / 隔离 / 取数与 §17.18 完全同口径(登录 401 + 隶属组织 403 + projectId/traceId 必传 400; 存储层 (projectId, traceId) 双条件查、租户隔离落数据层);part 数有界,不翻页。
   * @param {Object} args 请求参数
   * @param {string} args.traceId 请求级真实 traceId(路由参数)。
   * @param {string} args.projectId 组织 ID(query 参数 ?projectId=xxx),必传。
   * @param {boolean} args.includeTokens 可选:是否返回 token 汇总(默认 false=不返回,响应省略 tokens 字段;credits/拆分始终返回)。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getAgentBillingUsage: function (args = {}, options = {}) {
    const { traceId, ...rest } = args;
    return agentAPI(rest, {
      ...options,
      url: `/api/agent/billing/usage/${encodeURIComponent(traceId)}`,
      method: 'GET',
    });
  },

  /**
   * 取某 plan 版本(artifactId + versionId)的 build 费用预估;miss 时当场算。
   * @param {Object} args 请求参数
   * @param {string} args.artifactId plan 产物 artifactId(query),必传。
   * @param {string} args.versionId plan 版本 versionId(query),必传;预估按版本缓存,改版自动失效。
   * @param {boolean} args.includeTokens 可选:是否返回 token 预估明细(默认 false=不返回,响应省略 tokens 字段;credits 区间始终返回)。命名对齐 BillingController。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getAgentBuildEstimate: function (args = {}, options = {}) {
    return agentAPI(args, {
      ...options,
      url: '/api/agent/build-estimate',
      method: 'GET',
    });
  },

  /**
   * 返回当前可用的 Agent 定义摘要。
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getAgentConfigAgents: function (args, options = {}) {
    return agentAPI(args, {
      ...options,
      url: '/api/agent/config/agents',
      method: 'GET',
    });
  },

  /**
   * 返回基础服务状态(旧端点,向后兼容;恒 ok)。
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getAgentHealth: function (args, options = {}) {
    return agentAPI(args, {
      ...options,
      url: '/api/agent/health',
      method: 'GET',
    });
  },

  /**
   * liveness 探针:恒 ok。仅反映进程存活,不受优雅停机 / drain 影响——否则停机中会被误判挂掉而提前重启杀。
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getAgentHealthLive: function (args, options = {}) {
    return agentAPI(args, {
      ...options,
      url: '/api/agent/health/live',
      method: 'GET',
    });
  },

  /**
   * readiness 探针:就绪返 200、未就绪(启动未完成 / 已进入停机)返 503，让 K8s 把本 pod 从 endpoints 摘掉、不再路由新流量。
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getAgentHealthReady: function (args, options = {}) {
    return agentAPI(args, {
      ...options,
      url: '/api/agent/health/ready',
      method: 'GET',
    });
  },

  /**
   * V4.0 R6 D2：查询指定 sessionId 的 build 进度（SSE 断连场景下的兜底通道）。 鉴权同 cancel：accountId|sessionId 物理隔离,跨账号自然查不到记录(返回空进度 + resumable=false)。 V5.5：可选 detail=true 额外返回 checkpoint 明细（原始输入摘要 + 各步关键产出如 appId + loop 逐迭代结果如工作表 name/id/成败），用于排障与"继续"前展示。缺省 false，零额外开销、旧调用不受影响。 详见 docs/architecture/checkpoint-recovery.md §13.6。
   * @param {Object} args 请求参数
   * @param {string} args.sessionId 前端会话 id。
   * @param {boolean} args.detail 是否返回 checkpoint 明细（查询参数 `?detail=true`）；缺省 false 只返回摘要。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getAgentProgress: function (args = {}, options = {}) {
    const { sessionId, ...rest } = args;
    return agentAPI(rest, {
      ...options,
      url: `/api/agent/progress/${encodeURIComponent(sessionId)}`,
      method: 'GET',
      isStream: true,
    });
  },

  /**
   * 列出当前登录用户的 session 元数据。agentName 与 onlyUnbound 互斥（只能传一个），都不传时返回该用户全部 session。
   * @param {Object} args 请求参数
   * @param {string} args.agentName 按 agent 精确匹配过滤；与 onlyUnbound 互斥；不校验该 agent 是否在当前 YAML 中存在（已删除的 agent 仍能查到历史 session）
   * @param {boolean} args.onlyUnbound 为 true 时仅返回 agentName 字段为 null 的 session（即创建时未传 agentName、走路由器创建的 session）；与 agentName 互斥
   * @param {string} args.keyword 关键词：对首条消息预览做大小写不敏感的子串过滤；空白忽略。与 agentName / onlyUnbound 正交，可叠加
   * @param {integer} args.page 页码（从 1 起，默认 1）
   * @param {integer} args.size 单页条数（默认 20，硬上限 100；page * size 上限 1000）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getAgentSessions: function (args = {}, options = {}) {
    return agentAPI(args, {
      ...options,
      url: '/api/agent/sessions',
      method: 'GET',
    });
  },

  /**
   * 列出指定 sessionId 下的全部消息。sessionId 必须属于当前登录用户，否则返回 404 不区分"不存在"与"他人所有"。
   * @param {Object} args 请求参数
   * @param {string} args.sessionId 会话标识（路径参数），必须属于当前登录用户；鉴权依据是 agent_session_messages 中是否有 (accountId, sessionId) 任一记录，不依赖 agent_sessions 元数据是否存在
   * @param {integer} args.page 页码（从 1 起，默认 1）
   * @param {integer} args.size 单页条数（默认 50，硬上限 100；page * size 上限 1000）
   * @param {boolean} args.includeUsage V2.9.2：为 true 时在 assistant 消息上附带本轮已结算的信用点用量（usage）；默认 false（不查计费、响应与历史一致）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getAgentSessionsMessages: function (args = {}, options = {}) {
    const { sessionId, ...rest } = args;
    return agentAPI(rest, {
      ...options,
      url: `/api/agent/sessions/${encodeURIComponent(sessionId)}/messages`,
      method: 'GET',
    });
  },

  /**
   * 返回 CopilotKit / AG-UI runtime 信息，供前端探测运行模式与智能体列表。
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getAguiInfo: function (args, options = {}) {
    return agentAPI(args, {
      ...options,
      url: '/api/agui/info',
      method: 'GET',
    });
  },

  /**
   * 列出当前账号的 artifact。支持按 sessionId 过滤 + 分页。
   * @param {Object} args 请求参数
   * @param {string} args.sessionId 可选：仅返回指定 session 首次创建的 artifact
   * @param {string} args.status 可选：状态过滤，默认 active
   * @param {integer} args.page 页码，1-based，默认 1
   * @param {integer} args.size 每页大小，默认 20，上限 100
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getArtifacts: function (args = {}, options = {}) {
    return agentAPI(args, {
      ...options,
      url: '/api/artifacts',
      method: 'GET',
    });
  },

  /**
   * 按 artifactId 查询产物详情。
   * @param {Object} args 请求参数
   * @param {string} args.artifactId artifact 业务 ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getArtifactsByArtifactId: function (args = {}, options = {}) {
    const { artifactId, ...rest } = args;
    return agentAPI(rest, {
      ...options,
      url: `/api/artifacts/${encodeURIComponent(artifactId)}`,
      method: 'GET',
    });
  },

  /**
   * 列出 artifact 的全部 committed 版本；按创建时间升序。
   * @param {Object} args 请求参数
   * @param {string} args.artifactId artifact 业务 ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getArtifactsVersions: function (args = {}, options = {}) {
    const { artifactId, ...rest } = args;
    return agentAPI(rest, {
      ...options,
      url: `/api/artifacts/${encodeURIComponent(artifactId)}/versions`,
      method: 'GET',
    });
  },

  /**
   * 按 versionId 查询版本元数据。
   * @param {Object} args 请求参数
   * @param {string} args.artifactId artifact 业务 ID（用于权限校验）
   * @param {string} args.versionId 版本业务 ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getArtifactsVersionsByVersionId: function (args = {}, options = {}) {
    const { artifactId, versionId, ...rest } = args;
    return agentAPI(rest, {
      ...options,
      url: `/api/artifacts/${encodeURIComponent(artifactId)}/versions/${encodeURIComponent(versionId)}`,
      method: 'GET',
    });
  },

  /**
   * 两个版本之间的文件级 diff：Added / Modified / Removed / Unchanged。
   * @param {Object} args 请求参数
   * @param {string} args.artifactId artifact 业务 ID
   * @param {string} args.versionId 终点版本
   * @param {string} args.against 起点版本
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getArtifactsVersionsDiff: function (args = {}, options = {}) {
    const { artifactId, versionId, ...rest } = args;
    return agentAPI(rest, {
      ...options,
      url: `/api/artifacts/${encodeURIComponent(artifactId)}/versions/${encodeURIComponent(versionId)}/diff`,
      method: 'GET',
    });
  },

  /**
   * 把某版本的全部文件打包成 zip 直接流返回；内存实现，仅适用于 MaxVersionTotalSize 以内的产物。
   * @param {Object} args 请求参数
   * @param {string} args.artifactId artifact 业务 ID
   * @param {string} args.versionId 版本业务 ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getArtifactsVersionsDownload: function (args = {}, options = {}) {
    const { artifactId, versionId, ...rest } = args;
    return agentAPI(rest, {
      ...options,
      url: `/api/artifacts/${encodeURIComponent(artifactId)}/versions/${encodeURIComponent(versionId)}/download`,
      method: 'GET',
    });
  },

  /**
   * 列出某版本的文件树，可按路径前缀过滤。
   * @param {Object} args 请求参数
   * @param {string} args.artifactId artifact 业务 ID
   * @param {string} args.versionId 版本业务 ID
   * @param {string} args.prefix 可选路径前缀（例如 /forms/）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getArtifactsVersionsFiles: function (args = {}, options = {}) {
    const { artifactId, versionId, ...rest } = args;
    return agentAPI(rest, {
      ...options,
      url: `/api/artifacts/${encodeURIComponent(artifactId)}/versions/${encodeURIComponent(versionId)}/files`,
      method: 'GET',
    });
  },

  /**
   * 读取某版本单文件；返回 Qiniu 签名 URL，前端直接 fetch。
   * @param {Object} args 请求参数
   * @param {string} args.artifactId artifact 业务 ID
   * @param {string} args.versionId 版本业务 ID
   * @param {string} args.path 绝对路径，必须 / 开头
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getArtifactsVersionsFilesByPath: function (args = {}, options = {}) {
    const { artifactId, versionId, path, ...rest } = args;
    return agentAPI(rest, {
      ...options,
      url: `/api/artifacts/${encodeURIComponent(artifactId)}/versions/${encodeURIComponent(versionId)}/files/${encodeURIComponent(path)}`,
      method: 'GET',
    });
  },
};
