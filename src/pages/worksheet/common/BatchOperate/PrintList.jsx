import React, { Fragment, useEffect, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, Menu, MenuItem } from 'ming-ui';
import webCacheAjax from 'src/api/webCache';
import worksheetAjax from 'src/api/worksheet';
import { printQrBarCode } from 'worksheet/common/PrintQrBarCode';
import { getPrintCardInfoOfTemplate } from 'worksheet/common/PrintQrBarCode/enum';
import IconText from 'worksheet/components/IconText';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { PRINT_TEMP, PRINT_TYPE, PRINT_TYPE_STYLE } from 'src/pages/Print/config';
import { VersionProductType } from 'src/utils/enum';
import { addBehaviorLog, getFeatureStatus } from 'src/utils/project';
import { generatePdf } from '../PrintQrBarCode/GeneratingPdf';

const Con = styled.div`
  position: relative;
  .ming.printMenu {
    width: 280px;
    margin-top: 4px;
    .split {
      color: #999;
      font-size: 12px;
      margin: 12px 16px 6px;
    }
    .empty {
      margin: 20px;
      text-align: center;
    }
    .detail {
      position: absolute;
      right: 16px;
      color: #9e9e9e;
      font-size: 12px;
    }
    hr {
      border: none;
      border-top: 1px solid #eaeaea;
    }
    .ming.Item .Item-content .templateName {
      display: inline-block;
      max-width: 142px;
    }
    .ming.Item .Item-content .Icon {
      left: 16px;
    }
    .ming.Item .Item-content .fileIcon {
      width: 13px;
      height: 15px;
      position: absolute;
      margin-top: 10px;
      left: 16px;
    }
    .Item.noIcon .Item-content {
      padding-left: 16px !important;
    }
    &.ming .Item .Item-content {
      padding-left: 44px;
    }
    &.ming .Item .Item-content:hover .detail {
      color: #fff;
    }
  }
`;

const TemplateList = styled.div`
  max-height: 360px;
  overflow-x: hidden;
  overflow-y: auto;
`;

const codePrintList = [
  {
    name: _l('打印二维码%02056'),
    printType: 1,
    key: 'qrCode',
  },
  {
    name: _l('打印条形码%02057'),
    printType: 3,
    key: 'barCode',
  },
];

