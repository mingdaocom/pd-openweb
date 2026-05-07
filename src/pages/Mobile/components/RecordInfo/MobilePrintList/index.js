import React, { Fragment, useEffect, useState } from 'react';
import { Popup } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import webCacheAjax from 'src/api/webCache';
import worksheetAjax from 'src/api/worksheet';
import { getPrintCardInfoOfTemplate } from 'worksheet/common/PrintQrBarCode/enum';
import { generatePdf } from 'worksheet/common/PrintQrBarCode/GeneratingPdf';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { PRINT_TEMP, PRINT_TYPE, PRINT_TYPE_STYLE } from 'src/pages/Print/core/config';
import { VersionProductType } from 'src/utils/enum';
import { compatibleMDJS, getCurrentProject, getFeatureStatus } from 'src/utils/project';
import { sendCloudPrint } from 'src/utils/record';

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
    color: var(--color-text-tertiary);
  }
  .closeIcon {
    width: 24px;
    border-radius: 12px;
    background-color: var(--color-border-secondary);
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
    &.disabledCloudPrint {
      .ming.Icon,
      > div {
        color: var(--color-text-disabled) !important;
      }
    }
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

const PrintTemplateWrap = styled.div`
  &.borderBottom {
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--color-border-secondary);
  }
`;

export default function MobilePrintList(props) {
  const {
    projectId,
    appId,
    worksheetId,
    viewId,
    rowId,
    instanceId,
    workId,
    rowIds,
    isBatchOperate, // 是否为批量操作
    controls = [],
    switchPermit,
    hidePrintIcon,
    hideRecordActionVisible = () => {},
    updatePrintList = () => {},
  } = props;
  const [printList, setPrintList] = useState([]);
  const [showPrintListVisible, setShowPrintListVisible] = useState(false);
  const [showUpgradeVisible, setShowUpgradeVisible] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [templateId, setTemplateId] = useState('');
  let attriData = controls.filter(it => it.attribute === 1);
  const isExternal = _.isEmpty(getCurrentProject(projectId)); // 是否为
  const printTypes = window.isMingDaoApp ? ['defaultPrint', 'codePrint', 'cloudPrint'] : ['defaultPrint', 'cloudPrint'];

  const getPrintList = () => {
    worksheetAjax
      .getPrintList({
        worksheetId,
        viewId,
        rowIds: rowIds ? rowIds : [rowId],
      })
      .then(tempList => {
        let list = !viewId ? tempList.filter(o => o.range === 1) : tempList;

        const systemPrintPermission =
          isOpenPermit(permitList.recordPrintSwitch, switchPermit, viewId) && !isBatchOperate;
        const tempPrintList = list
          .filter(v => (window.isMingDaoApp ? [2, 3, 4, 5, 6].includes(v.type) : [2, 5, 6].includes(v.type)))
          .filter(v => (systemPrintPermission ? true : v.type !== 0))
          .filter(l => !l.disabled)
          .sort(
            (a, b) =>
              PRINT_TEMP[_.findKey(PRINT_TYPE, l => l === a.type)] -
              PRINT_TEMP[_.findKey(PRINT_TYPE, l => l === b.type)],
          );

        setPrintList(tempPrintList);
        updatePrintList(tempPrintList);
      })
      .catch(() => {
        updatePrintList([]);
      });
  };

  // APP网页集成word模版打印\excel打印\二维码打印\条码打印 调用原生方法处理
  const handleAPPPrint = (it, printUrl) => {
    setShowPrintListVisible(false);

    // 单条打印全走APP原生逻辑
    // 批量打印条码、二维码走APP原生逻辑、Word/Excel 传printUrl

    compatibleMDJS('showPrintList', {
      type: instanceId || workId ? 'workflow' : 'row', // row/workflow
      projectId, // 网络ID
      appId, // 应用ID
      // row
      sheetId: worksheetId, // 工作表ID
      viewId: viewId, // 视图ID
      rowId: isBatchOperate ? rowIds.length && rowIds[0] : rowId, // 记录ID
      rowIds: isBatchOperate ? rowIds : undefined, // 批量打印
      // workflow
      workId,
      instanceId,

      templateId: it.id,
      printURL: printUrl,
    });
  };

  const handlePrint = async it => {
    const featureType = getFeatureStatus(projectId, VersionProductType.wordPrintTemplate);

    // APP网页集成word模版打印\excel打印\二维码打印\条码打印 调用原生方法处理
    if (
      window.isMingDaoApp &&
      ((!isBatchOperate && _.includes([2, 3, 4, 5], it.type)) || (isBatchOperate && _.includes([3, 4], it.type)))
    ) {
      if (_.includes([2, 5], it.type) && featureType === '2') {
        setShowUpgradeVisible(true);
        return;
      }

      handleAPPPrint(it);

      return;
    }

    if (isBatchOperate && rowIds.length > 50) {
      alert(_l('单次最多打印 50 条'), 3);
      return;
    }

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
    } else if (it.type === 6) {
      if (printLoading && templateId === it.id) {
        return;
      }

      setShowPrintListVisible(false);
      setPrintLoading(true);
      setTemplateId(it.id);
      sendCloudPrint({
        id: it.id,
        projectId,
        appId,
        worksheetId,
        rowIds: isBatchOperate ? rowIds : [rowId],
        mobileUpgradeCallback: () => setShowUpgradeVisible(true),
        finishCallback: () => {
          setPrintLoading(false);
          setTemplateId('');
        },
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
        rowId: isBatchOperate ? rowIds.join(',') : rowId,
        getType: 1,
        viewId,
        appId,
        name: it.name,
        isBatch: isBatchOperate,
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

      if (isBatchOperate && window.isMingDaoApp) {
        handleAPPPrint(
          it,
          `${location.origin}${window.subPath || ''}/printForm/${appId}/worksheet/preview/print/${printKey}`,
        );
        return;
      }

      window.open(`${window.subPath || ''}/printForm/${appId}/worksheet/preview/print/${printKey}`);
    }
  };

  useEffect(() => {
    getPrintList();
  }, []);

  if (_.isEmpty(printList)) {
    return null;
  }

  const renderPrintTemplate = templateType => {
    const defaultTempList = printList.filter(it =>
      [PRINT_TYPE.SYS_PRINT, PRINT_TYPE.WORD_PRINT, PRINT_TYPE.EXCEL_PRINT].includes(it.type),
    );
    const codeTempList = printList.filter(it =>
      [PRINT_TYPE.QR_CODE_PRINT, PRINT_TYPE.BAR_CODE_PRINT].includes(it.type),
    );
    const cloudTempList = printList.filter(it => it.type === PRINT_TYPE.CLOUD_PRINT);
    const list =
      templateType === 'defaultPrint' ? defaultTempList : templateType === 'codePrint' ? codeTempList : cloudTempList;

    if (list.length === 0) return null;

    return (
      <PrintTemplateWrap
        key={templateType}
        className={cx({
          borderBottom:
            (templateType === 'defaultPrint' && (!!codeTempList.length || !!cloudTempList.length)) ||
            (templateType === 'codePrint' && !!cloudTempList.length),
        })}
      >
        <div className="title textTertiary pLeft20">
          {templateType === 'defaultPrint'
            ? _l('记录打印')
            : templateType === 'codePrint'
              ? _l('条码打印')
              : _l('云打印')}
        </div>
        {list.map(item => {
          let isCustom = [2, 5].includes(item.type);

          return (
            <div
              className={cx('printItem flexRow', {
                disabledCloudPrint: printLoading && templateId === item.id && item.type === PRINT_TYPE.CLOUD_PRINT,
              })}
              key={item.id}
              onClick={() => handlePrint(item)}
            >
              {isCustom ? (
                <span className={`${PRINT_TYPE_STYLE[item.type].fileIcon} fileIcon`}></span>
              ) : _.includes([PRINT_TYPE.CLOUD_PRINT], item.type) ? (
                <Icon icon="cloud_printing" className="Font18 textTertiary" />
              ) : (
                <Icon icon={getPrintCardInfoOfTemplate(item).icon} className="Font20 textTertiary" />
              )}

              <div className="flex mLeft20 Font15 ellipsis">{item.name}</div>
            </div>
          );
        })}
      </PrintTemplateWrap>
    );
  };

  return (
    <Fragment>
      <EntryWrap
        className="flexRow extraBtnItem"
        onClick={() => {
          setShowPrintListVisible(true);
          hideRecordActionVisible();
        }}
      >
        {!hidePrintIcon && <Icon className="icon icon-archive Font20 delIcon textTertiary" />}
        <div className="flex Font15 textPrimary">{_l('打印/导出')}</div>
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
          {printTypes.map(templateType => renderPrintTemplate(templateType))}
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
          <div className="hint textSecondary">{_l('当前版本无法使用此功能')}</div>
          {!window.platformENV.isOverseas &&
            !window.platformENV.isLocal &&
            !md.global.Account.isPortal &&
            !isExternal && <div className="explain textSecondary">{_l('请升级至%0解锁开启', getVersion())}</div>}
        </div>
      </PopupWrap>
    </Fragment>
  );
}
