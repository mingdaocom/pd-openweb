import homeAppApi from 'src/api/homeApp';
import { pathCompletion } from 'src/utils/platform/navigation/path';

/**
 * 将外部门户旧工作表地址转换为当前应用路由。
 */
export function compatibleWorksheetRoute(worksheetId, rowId, viewId) {
  homeAppApi.getAppSimpleInfo({ workSheetId: worksheetId }).then(({ appId, appSectionId, workSheetId }) => {
    if (!appId) return;

    let url = '';

    if (rowId) {
      url = `/app/${appId}/${workSheetId}/row/${rowId}`;
    } else if (viewId) {
      url = `/app/${appId}/${appSectionId}/${workSheetId}/${viewId}${location.search}`;
    } else if (appSectionId) {
      url = `/app/${appId}/${appSectionId}/${workSheetId}`;
    }

    location.href = pathCompletion(url);
  });
}
