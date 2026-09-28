import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Icon } from 'ming-ui';
import webCacheAjax from 'src/api/webCache';
import sheetAjax from 'src/api/worksheet';
import { handleSystemPrintRecord } from 'worksheet/common/recordInfo/RecordForm/RecordPrint/recordPrintActions';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { getFeatureStatus } from 'src/utils/services/project';
import './index.less';

const EMPTY_PRINT_LIST = [];

/**
 * 系统打印
 */
const systemPrint = props => {
  const { projectId, instanceId, rowId, workId, data, worksheetId, onClose } = props;
  const appId = data.app.id;
  handleSystemPrintRecord({
    printId: '',
    isDefault: true, // 系统打印模板
    worksheetId,
    projectId,
    recordId: rowId,
    rowIds: [rowId],
    getType: 9,
    appId,
    instanceId,
    workId,
  });

  onClose();
};

/**
 * 模板打印
 */
const templatePrint = async (props, item) => {
  const { projectId, data, worksheetId, rowId, viewId, attriData, onClose } = props;
  const { id, name, describe, entityName, allowEditAfterPrint } = item;
  const featureType = getFeatureStatus(projectId, VersionProductType.wordPrintTemplate);

  if (describe !== '0' && featureType === '2') {
    buriedUpgradeVersionDialog(projectId, VersionProductType.wordPrintTemplate);
    return;
  }

  const printData = {
    printId: id,
    isDefault: describe === '0', // 系统打印模板
    worksheetId,
    projectId,
    rowIds: [rowId],
    getType: 1,
    viewId: viewId,
    appId: data.app.id,
    name,
    attriData,
    fileTypeNum: parseInt(describe),
    allowDownloadPermission: parseInt(entityName),
    allowEditAfterPrint: allowEditAfterPrint,
  };
  const printKey = uuidv4();

  try {
    await webCacheAjax.add({
      key: `${printKey}`,
      value: JSON.stringify(printData),
      moduleType: 1,
    });
  } catch {
    return;
  }

  window.open(pathCompletion(`/printForm/${data.app.id}/worksheet/preview/print/${printKey}`));

  onClose();
};

export const getPrintMenuItem = (props, printList) => {
  const { data, systemPrintEnabled } = props;
  const { disabledPrint } = data;
  const canSystemPrint = systemPrintEnabled && !disabledPrint;

  if (!canSystemPrint && !printList.length) {
    return null;
  }

  const printMenuItem = {
    key: 'print',
    icon: <Icon icon="print" />,
    label: _l('打印'),
  };

  // 仅系统打印时直接打印；存在模板时始终保留模板菜单
  if (canSystemPrint && !printList.length) {
    return {
      ...printMenuItem,
      onClick: () => systemPrint(props),
    };
  }

  const children = printList.map(o => ({
    key: o.id,
    icon: (
      <Icon
        icon={o.describe === '2' ? 'new_word' : o.describe === '5' ? 'new_excel' : 'doc'}
        className={o.describe === '2' ? 'colorPrimary' : o.describe === '5' ? 'Green' : 'textSecondary'}
      />
    ),
    label: o.name,
    onClick: () => templatePrint(props, o),
  }));

  if (canSystemPrint) {
    children.push(
      { key: 'divider', type: 'divider' },
      {
        key: 'system',
        type: 'group',
        label: _l('系统默认打印'),
        children: [{ key: 'system-print', label: _l('打印记录'), onClick: () => systemPrint(props) }],
      },
    );
  }

  return {
    ...printMenuItem,
    popupClassName: 'workflowExecPrintMenu',
    children,
  };
};

export default props => {
  const { children, data } = props;
  const sourcePrintList = data.printList || EMPTY_PRINT_LIST;
  const printListIds = sourcePrintList.map(item => item.id).join(',');
  // 工作表开关只控制系统默认打印，不能阻止审批节点配置的打印模板加载
  const requestKey = printListIds ? `${props.worksheetId}-${props.rowId || ''}-${printListIds}` : '';
  const [printListState, setPrintListState] = useState({ requestKey: '', items: [] });
  const printList = printListState.requestKey === requestKey ? printListState.items : [];

  useEffect(() => {
    if (!requestKey) return;

    let cancelled = false;

    sheetAjax
      .getPrintList({
        worksheetId: props.worksheetId,
        rowIds: [props.rowId].filter(Boolean),
      })
      .then(result => {
        if (cancelled) return;

        setPrintListState({
          requestKey,
          items: sourcePrintList
            .map(item => {
              const printItem = result.find(resultItem => resultItem.id === item.id && !resultItem.disabled);

              return printItem ? { ...item, allowEditAfterPrint: _.get(printItem, 'allowEditAfterPrint') } : null;
            })
            .filter(Boolean),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [props.rowId, props.worksheetId, requestKey, sourcePrintList]);

  return children(getPrintMenuItem(props, printList));
};
