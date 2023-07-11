import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Icon, Menu, MenuItem } from 'ming-ui';
import { getPrintCardInfoOfTemplate } from 'worksheet/common/PrintQrBarCode/enum';
import worksheetAjax from 'src/api/worksheet';
import webCacheAjax from 'src/api/webCache';
import IconText from 'worksheet/components/IconText';
import { printQrBarCode, generatePdf } from 'worksheet/common/PrintQrBarCode';
import { getFeatureStatus, buriedUpgradeVersionDialog, addBehaviorLog } from 'src/util';
import _ from 'lodash';

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
  },
  {
    name: _l('打印条形码%02057'),
    printType: 3,
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
  const [menuVisible, setMenuVisible] = useState(false);
  const [templateList, setTemplateList] = useState(props.templateList || []);
  const featureType = getFeatureStatus(projectId, 20);
  function loadPrintList() {
    worksheetAjax
      .getPrintList({
        worksheetId,
        viewId,
      })
      .then(data => {
        setTemplateList(data.filter(d => d.type >= 2).sort((a, b) => a.type - b.type));
      });
  }
  useEffect(() => {
    setTemplateList(props.templateList);
  }, [props.templateList]);
  useEffect(() => {
    if (!props.templateList) {
      loadPrintList();
    }
  }, []);
  function handlePrintQrCode({ id, printType = 1 } = {}) {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    const isMDClient = window.navigator.userAgent.indexOf('MDClient') > -1;
    const disablePrint =
      window.navigator.userAgent.indexOf('Chrome') < 0 &&
      navigator.userAgent.indexOf('Firefox') < 0 &&
      navigator.userAgent.indexOf('Safari') < 0;
    if (isMDClient) {
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
          <TemplateList>
            {!!featureType &&
              templateList.map((template, i) => (
                <MenuItem
                  key={i}
                  icon={<Icon icon={getPrintCardInfoOfTemplate(template).icon} className="Font18" />}
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
                        buriedUpgradeVersionDialog(projectId, 20);
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
              <MenuItem key={i} className="noIcon" onClick={() => handlePrintQrCode({ printType: item.printType })}>
                {item.name}
              </MenuItem>
            ))}
        </Menu>
      )}
    </Con>
  );
}
