// Agent 服务（MDAgentService）错误码 → 前端文案，按错误码给出的提示统一在此维护，业务处不再各自写文案。
// 后端 errorMessage 未做多语言，且多为面向开发的原文（英文异常、带 agent / 步骤名），
// 前端可见的已知错误码在此维护文案；未收录的码仍回退展示后端原文。
// 码值对齐后端 AgentErrorCodes 与 FileExecution/FileAdmissionRejection。
// 文案放在函数内生成：语言包可能晚于模块加载，顶层固化的 _l 结果不会随语言就绪更新。
function getAgentErrorMessageMap() {
  const configError = _l('智能体配置有误，请联系管理员');
  const retryLater = _l('服务异常，请稍后重试');
  const modelIncompatible = _l('当前模型配置不兼容，请联系管理员');
  const invalidAttachment = _l('附件地址无效，请重新上传');
  const imageInputUnavailable = _l('当前模型暂不支持图片输入');
  const artifactFailed = _l('产物处理失败，请稍后重试');
  const voiceUnavailable = _l('语音输入暂不可用');
  const fileWorkspaceRetiring = _l('文件环境正在回收，请稍后重试');
  const fileCapacity = _l('文件环境容量不足，请稍后重试');

  return {
    // 计费 / 权限
    insufficient_credit: _l('组织信用点余额不足，请充值后重试'),
    quota_exhausted: _l('当前版本配额不足，请升级后重试'),
    account_not_in_project: _l('当前账号不属于该组织，无权访问'),
    agent_access_denied: _l('您在当前组织中暂无使用该功能的权限，请联系组织管理员授权'),
    session_not_owned: _l('无权访问该会话'),
    share_access_denied: _l('分享已失效或无权访问'),
    rate_limit_exceeded: _l('访问过于频繁，请稍后重试'),

    // 请求 / 会话
    invalid_request: _l('请求参数无效'),
    session_not_found: _l('会话已删除'),
    message_not_found: _l('消息不存在'),
    regenerate_not_supported: _l('该类对话暂不支持重新生成'),
    checkpoint_not_found: _l('会话已过期或不存在，请重新开始'),
    checkpoint_expired: _l('会话已过期，请重新开始'),
    checkpoint_mismatch: _l('恢复参数无效，请刷新后重试'),
    anon_session_invalid: _l('会话已失效，请刷新后重试'),
    session_claim_empty: _l('没有可恢复的草稿'),
    captcha_required: _l('请完成验证后重试'),
    captcha_failed: _l('验证未通过，请重试'),
    not_supported: _l('当前环境不支持该功能'),

    // 执行
    router_failed: _l('暂无可处理该请求的智能体，请调整描述后重试'),
    agent_not_found: _l('未找到对应的智能体'),
    agent_execute_failed: _l('执行失败，请稍后重试'),
    harness_execution_failed: _l('执行失败，请稍后重试'),
    tool_execute_failed: _l('工具执行失败，请稍后重试'),
    mcp_execute_failed: _l('外部工具调用失败，请稍后重试'),
    schema_validation_failed: _l('生成结果格式校验失败，请重试'),
    structured_output_unsupported: _l('当前模型不支持结构化输出，请更换模型后重试'),
    sdm_config_unavailable: _l('模型服务暂未就绪，请稍后重试'),
    hook_execution_failed: retryLater,
    hook_timeout: _l('服务处理超时，请稍后重试'),
    unexpected_error: retryLater,

    // 智能体配置
    dsl_invalid: configError,
    mcp_forbidden_host: configError,
    mcp_forbidden_template: configError,
    prompt_render_failed: configError,
    prompt_forbidden_template: configError,
    tool_render_failed: configError,
    mcp_identity_required: _l('当前身份信息不完整，无法连接外部工具'),
    model_api_type_invalid: modelIncompatible,
    model_api_chain_mismatch: modelIncompatible,
    model_api_capability_unsupported: modelIncompatible,
    model_api_parameters_conflict: modelIncompatible,
    model_api_history_incompatible: modelIncompatible,

    // 附件
    too_many_attachments: _l('附件数量超出上限'),
    type_not_supported: _l('不支持该附件类型'),
    invalid_url: invalidAttachment,
    url_host_mismatch: invalidAttachment,
    media_type_not_supported: _l('不支持该图片格式'),
    invalid_name: _l('附件名称不能为空'),
    size_out_of_range: _l('附件大小超出限制'),
    doc_attachment_extract_failed: _l('文档解析失败，已终止本次执行，请检查文档后重试'),
    image_vision_extract_failed: _l('图片解析失败，已终止本次执行，请稍后重试'),
    image_input_config_invalid: imageInputUnavailable,
    image_input_unavailable: imageInputUnavailable,

    // 产物
    artifact_not_found: artifactFailed,
    artifact_version_not_found: artifactFailed,
    artifact_file_not_found: artifactFailed,
    artifact_forbidden_path: artifactFailed,
    artifact_forbidden_operation: artifactFailed,
    artifact_too_large: _l('产物文件过大'),
    artifact_path_invalid: artifactFailed,
    artifact_version_not_draft: artifactFailed,
    artifact_draft_discarded: artifactFailed,
    artifact_access_denied: _l('无权访问该产物'),
    artifact_storage_failure: artifactFailed,
    artifact_binding_mismatch: artifactFailed,
    artifact_no_baseline: artifactFailed,
    artifact_not_bound: artifactFailed,

    // 语音
    voice_unconfigured: voiceUnavailable,
    voice_token_failed: voiceUnavailable,

    // 文件执行准入
    file_idle_workspace_retiring: fileWorkspaceRetiring,
    file_scope_changed_workspace_retiring: fileWorkspaceRetiring,
    file_image_changed_workspace_retiring: fileWorkspaceRetiring,
    file_session_busy: _l('文件任务正在处理中，请稍后重试'),
    file_slot_recovery_pending: _l('文件环境需要核实，暂不能开始新的执行'),
    sandbox_capacity: fileCapacity,
    file_session_binding_capacity: fileCapacity,
    file_catalog_capacity_maintenance_required: fileCapacity,
    file_execution_disabled: _l('当前请求未获准使用文件执行'),
    file_execution_not_allowed: _l('当前请求未获准使用文件执行'),
    file_execution_requires_verified_identity: _l('当前请求未获准使用文件执行'),
    file_execution_incompatible_configuration: _l('当前请求不支持文件执行'),
    file_execution_request_scope_mismatch: _l('当前请求不支持文件执行'),
  };
}

/** 已知错误码的前端文案；未收录或缺省返回空串，由调用方回退。 */
export function getAgentErrorMessage(errorCode) {
  if (!errorCode || typeof errorCode !== 'string') return '';

  const map = getAgentErrorMessageMap();

  return Object.prototype.hasOwnProperty.call(map, errorCode) ? map[errorCode] : '';
}

/** 问题反馈入口的错误提示：同一码在反馈场景下语义不同（如 invalid_request 指当前请求不可反馈），单独一组。 */
export function getAgentFeedbackErrorMessage(errorCode) {
  switch (errorCode) {
    case 'feedback_form_not_found':
      return _l('反馈入口暂未开放');
    case 'trace_not_found':
    case 'invalid_request':
      return _l('当前请求暂不可反馈');
    case 'feedback_form_invalid':
      return _l('反馈服务暂不可用，请稍后重试');
    default:
      return _l('打开反馈页面失败，请稍后重试');
  }
}

/** 优先已知错误码文案，其次后端原文，最后兜底文案。 */
export function resolveAgentErrorMessage(errorCode, backendMessage, fallback = '') {
  return getAgentErrorMessage(errorCode) || backendMessage || fallback;
}
