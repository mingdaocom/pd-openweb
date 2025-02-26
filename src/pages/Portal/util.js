import { getSuffix } from 'src/pages/AuthService/portalAccount/util';
import api from 'src/api/homeApp';
import { browserIsMobile } from 'src/util';
import { navigateToLogout } from 'src/router/navigateTo';

export const compatibleWorksheetRoute = (worksheetId, rowId, viewId) => {
  //工作表老路由id补齐
  api.getAppSimpleInfo({ workSheetId: worksheetId }).then(({ appId, appSectionId, workSheetId }) => {
    if (appId) {
      let url = '';
      if (rowId) {
        if (getSuffix(location.href) !== md.global.Account.addressSuffix) {
          url = `/app/${appId}/${workSheetId}/row/${rowId}`;
        } else {
          url = `/${md.global.Account.addressSuffix}/${workSheetId}/row/${rowId}`;
        }
      } else if (viewId) {
        if (getSuffix(location.href) !== md.global.Account.addressSuffix) {
          url = `/app/${appId}/${appSectionId}/${workSheetId}/${viewId}${location.search}`;
        } else {
          url = `/${md.global.Account.addressSuffix}/${appSectionId}/${workSheetId}/${viewId}${location.search}`;
        }
      } else if (appSectionId) {
        if (getSuffix(location.href) !== md.global.Account.addressSuffix) {
          url = `/app/${appId}/${appSectionId}/${workSheetId}`;
        } else {
          url = `/${md.global.Account.addressSuffix}/${appSectionId}/${workSheetId}`;
        }
      }
      location.href = `${window.subPath || ''}${url}`;
    }
  });
};

export function formatPortalHref(props) {
  // 外部门户 并且应用id对应不上 自定义后缀也对应不上
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
  //h5打开外部门户自定义后缀地址访问 地址处理
  if (md.global.Account.isPortal && browserIsMobile() && getSuffix(location.href) === md.global.Account.addressSuffix) {
    location.href = (window.subPath || '') + '/' + 'app/' + md.global.Account.appId + location.search;
  }
}
