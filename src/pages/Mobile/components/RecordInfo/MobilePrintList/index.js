import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, PopupWrapper } from 'ming-ui';
import webCacheAjax from 'src/api/webCache';
import worksheetAjax from 'src/api/worksheet';
import { getPrintCardInfoOfTemplate } from 'worksheet/common/PrintQrBarCode/enum';
import { generatePdf } from 'worksheet/common/PrintQrBarCode/GeneratingPdf';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { PRINT_TEMP, PRINT_TYPE, PRINT_TYPE_STYLE } from 'src/pages/Print/core/config';
import { pathCompletion } from 'src/utils/common';
import { VersionProductType } from 'src/utils/enum';
import { compatibleMDJS, getCurrentProject, getFeatureStatus } from 'src/utils/project';
import { sendCloudPrint } from 'src/utils/record';
import { buildAppPrintParams, getPrintCacheAppDetail, getPrintCacheWorksheetInfo } from './utils';

const DEFAULT_TEMPLATE_TYPES = [PRINT_TYPE.SYS_PRINT, PRINT_TYPE.WORD_PRINT, PRINT_TYPE.EXCEL_PRINT];
const CODE_TEMPLATE_TYPES = [PRINT_TYPE.QR_CODE_PRINT, PRINT_TYPE.BAR_CODE_PRINT];
const APP_TEMPLATE_TYPES = [
  PRINT_TYPE.SYS_PRINT,
  PRINT_TYPE.WORD_PRINT,
  PRINT_TYPE.QR_CODE_PRINT,
  PRINT_TYPE.BAR_CODE_PRINT,
  PRINT_TYPE.EXCEL_PRINT,
  PRINT_TYPE.CLOUD_PRINT,
];

// SYS_PRINT/CLOUD_PRINT 全平台支持；QR/BAR_CODE 仅明道APP；WORD/EXCEL 在钉钉/微信/WeLink 不支持
const getAllowedPrintTypes = () => {
  if (window.isMingDaoApp) return APP_TEMPLATE_TYPES;
  const types = [PRINT_TYPE.SYS_PRINT, PRINT_TYPE.CLOUD_PRINT];

  if (!window.isDingTalk && !window.isWeiXin && !window.isWeLink) {
    types.push(PRINT_TYPE.WORD_PRINT, PRINT_TYPE.EXCEL_PRINT);
  }

  return types;
};

const MAX_SYSTEM_PRINT_COUNT = 50;

const noop = () => {};

const createPrintKey = async printData => {
  const printKey = Math.random().toString(36).substring(2);

  await webCacheAjax.add({
    key: `${printKey}`,
    value: JSON.stringify(printData),
    moduleType: 1,
  });

  return printKey;
};

const openPrintUrl = printUrl => {
  if (
    !window.isMingDaoApp &&
    (window.isSafari || window.isWxWork || window.isDingTalk || window.isWeLink || window.isFeiShu || window.isWeiXin)
  ) {
    window.location.href = printUrl;
    return;
  }

  window.open(printUrl);
};

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

const PrintPopupWrap = styled(PopupWrapper)`
  && {
    --z-index: 10005;
  }
  .popupContentBox {
    padding-bottom: 12px;
  }
`;

const UpgradePopupWrap = styled(PopupWrapper)`
  && {
    --z-index: 10006;
  }
`;

const PrintListContent = styled.div`
  overflow-y: auto;
  flex-shrink: 0;

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
`;

