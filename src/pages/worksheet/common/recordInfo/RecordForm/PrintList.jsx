import React, { Fragment } from 'react';
import { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, MenuItem, Tooltip } from 'ming-ui';
import webCacheAjax from 'src/api/webCache';
import worksheetAjax from 'src/api/worksheet';
import { getPrintCardInfoOfTemplate } from 'worksheet/common/PrintQrBarCode/enum';
import { generatePdf } from 'worksheet/common/PrintQrBarCode/GeneratingPdf';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { PRINT_TEMP, PRINT_TYPE, PRINT_TYPE_STYLE } from 'src/pages/Print/config';
import { getDownLoadUrl } from 'src/pages/Print/util';
import { VersionProductType } from 'src/utils/enum';
import { addBehaviorLog, getFeatureStatus } from 'src/utils/project';
import IconBtn from './IconBtn';

const MenuItemWrap = styled(MenuItem)`
  &.printItem.Item {
    .Item-content {
      padding-left: 32px;
    }
  }
  &.lightBg.ming.MenuItem {
    .Item-content {
      .detail {
        top: 4px !important;
        .downloadIcon {
          width: 28px;
          height: 28px;
          border-radius: 3px;
          display: inline-block;
          text-align: center;
          line-height: 28px;
        }
      }
    }
  }
`;

const SecTitle = styled.div`
  color: #999;
  font-size: 12px;
  margin: 12px 16px 4px;
`;

export function handleSystemPrintRecord({ worksheetId, viewId, recordId, appId, projectId, workId, instanceId }) {
  let printData = {
    printId: '',
    isDefault: true, // 系统打印模板
    worksheetId,
    projectId: projectId,
    rowId: recordId,
    getType: 1,
    viewId,
    appId,
    workId,
    id: instanceId,
  };
  let printKey = Math.random().toString(36).substring(2);
  webCacheAjax.add({
    key: `${printKey}`,
    value: JSON.stringify(printData),
  });
  window.open(`${window.subPath || ''}/printForm/${appId}/${workId ? 'flow' : 'worksheet'}/new/print/${printKey}`);
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
}) {
  const it = template;

  const featureType = getFeatureStatus(projectId, VersionProductType.wordPrintTemplate);
  if (_.includes([3, 4], it.type)) {
    const data = await worksheetAjax.getRowDetail({
      appId,
      viewId,
      worksheetId,
      rowId: recordId,
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
      zIndex: 9999,
    });
  } else {
    if (it.type !== 0 && featureType === '2') {
      buriedUpgradeVersionDialog(projectId, VersionProductType.wordPrintTemplate);
      return;
    }
    let printId = it.id;
    let isDefault = it.type === 0;
    let printData = {
      printId,
      isDefault, // 系统打印模板
      worksheetId,
      projectId: projectId,
      rowId: recordId,
      getType: 1,
      viewId,
      appId,
      name: it.name,
      attriData: attriData[0],
      fileTypeNum: it.type,
      allowDownloadPermission: it.allowDownloadPermission,
      allowEditAfterPrint: it.allowEditAfterPrint,
      workId,
      id: instanceId,
    };
    let printKey = Math.random().toString(36).substring(2);
    webCacheAjax.add({
      key: `${printKey}`,
      value: JSON.stringify(printData),
    });
    window.open(`${window.subPath || ''}/printForm/${appId}/worksheet/preview/print/${printKey}`);
  }
}

