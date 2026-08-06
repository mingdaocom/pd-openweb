import globalApi from 'src/api/global';
import { pathCompletion } from 'src/utils/common';

globalApi.getGlobalMeta().then(res => {
  try {
    const accountId = res['md.global']?.Account?.accountId;

    if (!accountId) {
      throw new Error('login failed');
    }

    console.log(res['md.global'].Account);
  } catch (err) {
    console.log(err);
    location.href = pathCompletion('/login?ReturnUrl=' + encodeURIComponent(location.href));
  }
});
