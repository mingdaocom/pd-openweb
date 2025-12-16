import globalApi from 'src/api/global';

var config = JSON.parse(atob(new URL(location.href).searchParams.get('p')));
globalApi.getGlobalMeta().then(res => {
  try {
    const accountId = res['md.global']?.Account?.accountId;
    if (!accountId) {
      throw new Error('login failed');
    }
    const cookie = document.cookie.match(/md_pss_id=(\w+)/)[1];
    location.href = config.url + '?t=' + btoa(cookie);
  } catch (err) {
    console.log(err);
    location.href = '/login?ReturnUrl=' + encodeURIComponent(location.href);
  }
});
