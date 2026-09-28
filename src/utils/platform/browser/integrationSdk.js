import loadScript from 'load-script';

/**
 * 根据当前容器环境按需加载钉钉、企业微信、飞书等第三方 JS SDK。
 */
export function loadIntegrationSdk() {
  const isIOS = window.isIphone || window.isIPad || window.navigator.userAgent.toLowerCase().includes('ipod');
  const isDesktopMac = window.isMacOs && !isIOS;
  const isWx =
    window.isWeiXin &&
    !isDesktopMac &&
    !window.platformENV.isOverseas &&
    !window.platformENV.isLocal &&
    !window.isWxWork;

  if (window.isDingTalk && !window.dd) {
    loadScript('https://g.alicdn.com/dingding/dingtalk-jsapi/2.6.41/dingtalk.open.js');
  }

  if (window.isWeLink && !window.HWH5) {
    loadScript('https://open-doc.welink.huaweicloud.com/docs/jsapi/2.0.4/hwh5-cloudonline.js');
  }

  if (isWx && !window.wx) {
    loadScript('https://res2.wx.qq.com/open/js/jweixin-1.6.0.js');
  }

  if (window.isWxWork && !window.wx) {
    loadScript('https://res.wx.qq.com/open/js/jweixin-1.2.0.js');
  }

  if (window.isFeiShu && !window.h5sdk) {
    loadScript('https://lf1-cdn-tos.bytegoofy.com/goofy/lark/op/h5-js-sdk-1.5.19.js');
  }
}