export default class PrintList extends Component {
  static propTypes = {
    isCharge: PropTypes.bool,
    type: PropTypes.string, // 显示样式 0 显示在menuItem中 1 显示为按钮 2 只显示系统打印
    viewId: PropTypes.string,
    recordId: PropTypes.string,
    appId: PropTypes.string,
    worksheetId: PropTypes.string,
    workId: PropTypes.string,
    instanceId: PropTypes.string,
    controls: PropTypes.arrayOf(PropTypes.shape({})),
    projectId: PropTypes.string,
    sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
    onItemClick: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      showPrintGroup: false,
      tempList: [],
    };
  }

  componentDidMount() {
    this.getData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.worksheetId !== prevProps.worksheetId || this.props.recordId !== prevProps.recordId) {
      this.getData();
    }
  }

  getData = () => {
    const { viewId, worksheetId, recordId } = this.props;

    if (worksheetId) {
      worksheetAjax
        .getPrintList({
          worksheetId,
          viewId,
          rowIds: [recordId].filter(Boolean),
        })
        .then(tempList => {
          let list = !viewId ? tempList.filter(o => o.range === 1) : tempList;

          this.setState({
            tempList: list
              .filter(l => !l.disabled)
              .sort(
                (a, b) =>
                  PRINT_TEMP[_.findKey(PRINT_TYPE, l => l === a.type)] -
                  PRINT_TEMP[_.findKey(PRINT_TYPE, l => l === b.type)],
              ),
            tempListLoaded: true,
          });
        });
    }
  };

  getDownload = (item, e) => {
    const { worksheetId, projectId, viewId, appId, recordId } = this.props;
    const { type, id } = item;
    // 系统打印
    if (type === 0) return;

    e.stopPropagation();
    addBehaviorLog('printWord', worksheetId, { printId: id, rowId: recordId });
    getDownLoadUrl(
      md.global.Config.WorksheetDownUrl,
      {
        worksheetId,
        rowId: recordId,
        printId: id,
        projectId,
        appId,
        viewId,
        fileTypeNum: type,
        download: 1,
      },
      link => {
        link !== 'error' && window.open(link);
      },
    );
  };

  menuPrint() {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    const { viewId, recordId, appId, worksheetId, projectId, workId, instanceId } = this.props;
    this.setState({ showPrintGroup: false }, () => {
      handleSystemPrintRecord({
        worksheetId,
        viewId,
        recordId,
        appId,
        projectId,
        workId,
        instanceId,
      });
    });
  }

  render() {
    const {
      isCharge,
      viewId,
      recordId,
      appId,
      worksheetId,
      controls,
      projectId,
      sheetSwitchPermit,
      type = 0,
      showDownload = true,
      onItemClick = () => {},
      workId,
      instanceId,
    } = this.props;
    const { tempList, showPrintGroup } = this.state;
    let attriData = controls.filter(it => it.attribute === 1);

    if (tempList.length <= 0 || type === 2) {
      return isOpenPermit(permitList.recordPrintSwitch, sheetSwitchPermit, viewId) && type !== 1 ? (
        <MenuItemWrap
          data-event="print"
          className={cx('printItem', { hover: showPrintGroup })}
          icon={<Icon icon="print" className="Font17 mLeft5" />}
          onClick={() => {
            onItemClick();
            this.menuPrint();
          }}
        >
          <span className="mLeft15">{_l('系统打印')}</span>
        </MenuItemWrap>
      ) : (
        ''
      );
    } else {
      return (
        <Trigger
          popupVisible={showPrintGroup}
          onPopupVisibleChange={showPrintGroup => {
            this.setState({ showPrintGroup }, () => {
              type === 1 && showPrintGroup && this.getData();
            });
          }}
          popupClassName="DropdownPrintTrigger"
          action={[type === 1 ? 'click' : 'hover']}
          mouseEnterDelay={0.1}
          popupAlign={{
            points: type === 1 ? ['br', 'tr'] : ['tl', 'tr'],
            offset: [1, -5],
            overflow: { adjustX: 1, adjustY: 2 },
          }}
          popup={
            <div className="">
              {/* 打印模板 */}
              {tempList.length > 0 && (
                <div
                  className={cx('tempList', {
                    noDefaultPrint:
                      type === 1 || !isOpenPermit(permitList.recordPrintSwitch, sheetSwitchPermit, viewId),
                  })}
                >
                  {tempList.map((it, index) => {
                    let isCustom = [2, 5].includes(it.type);

                    return (
                      <MenuItemWrap
                        data-event={`printTemp-${index}`}
                        key={index}
                        className={cx('w100', { lightBg: type === 1 })}
                        icon={
                          isCustom ? (
                            <span className={`${PRINT_TYPE_STYLE[it.type].fileIcon} fileIcon`}></span>
                          ) : (
                            <Icon icon={getPrintCardInfoOfTemplate(it).icon} className="Font18" />
                          )
                        }
                        onClick={async () => {
                          onItemClick();
                          if (window.isPublicApp) {
                            alert(_l('预览模式下，不能操作'), 3);
                            return;
                          }
                          handleTemplateRecordPrint({
                            worksheetId,
                            viewId,
                            recordId,
                            appId,
                            projectId,
                            template: it,
                            attriData,
                            workId,
                            instanceId,
                          });
                        }}
                      >
                        <div title={it.name} className="ellipsis templateName">
                          {it.name}
                        </div>
                        {_.includes([3, 4], it.type) ? (
                          <span className="detail">{getPrintCardInfoOfTemplate(it).text}</span>
                        ) : (isCharge || !it.allowDownloadPermission) && showDownload ? (
                          <span className="detail" onClick={e => this.getDownload(it, e)}>
                            <Tooltip text={_l('导出')} popupPlacement="bottom">
                              <Icon icon="download" className="Font16 downloadIcon" />
                            </Tooltip>
                          </span>
                        ) : null}
                      </MenuItemWrap>
                    );
                  })}
                </div>
              )}
              {/* 系统打印权限 */}
              {type !== 1 && isOpenPermit(permitList.recordPrintSwitch, sheetSwitchPermit, viewId) && (
                <Fragment>
                  <SecTitle>{_l('系统默认打印')}</SecTitle>
                  <MenuItemWrap
                    data-event="printRecord"
                    className={cx({ defaultPrint: tempList.length > 0 })}
                    onClick={() => {
                      onItemClick();
                      this.menuPrint();
                    }}
                  >
                    {_l('打印记录')}
                  </MenuItemWrap>
                </Fragment>
              )}
            </div>
          }
        >
          {type === 1 ? (
            <IconBtn data-event="print">
              <Tooltip offset={[0, 0]} text={_l('打印')} popupPlacement="bottom">
                <Icon icon="print" className="Font22 Hand" />
              </Tooltip>
            </IconBtn>
          ) : (
            <MenuItemWrap
              data-event="print"
              className={cx('printItem', { hover: showPrintGroup })}
              icon={<Icon icon="print" className="Font17 mLeft5" />}
            >
              <span className="mLeft15">
                {tempList.filter(o => o.type !== 0).length > 0 ? _l('打印/导出') : _l('系统打印')}
              </span>
              <Icon icon="arrow-right-tip" style={{ left: 'auto', right: 15 }} className="Font14 mLeft5" />
            </MenuItemWrap>
          )}
        </Trigger>
      );
    }
  }
}