const UpgradeContent = styled.div`
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
    worksheetInfo,
    appDetail,
    getWorksheetShareUrl,
    hideRecordActionVisible = noop,
    updatePrintList = noop,
  } = props;

  const [printList, setPrintList] = useState([]);
  const [showPrintListVisible, setShowPrintListVisible] = useState(false);
  const [showUpgradeVisible, setShowUpgradeVisible] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const attriData = controls.filter(it => it.attribute === 1);
  const isExternal = _.isEmpty(getCurrentProject(projectId)); // 是否为
  const printTypes = window.isMingDaoApp ? ['defaultPrint', 'codePrint', 'cloudPrint'] : ['defaultPrint', 'cloudPrint'];
  const systemPrintPermission = isOpenPermit(permitList.recordPrintSwitch, switchPermit, viewId);
  const currentRowIds = useMemo(
    () => (isBatchOperate ? rowIds || [] : [rowId].filter(Boolean)),
    [isBatchOperate, rowId, rowIds],
  );
  const printCacheContext = useMemo(
    () => ({
      worksheetInfo: getPrintCacheWorksheetInfo(worksheetInfo, viewId),
      appDetail: getPrintCacheAppDetail(appDetail),
    }),
    [appDetail, viewId, worksheetInfo],
  );
  const updatePrintListRef = useRef(updatePrintList);

  const closePrintList = () => setShowPrintListVisible(false);

  const getPrintPreviewUrl = (printKey, printType = 'preview') =>
    pathCompletion(`/printForm/${appId}/${workId ? 'flow' : 'worksheet'}/${printType}/print/${printKey}`);

  const getTemplatePrintData = template => ({
    printId: template.id,
    isDefault: template.type === PRINT_TYPE.SYS_PRINT,
    worksheetId,
    projectId,
    rowId: isBatchOperate ? currentRowIds.join(',') : rowId,
    getType: 1,
    viewId,
    appId,
    name: template.name,
    isBatch: isBatchOperate,
    attriData: attriData[0],
    fileTypeNum: template.type,
    allowDownloadPermission: template.allowDownloadPermission,
    allowEditAfterPrint: template.allowEditAfterPrint,
    workId,
    instanceId,
    rowIds: currentRowIds,
    ...printCacheContext,
    printer: md.global.Account.fullname,
  });

  const getSystemPrintData = () => ({
    printId: '',
    isDefault: true,
    worksheetId,
    projectId,
    rowId: isBatchOperate ? currentRowIds.join(',') : rowId,
    getType: 1,
    viewId,
    appId,
    workId,
    instanceId,
    rowIds: currentRowIds,
    ...printCacheContext,
    printer: md.global.Account.fullname,
  });

  const getPrintAuthInfo = async printData => {
    const clientIdPromise = worksheetAjax.getSystemPrintClientId(
      { appId, worksheetId, printId: printData.printId },
      { silent: true },
    );
    const shareShortUrlsPromise =
      currentRowIds.length && viewId
        ? worksheetAjax
            .getRowsShortUrl({
              appId,
              viewId,
              worksheetId,
              rowIds: currentRowIds,
            })
            .catch(() => ({}))
        : Promise.resolve({});

    const shareUrlPromise = _.isFunction(getWorksheetShareUrl)
      ? getWorksheetShareUrl({ appId, worksheetId, rowId: currentRowIds[0], viewId })
      : Promise.resolve({});

    const [clientIdData, shareShortUrls, shareUrl] = await Promise.all([
      clientIdPromise,
      shareShortUrlsPromise,
      shareUrlPromise,
    ]);
    const clientId = _.isString(clientIdData)
      ? clientIdData
      : _.get(clientIdData, 'clientId') || _.get(clientIdData, 'data.clientId') || _.get(clientIdData, 'data');

    return {
      clientId,
      shareShortUrls,
      shareUrl,
    };
  };

  const openPrintPreview = async ({ printData, routeType = 'preview', template } = {}) => {
    const { clientId, shareShortUrls, shareUrl } = await getPrintAuthInfo(printData).catch(() => ({}));

    if (!clientId) {
      alert(_l('打印授权失败，请稍后重试'), 3);
      return;
    }

    let printKey;

    try {
      printKey = await createPrintKey({
        ...printData,
        clientId,
        shareShortUrls,
        shareUrl,
      });
    } catch {
      alert(_l('打印准备失败，请稍后重试'), 3);
      return;
    }

    const printUrl = getPrintPreviewUrl(printKey, routeType);

    closePrintList();

    if (isBatchOperate && window.isMingDaoApp && template) {
      handleAPPPrint(template, printUrl);
      return;
    }

    openPrintUrl(printUrl);
  };

  useEffect(() => {
    updatePrintListRef.current = updatePrintList;
  }, [updatePrintList]);

  useEffect(() => {
    worksheetAjax
      .getPrintList({
        worksheetId,
        viewId,
        rowIds: currentRowIds,
      })
      .then(tempList => {
        let list = !viewId ? tempList.filter(o => o.range === 1) : tempList;
        const allowedPrintTypes = getAllowedPrintTypes();
        const tempPrintList = list
          .filter(v => allowedPrintTypes.includes(v.type))
          .filter(l => !l.disabled)
          .sort(
            (a, b) =>
              PRINT_TEMP[_.findKey(PRINT_TYPE, l => l === a.type)] -
              PRINT_TEMP[_.findKey(PRINT_TYPE, l => l === b.type)],
          );

        setPrintList(tempPrintList);
        updatePrintListRef.current(tempPrintList);
      })
      .catch(() => {
        updatePrintListRef.current([]);
      });
  }, [currentRowIds, viewId, worksheetId]);

  const handleSystemPrint = () => {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }

    if (currentRowIds.length > MAX_SYSTEM_PRINT_COUNT) {
      alert(_l('单次最多打印 %0 条', MAX_SYSTEM_PRINT_COUNT), 3);
      return;
    }

    openPrintPreview({ printData: getSystemPrintData() });
  };

  // APP网页集成word模版打印\excel打印\二维码打印\条码打印 调用原生方法处理
  const handleAPPPrint = (it, printUrl) => {
    closePrintList();

    // 单条打印全走APP原生逻辑
    // 批量打印条码、二维码走APP原生逻辑、Word/Excel 传printUrl

    compatibleMDJS(
      'showPrintList',
      buildAppPrintParams({
        instanceId,
        workId,
        projectId,
        appId,
        worksheetId,
        viewId,
        rowId,
        currentRowIds,
        isBatchOperate,
        template: it,
        printUrl,
      }),
    );
  };

  const handlePrint = async it => {
    const featureType = getFeatureStatus(projectId, VersionProductType.wordPrintTemplate);

    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }

    // APP网页集成word模版打印\excel打印\二维码打印\条码打印 调用原生方法处理
    if (
      window.isMingDaoApp &&
      ((!isBatchOperate &&
        _.includes(
          [PRINT_TYPE.WORD_PRINT, PRINT_TYPE.QR_CODE_PRINT, PRINT_TYPE.BAR_CODE_PRINT, PRINT_TYPE.EXCEL_PRINT],
          it.type,
        )) ||
        (isBatchOperate && _.includes([PRINT_TYPE.QR_CODE_PRINT, PRINT_TYPE.BAR_CODE_PRINT], it.type)))
    ) {
      if (_.includes([PRINT_TYPE.WORD_PRINT, PRINT_TYPE.EXCEL_PRINT], it.type) && featureType === '2') {
        setShowUpgradeVisible(true);
        return;
      }

      handleAPPPrint(it);

      return;
    }

    if (isBatchOperate && currentRowIds.length > MAX_SYSTEM_PRINT_COUNT) {
      alert(_l('单次最多打印 %0 条', MAX_SYSTEM_PRINT_COUNT), 3);
      return;
    }

    if (_.includes(CODE_TEMPLATE_TYPES, it.type)) {
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
      return;
    }

    if (it.type === PRINT_TYPE.CLOUD_PRINT) {
      if (printLoading && templateId === it.id) {
        return;
      }

      closePrintList();
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
      return;
    }

    if (it.type !== PRINT_TYPE.SYS_PRINT && featureType === '2') {
      setShowUpgradeVisible(true);
      return;
    }

    openPrintPreview({
      printData: getTemplatePrintData(it),
      template: it,
    });
  };

  if (_.isEmpty(printList) && !systemPrintPermission) {
    return null;
  }

  const renderPrintTemplate = templateType => {
    const defaultTempList = printList.filter(it => DEFAULT_TEMPLATE_TYPES.includes(it.type));
    const codeTempList = printList.filter(it => CODE_TEMPLATE_TYPES.includes(it.type));
    const cloudTempList = printList.filter(it => it.type === PRINT_TYPE.CLOUD_PRINT);
    const list =
      templateType === 'defaultPrint' ? defaultTempList : templateType === 'codePrint' ? codeTempList : cloudTempList;
    const hasNextPrintGroup =
      (templateType === 'defaultPrint' && (!!codeTempList.length || !!cloudTempList.length)) ||
      (templateType === 'codePrint' && (!!cloudTempList.length || systemPrintPermission));

    if (list.length === 0) return null;

    return (
      <PrintTemplateWrap key={templateType} className={cx({ borderBottom: hasNextPrintGroup })}>
        <div className="title textTertiary pLeft20">
          {templateType === 'defaultPrint'
            ? _l('记录打印')
            : templateType === 'codePrint'
              ? _l('条码打印')
              : _l('云打印')}
        </div>
        {list.map(item => {
          const isCustom = [PRINT_TYPE.WORD_PRINT, PRINT_TYPE.EXCEL_PRINT].includes(item.type);

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
        <Icon className="icon icon-archive Font20 delIcon textTertiary" />
        <div className="flex Font15 textPrimary">{_l('打印/导出')}</div>
      </EntryWrap>

      <PrintPopupWrap
        bodyClassName="autoHeightPopupBody"
        headerType="withIcon"
        headerTitleAlign="left"
        title={_l('打印/导出')}
        visible={showPrintListVisible}
        onClose={() => setShowPrintListVisible(false)}
      >
        <PrintListContent>
          {printTypes.map(templateType => renderPrintTemplate(templateType))}
          {systemPrintPermission && (
            <PrintTemplateWrap>
              <div className="title textTertiary pLeft20">{_l('系统默认打印')}</div>
              <div className="printItem flexRow" onClick={handleSystemPrint}>
                <Icon icon="print" className="Font20 textTertiary" />
                <div className="flex mLeft20 Font15 ellipsis">{_l('系统打印')}</div>
              </div>
            </PrintTemplateWrap>
          )}
        </PrintListContent>
      </PrintPopupWrap>

      <UpgradePopupWrap
        headerType="withIcon"
        title=""
        visible={showUpgradeVisible}
        onClose={() => setShowUpgradeVisible(false)}
      >
        <UpgradeContent>
          <div className="imgWrap" />
          <div className="hint textSecondary">{_l('当前版本无法使用此功能')}</div>
          {!window.platformENV.isOverseas &&
            !window.platformENV.isLocal &&
            !md.global.Account.isPortal &&
            !isExternal && <div className="explain textSecondary">{_l('请升级至%0解锁开启', getVersion())}</div>}
        </UpgradeContent>
      </UpgradePopupWrap>
    </Fragment>
  );
}
