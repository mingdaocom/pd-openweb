import React, { Fragment, useEffect, useState } from 'react';
import { Popup } from 'antd-mobile';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import webCacheAjax from 'src/api/webCache';
import worksheetAjax from 'src/api/worksheet';
import { getPrintCardInfoOfTemplate } from 'worksheet/common/PrintQrBarCode/enum';
import { generatePdf } from 'worksheet/common/PrintQrBarCode/GeneratingPdf';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { PRINT_TEMP, PRINT_TYPE, PRINT_TYPE_STYLE } from 'src/pages/Print/config';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import { getCurrentProject } from 'src/utils/project';

// 获取授权功能需升级的版本
export function getVersion() {
  const featureId = VersionProductType.wordPrintTemplate;
  const { Versions = [] } = md.global || {};
  let upgradeName;

  const TYPE_NAME = { 1: _l('标准版'), 2: _l('专业版'), 3: _l('旗舰版') };
  const getFeatureType = versionIdV2 => {
    const versionInfo = _.find(Versions || [], item => item.VersionIdV2 === versionIdV2) || {};
    return {
      versionName: TYPE_NAME[versionIdV2],
      versionType: versionIdV2,
      type: (_.find(versionInfo.Products || [], item => item.ProductType === featureId) || {}).Type,
    };
  };

  let usableVersion = [getFeatureType('1'), getFeatureType('2'), getFeatureType('3')].filter(
    item => item.type === '1',
  )[0];

  upgradeName = usableVersion.versionName;

  return upgradeName;
}

const EntryWrap = styled.div``;

const PopupWrap = styled(Popup)`
  .adm-popup-body {
    max-height: 100%;
    display: flex;
    flex-direction: column;
  }
  .header {
    line-height: 24px;
    justify-content: space-between;
    padding: 15px 20px 10px;
    color: #9e9e9e;
  }
  .closeIcon {
    width: 24px;
    border-radius: 12px;
    background-color: #e6e6e6;
  }
  .printListContent {
    overflow-y: auto;
  }
  .printItem {
    height: 44px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    font-weight: 500;
  }
  .fileIcon {
    width: 20px;
    height: 20px;
  }

  .netStateWrap {
    padding-bottom: 20px;
    .hint {
      margin: 32px 24px 10px;
      text-align: center;
      font-size: 22px;
      font-weight: bold;
    }
    .explain {
      margin: 0 24px;
      max-width: 600px;
      font-size: 14px;
      text-align: center;
    }
  }
`;

