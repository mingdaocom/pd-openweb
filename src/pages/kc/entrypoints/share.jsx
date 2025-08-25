import { browserIsMobile } from 'src/utils/common';
import renderPc from '../entrypoints/sharePc';
import render from '../shareMobile';

require.ensure([], () => {
  if (
    (browserIsMobile() || location.href.indexOf('kcsharelocal') > -1) &&
    location.href.indexOf('recordfile') < 0 &&
    location.href.indexOf('rowfile') < 0
  ) {
    render();
  } else {
    renderPc();
  }
});
