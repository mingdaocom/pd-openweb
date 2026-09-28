import _ from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { getFeatureStatus } from 'src/utils/services/project';

/**
 * 发送云打印
 * @param {*} id 打印模板id
 * @param {*} projectId
 * @param {*} appId
 * @param {*} worksheetId
 * @param {*} rowIds
 * @param {*} callback 回调函数
 */
export function sendCloudPrint({
  id,
  projectId,
  appId,
  worksheetId,
  rowIds,
  mobileUpgradeCallback,
  finishCallback = () => {},
}) {
  if (rowIds.length > 50) {
    alert(_l('单次最多打印 50 条'), 3);
    finishCallback();
    return;
  }

  const featureType = getFeatureStatus(projectId, VersionProductType.wordPrintTemplate);

  if (featureType === '2') {
    _.isFunction(mobileUpgradeCallback)
      ? mobileUpgradeCallback()
      : buriedUpgradeVersionDialog(projectId, VersionProductType.wordPrintTemplate);
    finishCallback();
    return;
  }

  worksheetAjax
    .sendCloudPrint({
      id,
      projectId,
      appId,
      worksheetId,
      rowIds,
    })
    .then(() => {
      alert(_l('打印推送成功'));
    })
    .finally(() => {
      finishCallback();
    });
}