export default function MobilePrintList(props) {
  const {
    projectId,
    appId,
    worksheetId,
    viewId,
    rowId,
    controls = [],
    switchPermit,
    hidePrintIcon,
    hideRecordActionVisible = () => {},
    updatePrintList = () => {},
  } = props;
  const [printList, setPrintList] = useState([]);
  const [showPrintListVisible, setShowPrintListVisible] = useState(false);
  const [showUpgradeVisible, setShowUpgradeVisible] = useState(false);
  let attriData = controls.filter(it => it.attribute === 1);
  const isExternal = _.isEmpty(getCurrentProject(projectId)); // 是否为

  const getPrintList = () => {
    worksheetAjax
      .getPrintList({
        worksheetId,
        viewId,
        rowIds: [rowId],
      })
      .then(tempList => {
        let list = !viewId ? tempList.filter(o => o.range === 1) : tempList;

        const systemPrintPermission = isOpenPermit(permitList.recordPrintSwitch, switchPermit, viewId);
        const tempPrintList = list
          .filter(v => [2, 5].includes(v.type))
          .filter(v => (systemPrintPermission ? true : v.type !== 0))
          .filter(l => !l.disabled)
          .sort(
            (a, b) =>
              PRINT_TEMP[_.findKey(PRINT_TYPE, l => l === a.type)] -
              PRINT_TEMP[_.findKey(PRINT_TYPE, l => l === b.type)],
          );

        setPrintList(tempPrintList);
        updatePrintList(tempPrintList);
      });
  };

  const handlePrint = async it => {
    const featureType = getFeatureStatus(projectId, VersionProductType.wordPrintTemplate);
    if (_.includes([3, 4], it.type)) {
      const data = await worksheetAjax.getRowDetail({
        appId,
        viewId,
        worksheetId,
        rowId,
        getTemplate: true,
      });
      generatePdf({
        templateId: it.id,
        appId,
        worksheetId,
        viewId,
        projectId,
        selectedRows: [safeParse(data.rowData)],
        controls: data.templateControls,
        zIndex: 99999,
      });
    } else {
      if (it.type !== 0 && featureType === '2') {
        setShowUpgradeVisible(true);
        return;
      }
      let printId = it.id;
      let isDefault = it.type === 0;
      let printData = {
        printId,
        isDefault, // 系统打印模板
        worksheetId,
        projectId: projectId,
        rowId,
        getType: 1,
        viewId,
        appId,
        name: it.name,
        attriData: attriData[0],
        fileTypeNum: it.type,
        allowDownloadPermission: it.allowDownloadPermission,
        allowEditAfterPrint: it.allowEditAfterPrint,
      };
      let printKey = Math.random().toString(36).substring(2);
      webCacheAjax.add({
        key: `${printKey}`,
        value: JSON.stringify(printData),
      });
      setShowPrintListVisible(false);
      window.open(`${md.global.Config.WebUrl}printForm/${appId}/worksheet/preview/print/${printKey}`);
    }
  };

  useEffect(() => {
    getPrintList();
  }, []);

  if (_.isEmpty(printList)) {
    return null;
  }

  return (
    <Fragment>
      <EntryWrap
        className="flexRow extraBtnItem"
        onClick={() => {
          setShowPrintListVisible(true);
          hideRecordActionVisible();
        }}
      >
        {!hidePrintIcon && <Icon className="icon icon-archive Font20 delIcon Gray_9e" />}
        <div className="flex Font15 Gray">{_l('打印/导出')}</div>
      </EntryWrap>

      <PopupWrap
        className="mobileModal topRadius"
        visible={showPrintListVisible}
        onClose={() => setShowPrintListVisible(false)}
        onMaskClick={() => setShowPrintListVisible(false)}
        style={{ '--z-index': 10005 }}
      >
        <div className="flexRow header">
          <span>{_l('打印/导出')}</span>
          <div className="closeIcon TxtCenter" onClick={() => setShowPrintListVisible(false)}>
            <Icon icon="icon icon-close" />
          </div>
        </div>
        <div className="pBottom12 printListContent">
          {printList.map(item => {
            let isCustom = [2, 5].includes(item.type);

            return (
              <div className="printItem flexRow" key={item.id} onClick={() => handlePrint(item)}>
                {isCustom ? (
                  <span className={`${PRINT_TYPE_STYLE[item.type].fileIcon} fileIcon`}></span>
                ) : (
                  <Icon icon={getPrintCardInfoOfTemplate(item).icon} className="Font20 Gray_9e" />
                )}

                <div className="flex mLeft20 Font15 ellipsis">{item.name}</div>
              </div>
            );
          })}
        </div>
      </PopupWrap>

      <PopupWrap
        className="mobileModal topRadius"
        bodyClassName="bodyClassName"
        visible={showUpgradeVisible}
        closeOnMaskClick
        onClose={() => setShowUpgradeVisible(false)}
        style={{ '--z-index': 10006 }}
      >
        <div className="flexRow header">
          <span className="flex"></span>
          <div className="closeIcon TxtCenter" onClick={() => setShowUpgradeVisible(false)}>
            <Icon icon="icon icon-close" />
          </div>
        </div>
        <div className="netStateWrap">
          <div className="imgWrap" />
          <div className="hint Gray_75">{_l('当前版本无法使用此功能')}</div>
          {!md.global.Config.IsLocal && !md.global.Account.isPortal && !isExternal && (
            <div className="explain Gray_75">{_l('请升级至%0解锁开启', getVersion())}</div>
          )}
        </div>
      </PopupWrap>
    </Fragment>
  );
}
