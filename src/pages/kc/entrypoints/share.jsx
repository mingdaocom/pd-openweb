import qs from 'query-string';
import { browserIsMobile } from 'src/utils/common';
import renderPc from '../entrypoints/sharePc';
import render from '../shareMobile';

require.ensure([], () => {
  const { projectId } = qs.parse(location.search.slice(1));

  if (
    (browserIsMobile() || location.href.indexOf('kcsharelocal') > -1) &&
    location.href.indexOf('recordfile') < 0 &&
    location.href.indexOf('rowfile') < 0
  ) {
    render(projectId);
  } else {
    renderPc(projectId);
  }
});
