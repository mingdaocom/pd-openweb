import qs from 'query-string';

/**
 * 从查询字符串中解析请求参数，并移除问号与哈希片段。
 */
export const getRequest = str => {
  str = str || location.search;
  str = str
    .replace(/^\?/, '')
    .replace(/#.*$/, '')
    .replace(/(^&|&$)/, '');

  return qs.parse(str);
};

/**
 * 根据用户代理及协作平台侧栏状态判断是否使用移动端交互。
 */
export const browserIsMobile = () => {
  const sUserAgent = navigator.userAgent.toLowerCase();
  const bIsIphoneOs = sUserAgent.match(/iphone os/i) == 'iphone os';
  const bIsMidp = sUserAgent.match(/midp/i) == 'midp';
  const bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == 'rv:1.2.3.4';
  const bIsUc = sUserAgent.match(/ucweb/i) == 'ucweb';
  const bIsAndroid = sUserAgent.match(/android/i) == 'android';
  const bIsCE = sUserAgent.match(/windows ce/i) == 'windows ce';
  const bIsWM = sUserAgent.match(/windows mobile/i) == 'windows mobile';
  const bIsApp = sUserAgent.match(/mingdao application/i) == 'mingdao application';
  const bIsMiniProgram = sUserAgent.match(/miniprogram/i) == 'miniprogram';
  const isHuawei = sUserAgent.match(/mobile huaweibrowser/i) == 'mobile huaweibrowser';
  const isHarmony = sUserAgent.match(/penharmony/i) == 'penharmony';
  const isAndroid = sUserAgent.match(/android/i) == 'android';

  const value =
    bIsIphoneOs ||
    bIsMidp ||
    bIsUc7 ||
    bIsUc ||
    bIsAndroid ||
    bIsCE ||
    bIsWM ||
    bIsApp ||
    bIsMiniProgram ||
    isHuawei ||
    isHarmony ||
    isAndroid;

  if (sUserAgent.includes('dingtalk') || sUserAgent.includes('wxwork') || sUserAgent.includes('feishu')) {
    // 钉钉和微信设备针对侧边栏打开判断为 mobile 环境
    const { pc_slide = '' } = getRequest();
    return pc_slide.includes('true') || sessionStorage.getItem('dingtalk_pc_slide') ? true : value;
  } else {
    return value;
  }
};

/** 判断当前移动端运行环境是否提供原生生物识别能力。 */
export const isBioVerifyAvailable = () =>
  !!(browserIsMobile() && window.isMingDaoApp && window.md_js && typeof window.md_js.bioVerify === 'function');
