// 上传接口的 HTTP 401 也包含扫描、存储失败，必须优先识别响应中的业务 code。
export function getUploadError(response, fileName = '') {
  const data = typeof response === 'string' ? safeParse(response, 'object') : response;
  // 正常上传响应不含数字业务码，仍返回 null，避免被错误兜底拦截。
  if (!data || typeof data !== 'object' || !Number.isFinite(data.code)) return null;

  // 已知业务码使用前端本地化提示，接口 message 保留在原始响应中供排查。
  let reason;

  switch (data.code) {
    case 40001:
      reason = _l('上传凭证无效或已过期，请重新上传');
      break;
    case 40002:
      reason = _l('不支持此文件格式，请转换后重试。');
      break;
    case 40003:
      reason = _l('上传文件数据无效，请重新上传');
      break;
    case 40004:
      reason = _l('文件大小错误，请检查后重新上传');
      break;
    case 40006:
      reason = _l('发现病毒或恶意内容');
      break;
    case 40007:
      reason = _l('文件不符合安全扫描策略');
      break;
    case 50001:
      reason = _l('文件处理或存储失败，请稍后重试');
      break;
    case 50002:
      reason = _l('文件元数据处理失败，请稍后重试');
      break;
    case 50003:
      reason = _l('文件哈希初始化失败，请稍后重试');
      break;
    case 50004:
      reason = _l('上传选项处理失败，请稍后重试');
      break;
    case 50005:
      reason = _l('安全扫描服务暂不可用，请稍后重试');
      break;
    case 50006:
      reason = _l('安全扫描繁忙或超时，请稍后重试');
      break;
    default:
      reason = typeof data.message === 'string' && data.message.trim() ? data.message : _l('上传失败，请稍后再试。');
      break;
  }

  const isSecurityError = data.code === 40006 || data.code === 40007;
  const message = isSecurityError
    ? fileName
      ? _l('「%0」检测到安全风险：%1', fileName, reason)
      : _l('检测到安全风险：%0', reason)
    : reason;

  return { code: data.code, message, isSecurityError };
}
