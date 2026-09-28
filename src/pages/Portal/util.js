import _ from 'lodash';
import { getSuffix } from 'src/pages/AuthService/portalAccount/util';
import { compatibleWorksheetRoute } from 'src/pages/Portal/navigation';
import { navigateToLogout } from 'src/router/navigation/navigateTo';

export function formatPortalHref(props) {
  // 外部门户 并且应用id对应不上 自定义域名后缀也对应不上
  if (
    md.global.Account.isPortal &&
    ![md.global.Account.appId, md.global.Account.addressSuffix].includes(_.get(props, 'computedMatch.params.appId')) &&
    getSuffix(location.href) !== md.global.Account.addressSuffix
  ) {
    if (location.href.indexOf('worksheet/') >= 0 && _.get(props, 'computedMatch.params.worksheetId')) {
      compatibleWorksheetRoute(
        _.get(props, 'computedMatch.params.worksheetId'),
        _.get(props, 'computedMatch.params.rowId'),
        _.get(props, 'computedMatch.params.viewId'),
      );
    } else {
      navigateToLogout();
    }
  }
}
