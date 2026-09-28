import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import webCacheAjax from 'src/api/webCache';
import worksheetAjax from 'src/api/worksheet';
import { sendCloudPrint } from 'src/components/print/sendCloudPrint';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { PRINT_TYPE } from 'src/pages/Print/core/config';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { addBehaviorLog, getFeatureStatus } from 'src/utils/services/project';

export async function handleSystemPrintRecord({
  worksheetId,
  viewId,
  recordId,
  appId,
  projectId,
  getType,
  workId,
  instanceId,
  rowIds,
  printId = '',
  clientId,
  shareShortUrls,
  shareUrl,
  appDetail,
  worksheetInfo,
  customWin,
}) {
  const printData = {
    printId,
    isDefault: true,
    worksheetId,
    projectId,
    rowId: recordId,
    getType: _.isUndefined(getType) ? 1 : getType,
    viewId,
    appId,
    workId,
    instanceId,
    rowIds,
    appDetail,
    worksheetInfo,
    clientId,
    shareShortUrls,
    shareUrl,
    printer: md.global.Account.fullname,
  };
  const printKey = uuidv4();

  try {
    await webCacheAjax.add({
      key: printKey,
      value: JSON.stringify(printData),
      moduleType: 1,
    });
  } catch {
    return;
  }

  const printViewUrl = pathCompletion(`/printForm/${appId}/${workId ? 'flow' : 'worksheet'}/new/print/${printKey}`);

  if (browserIsMobile()) {
    (customWin || window).location.href = printViewUrl;
  } else {
    window.open(printViewUrl);
  }
}

export async function precheckTemplatePrint({ projectId, worksheetId, printId, rowIds }) {
  if (getFeatureStatus(projectId, VersionProductType.printCountLimit) === '2') {
    return true;
  }

  try {
    const { failedRows } = await worksheetAjax.precheckPrint({
      projectId,
      worksheetId,
      printId,
      rowIds,
    });

    if (failedRows.length) {
      alert(_l('当前模板已达到打印上限'), 2);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function handleTemplateRecordPrint({
  worksheetId,
  viewId,
  recordId,
  appId,
  projectId,
  template,
  attriData,
  workId,
  instanceId,
  customWin,
  rowIds,
  clientId,
  shareShortUrls,
  shareUrl,
  appDetail,
  worksheetInfo,
  openGeneratePdf,
  disabledCloudPrint = false,
  updatePrintStatus = () => {},
}) {
  const featureType = getFeatureStatus(projectId, VersionProductType.wordPrintTemplate);

  if ([PRINT_TYPE.QR_CODE_PRINT, PRINT_TYPE.BAR_CODE_PRINT].includes(template.type)) {
    const logType = template.type === PRINT_TYPE.QR_CODE_PRINT ? 'printQRCode' : 'printBarCode';
    addBehaviorLog(logType, worksheetId, { printId: template.id, rowId: recordId, msg: [1] });

    const data = await worksheetAjax.getRowDetail({
      appId,
      viewId,
      worksheetId,
      rowId: recordId,
      getTemplate: true,
    });
    openGeneratePdf({
      templateId: template.id,
      appId,
      worksheetId,
      viewId,
      projectId,
      selectedRows: [safeParse(data.rowData)],
      controls: data.templateControls,
      zIndex: 9999,
    });
    return;
  }

  if (template.type === PRINT_TYPE.CLOUD_PRINT) {
    if (disabledCloudPrint) {
      return;
    }

    updatePrintStatus({ templateId: template.id, printLoading: true, showPrintGroup: false });
    sendCloudPrint({
      id: template.id,
      projectId,
      appId,
      worksheetId,
      rowIds: [recordId],
      finishCallback: () => updatePrintStatus({ templateId: '', printLoading: false }),
    });
    return;
  }

  if (template.type !== PRINT_TYPE.SYS_PRINT && featureType === '2') {
    buriedUpgradeVersionDialog(projectId, VersionProductType.wordPrintTemplate);
    return;
  }

  const printData = {
    printId: template.id,
    isDefault: template.type === PRINT_TYPE.SYS_PRINT,
    worksheetId,
    projectId,
    getType: 1,
    viewId,
    appId,
    name: template.name,
    attriData: attriData?.[0],
    fileTypeNum: template.type,
    allowDownloadPermission: template.allowDownloadPermission,
    allowEditAfterPrint: template.allowEditAfterPrint,
    workId,
    instanceId,
    rowIds: rowIds || [recordId],
    clientId,
    shareShortUrls,
    shareUrl,
    appDetail,
    worksheetInfo,
    printer: md.global.Account.fullname,
  };
  const printKey = uuidv4();

  try {
    await webCacheAjax.add({
      key: printKey,
      value: JSON.stringify(printData),
      moduleType: 1,
    });
  } catch {
    return;
  }

  const printViewUrl = pathCompletion(`/printForm/${appId}/worksheet/preview/print/${printKey}`);

  if (browserIsMobile()) {
    (customWin || window).location.href = printViewUrl;
  } else {
    window.open(printViewUrl);
  }
}
