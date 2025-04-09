import React, { Fragment, useEffect, useState } from 'react';
import { Icon, MenuItem } from 'ming-ui';
import webCacheAjax from 'src/api/webCache';
import _ from 'lodash';
import { getFeatureStatus } from 'src/util';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/util/enum';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import sheetAjax from 'src/api/worksheet';

const MenuBox = styled.div`
  max-width: 280px;
  padding: 5px 0;
  border-radius: 3px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.13), 0 2px 6px rgba(0, 0, 0, 0.1);
  max-height: 500px;
  overflow-y: scroll;
  .icon-new_word {
    color: #2196f3 !important;
  }
  .icon-new_excel {
    color: #4caf50 !important;
  }
  .icon-doc {
    color: #465a65 !important;
  }
  .actionText {
    margin-left: 20px;
  }
  .printListLine {
    width: 100%;
    height: 1px;
    background: #e0e0e0;
    margin: 5px 0;
  }
  .Item-content:hover {
    .icon {
      color: #fff !important;
    }
  }
`;

/**
 * 系统打印
 */
const systemPrint = props => {
  const { projectId, id, workId, data, worksheetId, onClose } = props;
  const printData = {
    printId: '',
    isDefault: true, // 系统打印模板
    worksheetId,
    projectId,
    id,
    rowId: '',
    getType: 1,
    viewId: '',
    appId: data.app.id,
    workId,
  };
  const printKey = Math.random().toString(36).substring(2);

  webCacheAjax.add({
    key: `${printKey}`,
    value: JSON.stringify(printData),
  });

  window.open(`${window.subPath || ''}/printForm/${data.app.id}/flow/new/print/${printKey}`);

  onClose();
};

/**
 * 模板打印
 */
const templatePrint = (props, item) => {
  const { projectId, data, worksheetId, onClose } = props;
  const featureType = getFeatureStatus(projectId, VersionProductType.wordPrintTemplate);

  if (item.describe !== '0' && featureType === '2') {
    buriedUpgradeVersionDialog(projectId, VersionProductType.wordPrintTemplate);
    return;
  }

  const printData = {
    printId: item.id,
    isDefault: item.describe === '0', // 系统打印模板
    worksheetId,
    projectId,
    rowId: props.rowId,
    getType: 1,
    viewId: props.viewId,
    appId: data.app.id,
    name: item.name,
    fileTypeNum: parseInt(item.describe),
    allowDownloadPermission: parseInt(item.entityName),
    allowEditAfterPrint: item.allowEditAfterPrint,
  };
  const printKey = Math.random().toString(36).substring(2);

  webCacheAjax.add({
    key: `${printKey}`,
    value: JSON.stringify(printData),
  });

  window.open(`${window.subPath || ''}/printForm/${data.app.id}/worksheet/preview/print/${printKey}`);

  onClose();
};

export default props => {
  const { data } = props;
  const { disabledPrint } = data;
  const [printList, setPrintList] = useState([]);

  useEffect(() => {
    if (data.printList.length) {
      sheetAjax
        .getPrintList({
          worksheetId: props.worksheetId,
          rowIds: [props.rowId],
        })
        .then(result => {
          setPrintList(
            data.printList.filter(o => {
              const it = result.find(item => item.id === o.id && !item.disabled);
              o.allowEditAfterPrint = _.get(it, 'allowEditAfterPrint');
              return !!it;
            }),
          );
        });
    }
  }, []);

  if (disabledPrint && !printList.length) {
    return null;
  }

  // 仅系统打印 || 仅一个模板打印
  if ((!disabledPrint && !printList.length) || (disabledPrint && printList.length === 1)) {
    return (
      <MenuItem
        onClick={() => (!disabledPrint && !printList.length ? systemPrint(props) : templatePrint(props, printList[0]))}
      >
        <Icon icon="print" />
        <span className="actionText">{_l('打印')}</span>
      </MenuItem>
    );
  }

  return (
    <Trigger
      popupClassName="workflowExecPrintTrigger"
      action={['hover']}
      mouseEnterDelay={0.1}
      popupAlign={{ points: ['br', 'tr'], offset: [-180, 41], overflow: { adjustX: 1, adjustY: 2 } }}
      popup={
        <MenuBox>
          {printList.map(o => (
            <MenuItem key={o.id} onClick={() => templatePrint(props, o)}>
              <Icon icon={o.describe === '2' ? 'new_word' : o.describe === '5' ? 'new_excel' : 'doc'} />
              <span className="actionText">{o.name}</span>
            </MenuItem>
          ))}
          {!!printList.length && !disabledPrint && <div className="printListLine" />}
          {!disabledPrint && (
            <Fragment>
              <div className="mBottom5 mTop10 mLeft16 Gray_9 Font12">{_l('系统默认打印')}</div>
              <MenuItem onClick={() => systemPrint(props)}>{_l('打印记录')}</MenuItem>
            </Fragment>
          )}
        </MenuBox>
      }
    >
      <MenuItem>
        <Icon icon="print" />
        <span className="actionText">{_l('打印')}</span>
        <Icon icon="arrow-right-tip" style={{ position: 'absolute', right: 10, left: 'initial' }} />
      </MenuItem>
    </Trigger>
  );
};