export default function PrintList(props) {
  const {
    isCharge,
    showCodePrint,
    appId,
    projectId,
    worksheetId,
    viewId,
    controls,
    selectedRows,
    selectedRowIds,
    allowLoadMore,
    count,
    filterControls,
    fastFilters,
    navGroupFilters,
  } = props;
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [templateList, setTemplateList] = useState(props.templateList || []);
  const featureType = getFeatureStatus(projectId, VersionProductType.wordPrintTemplate);

  function loadPrintList() {
    setLoading(true);
    worksheetAjax
      .getPrintList({
        worksheetId,
        viewId,
        rowIds: selectedRowIds,
      })
      .then(data => {
        setLoading(false);
        setTemplateList(
          allowLoadMore
            ? data
                .filter(d => d.type > 2 && d.type !== 5 && !d.disabled)
                .sort(
                  (a, b) =>
                    PRINT_TEMP[_.findKey(PRINT_TYPE, l => l === a.type)] -
                    PRINT_TEMP[_.findKey(PRINT_TYPE, l => l === b.type)],
                )
            : data
                .filter(d => d.type >= 2 && !d.disabled)
                .sort((a, b) => {
                  return (
                    PRINT_TEMP[_.findKey(PRINT_TYPE, l => l === a.type)] -
                    PRINT_TEMP[_.findKey(PRINT_TYPE, l => l === b.type)]
                  );
                }),
        );
      });
  }
  useEffect(() => {
    props.templateList && setTemplateList(props.templateList);
  }, [props.templateList]);
  useEffect(() => {
    if (menuVisible && !props.templateList) {
      loadPrintList();
    }
  }, [menuVisible]);
  function handlePrintQrCode({ id, printType = 1 } = {}) {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    const disablePrint = !window.isChrome && !window.isFirefox && !window.isSafari;
    if (window.isMDClient) {
      alert('客户端不支持此功能，请使用Chrome、Firefox或其他国产浏览器', 3);
      return;
    }
    if (disablePrint) {
      alert('当前浏览器不支持此功能，请使用Chrome、Firefox或其他国产浏览器', 3);
      return;
    }
    if (id) {
      generatePdf({
        templateId: id,
        appId,
        worksheetId,
        viewId,
        projectId,
        selectedRows,
        controls,
        count,
        allowLoadMore,
        filterControls,
        fastFilters,
        navGroupFilters,
      });
    } else {
      printQrBarCode({
        isCharge,
        printType,
        appId,
        viewId,
        worksheetId,
        projectId,
        worksheetName: name,
        controls,
        selectedRows,
        count,
        allowLoadMore,
        filterControls,
        fastFilters,
        navGroupFilters,
        onClose: () => {
          if (!props.templateList) {
            loadPrintList();
          }
        },
      });
    }
  }

  return (
    <Con>
      <IconText
        dataEvent="print"
        icon="print"
        textCmp={() => {
          return (
            <Fragment>
              {_l('打印')}
              <Icon icon="arrow-down-border" className="printDownIcon" />
            </Fragment>
          );
        }}
        onClick={() => setMenuVisible(true)}
      />
      {menuVisible && (
        <Menu
          className="printMenu"
          onClickAwayExceptions={['.doNotTriggerClickAway']}
          onClickAway={() => setMenuVisible(false)}
        >
          <TemplateList className="tempList">
            {loading && <LoadDiv size="small" />}
            {!loading && !!featureType && templateList.length === 0 && !showCodePrint && (
              <div className="Gray_bd Font13 LineHeight36 pLeft16">{_l('暂无可用模版')}</div>
            )}
            {!loading &&
              !!featureType &&
              templateList.map((template, i) => (
                <MenuItem
                  data-event={`printTemp-${i}`}
                  key={i}
                  icon={
                    [2, 5].includes(template.type) ? (
                      <span className={`${PRINT_TYPE_STYLE[template.type].fileIcon} fileIcon`}></span>
                    ) : (
                      <Icon icon={getPrintCardInfoOfTemplate(template).icon} className="Font18" />
                    )
                  }
                  onClick={() => {
                    if (_.includes([3, 4], template.type)) {
                      const logType = template.type === 3 ? 'printQRCode' : 'printBarCode';
                      addBehaviorLog(logType, worksheetId, {
                        printId: template.id,
                        msg: [allowLoadMore ? count : selectedRows.length],
                      }); // 埋点
                      handlePrintQrCode({ id: template.id, printType: template.type === 3 ? 1 : 3 });
                    } else {
                      if (featureType === '2') {
                        buriedUpgradeVersionDialog(projectId, VersionProductType.wordPrintTemplate);
                        return;
                      }
                      let printId = template.id;
                      let printData = {
                        printId,
                        isDefault: false, // word模板
                        worksheetId,
                        projectId,
                        rowId: selectedRowIds.join(','),
                        getType: 1,
                        viewId,
                        appId,
                        name: template.name,
                        isBatch: true,
                        fileTypeNum: template.type,
                        allowDownloadPermission: template.allowDownloadPermission,
                        allowEditAfterPrint: template.allowEditAfterPrint,
                      };
                      let printKey = Math.random().toString(36).substring(2);
                      webCacheAjax.add({
                        key: `${printKey}`,
                        value: JSON.stringify(printData),
                      });
                      window.open(`${window.subPath || ''}/printForm/${appId}/worksheet/preview/print/${printKey}`);
                      setMenuVisible(false);
                    }
                  }}
                >
                  <span className="templateName ellipsis">{template.name || template.formName || _l('未命名')}</span>
                  {_.includes([3, 4], template.type) && (
                    <span className="detail">{getPrintCardInfoOfTemplate(template).text}</span>
                  )}
                </MenuItem>
              ))}
          </TemplateList>
          {!!showCodePrint && !!templateList.length && (
            <Fragment>
              <hr />
              <div className="split">{_l('系统默认打印')}</div>
            </Fragment>
          )}
          {!!showCodePrint &&
            codePrintList.map((item, i) => (
              <MenuItem
                data-event={item.key}
                key={i}
                className="noIcon"
                onClick={() => handlePrintQrCode({ printType: item.printType })}
              >
                {item.name}
              </MenuItem>
            ))}
        </Menu>
      )}
    </Con>
  );
}
