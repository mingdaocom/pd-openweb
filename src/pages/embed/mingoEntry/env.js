const ENV_FLAG_RULES = {
  isDingTalk: ua => ua.includes('dingtalk'),
  isWxWork: ua => ua.includes('wxwork'),
  isWeLink: ua => ua.includes('huawei-anyoffice'),
  isFeiShu: ua => ua.includes('feishu'),
  isWeiXin: ua => ua.includes('micromessenger'),
  isOceanEngine: ua => ua.includes('oceanengine'),
  isDouYin: ua => ua.includes('aweme'),
};

export function getThirdPartyIntegrationFlags() {
  const ua = typeof window !== 'undefined' && window.navigator ? window.navigator.userAgent.toLowerCase() : '';

  return Object.keys(ENV_FLAG_RULES).reduce((result, key) => {
    result[key] =
      typeof window !== 'undefined' && typeof window[key] === 'boolean' ? window[key] : ENV_FLAG_RULES[key](ua);
    return result;
  }, {});
}

export function ensureThirdPartyIntegrationFlags() {
  if (typeof window === 'undefined') return {};

  const flags = getThirdPartyIntegrationFlags();

  Object.keys(flags).forEach(key => {
    if (typeof window[key] !== 'boolean') {
      window[key] = flags[key];
    }
  });

  return flags;
}

export function isThirdPartyIntegration() {
  const flags = getThirdPartyIntegrationFlags();

  return Object.keys(flags).some(key => flags[key]);
}
