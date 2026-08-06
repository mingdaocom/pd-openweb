import globalApi from 'src/api/global';
import { pathCompletion } from 'src/utils/common';

var config = JSON.parse(atob(new URL(location.href).searchParams.get('p')));
globalApi.getGlobalMeta().then(res => {
  try {
    const accountId = res['md.global']?.Account?.accountId;

    if (!accountId) {
      throw new Error('login failed');
    }

    const cookie = document.cookie.match(/md_pss_id=(\w+)/)[1];
    const callbackUrl = config.url + '?t=' + btoa(cookie);
    // config.url 是 mdye-cli 传入的本机回调地址（如 http://127.0.0.1:5100），属于绝对外链，
    // 不能再走 pathCompletion，否则会被强行拼上当前站点域名导致跳转地址错误。
    location.href = /^https?:\/\//i.test(config.url) ? callbackUrl : pathCompletion(callbackUrl);
  } catch (err) {
    console.log(err);
    location.href = pathCompletion('/login?ReturnUrl=' + encodeURIComponent(location.href));
  }
});
