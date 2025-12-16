import globalApi from 'src/api/global';

globalApi.getGlobalMeta().then(res => {
  try {
    const accountId = res['md.global']?.Account?.accountId;
    if (!accountId) {
      throw new Error('login failed');
    }
    console.log(res['md.global'].Account);
  } catch (err) {
    console.log(err);
    location.href = '/login?ReturnUrl=' + encodeURIComponent(location.href);
  }
});
