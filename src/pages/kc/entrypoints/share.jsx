import { browserIsMobile } from 'src/util';

require.ensure([], require => {
  if (browserIsMobile() || location.href.indexOf('kcsharelocal') > -1) {
    require('../shareMobile/');
  } else {
    require('../entrypoints/sharePc');
  }
});
