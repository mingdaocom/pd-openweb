import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import { LoadDiv, Menu, MenuItem, Icon, Dialog } from 'ming-ui';
import { notification, NotificationContent } from 'ming-ui/components/Notification';
import { startProcess } from 'src/pages/workflow/api/process';
import { getWorksheetBtns, deleteWorksheetRows, updateWorksheetRows } from 'src/api/worksheet';
import { getProjectLicenseInfo } from 'src/api/project';
import { getPrintList } from 'src/api/worksheet';
import { add } from 'src/api/webCache';
import { editRecord } from 'worksheet/common/editRecord';
import { printQrCode } from 'worksheet/common/PrintQrCode';
import { exportSheet } from 'worksheet/common/ExportSheet';
import IconText from 'worksheet/components/IconText';
import { CUSTOM_BUTTOM_CLICK_TYPE } from 'worksheet/constants/enum';
import { filterHidedControls, checkCellIsEmpty } from 'worksheet/util';
import Buttons from './Buttons';
import { upgradeVersionDialog } from 'src/util';
import './BatchOperate.less';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
class BatchOperate extends React.Component {
  static propTypes = {
    appId: PropTypes.string,
    worksheetId: PropTypes.string,
    viewId: PropTypes.string,
    selectedNum: PropTypes.number, // 选中记录数目 仅选中视图所有记录时有效
    allWorksheetIsSelected: PropTypes.bool,
    selectedLength: PropTypes.number,
    onBatchEdit: PropTypes.func,
    onBatchDelete: PropTypes.func,
    rows: PropTypes.array,
    permission: PropTypes.shape({}),
    updateViewPermission: PropTypes.func,
    refreshWorksheetControls: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      customButtonExpanded: false,
      customButtonLoading: false,
      customButtons: [],
      printListExpanded: false,
      printListLoading: false,
      tempList: [],
      isNo: null, // 是否没有有批量打印权限
      isFree: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { appId, worksheetId, viewId, permission, updateViewPermission } = this.props;
    if (nextProps.worksheetId !== this.props.worksheetId || nextProps.viewId !== this.props.viewId) {
      this.setState({
        customButtons: [],
      });
    }
    if (nextProps.viewId === this.props.viewId && nextProps.selectedLength && !this.props.selectedLength) {
      this.fetchPrintList();
      this.loadCustomButtons();
      if (_.isEmpty(permission)) {
        updateViewPermission({ appId, worksheetId, viewId });
      }
    }
    if (!_.isEqual(this.props.worksheetInfo, nextProps.worksheetInfo) && !!nextProps.worksheetInfo.projectId) {
      this.projectLicenseInfo(nextProps);
    }
  }

  projectLicenseInfo = props => {
    const { worksheetInfo } = props;
    const { projectId } = worksheetInfo;
    if (!projectId) {
      this.setState({
        isNo: true,
      });
      return;
    }
    let projects = md.global.Account.projects.filter(it => it.projectId === projectId);
    if (projects.length <= 0) {
      // 外部协作
      getProjectLicenseInfo({
        projectId: projectId,
      }).then(data => {
        let { version = [], licenseType } = data;
        let { versionId } = version;
        this.setState({
          /**
           * licenseType
           * 0: 过期
           * 1: 正式版
           * 2: 体验版
           */
          // 只有旗舰版/专业版可用
          isNo: !_.includes([2, 3], versionId) || licenseType === 0,
          isFree: licenseType === 0,
        });
      });
    } else {
      let { version = [], licenseType } = projects[0];
      let { versionId } = version;
      this.setState({
        isNo: !_.includes([2, 3], versionId) || licenseType === 0,
        isFree: licenseType === 0,
      });
    }
  };

  loadCustomButtons() {
    const { appId, worksheetId, viewId } = this.props;
    this.setState({
      customButtonLoading: true,
    });
    if (viewId) {
      getWorksheetBtns({
        appId,
        worksheetId,
        viewId,
      }).then(data => {
        this.setState({
          customButtonLoading: false,
          customButtons: data.filter(
            btn =>
              btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.IMMEDIATELY ||
              btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.CONFIRM ||
              (btn.writeObject === 1 && btn.writeType === 1),
          ),
        });
      });
    }
  }

  // 获取打印模板
  fetchPrintList = () => {
    const { worksheetId, viewId, allWorksheetIsSelected } = this.props;
    // 最多只支持全选本页所有记录 不支持选所有
    if (allWorksheetIsSelected) {
      return;
    }
    if (viewId && worksheetId) {
      getPrintList({
        worksheetId,
        viewId,
      }).then(tempList => {
        this.setState({
          tempList: tempList.filter(it => it.type === 2),
          printListLoading: false,
        });
      });
    }
  };

  @autobind
  expandList() {
    const { customButtonLoading, customButtons } = this.state;
    this.setState({ customButtonExpanded: true });
    if (!customButtonLoading && !customButtons.length) {
      this.loadCustomButtons();
    }
  }

  triggerCustomBtn(btn, isAll) {
    const { worksheetId, viewId, selectedRows, filters, quickFilter, navGroupFilters, clearSelect } = this.props;
    const { filterControls, keyWords, searchType } = filters;
    const Notice = styled.div`
      font-size: 14px;
      color: #333;
      font-weight: bold;
      .icon {
        margin-right: 5px;
        font-size: 20px;
        color: #f44336;
      }
      .btnName {
        display: inline-block;
        max-width: 170px;
      }
    `;
    const Content = styled.div`
      margin-left: 25px;
      font-size: 13px;
      color: #757575;
      font-weight: normal;
    `;
    const NoticeHeader = (
      <Notice>
        <i className={'icon icon-Import-failure'}></i>
        {_l('批量操作')}
        {_l('“')}
        <span className="btnName ellipsis">{btn.name}</span>
        {_l('”')}
      </Notice>
    );
    let args = { isAll };
    if (isAll) {
      args = {
        ...args,
        viewId,
        filterControls,
        keyWords,
        navGroupFilters,
      };
      args.fastFilters = (_.isArray(quickFilter) ? quickFilter : []).map(f =>
        _.pick(f, [
          'controlId',
          'dataType',
          'spliceType',
          'filterType',
          'dateRange',
          'value',
          'values',
          'minValue',
          'maxValue',
        ]),
      );
    }
    if (searchType === 2) {
      args.filterControls = [
        {
          controlId: 'ownerid',
          dataType: 26,
          filterType: 2,
          spliceType: 1,
          values: [md.global.Account.accountId],
        },
      ];
    }
    clearSelect();
    startProcess({
      appId: worksheetId,
      sources: selectedRows.map(item => item.rowid),
      triggerId: btn.btnId,
      ...args,
    }).then(data => {
      if (!data) {
        notification.open({
          content: (
            <NotificationContent
              className="workflowNoticeContentWrap"
              themeColor="error"
              header={NoticeHeader}
              content={<Content>{_l('失败，所有记录都不满足执行条件，或流程尚未启用')}</Content>}
              showClose={true}
              onClose={() => notification.close(`batchUpdateWorkflowNotice${btn.btnId}`)}
            />
          ),
          key: `batchUpdateWorkflowNotice${btn.btnId}`,
          duration: 3,
          // maxCount: 5,
        });
      }
    });
  }

  @autobind
  handleTriggerCustomBtn(btn) {
    const { allWorksheetIsSelected, selectedLength } = this.props;
    if (allWorksheetIsSelected && selectedLength > md.global.SysSettings.worktableBatchOperateDataLimitCount) {
      alert(_l('当前选中数量超过%0条，无法执行此操作', md.global.SysSettings.worktableBatchOperateDataLimitCount), 3);
      return;
    }
    if (btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.IMMEDIATELY) {
      // 立即执行
      this.triggerCustomBtn(btn, allWorksheetIsSelected);
    } else if (btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.CONFIRM) {
      // 二次确认
      Dialog.confirm({
        className: 'customButtonConfirm',
        title: _l('执行批量操作“%0”', btn.name),
        description: btn.confirmMsg,
        okText: btn.sureName,
        cancelText: btn.cancelName,
        onOk: () => {
          this.triggerCustomBtn(btn, allWorksheetIsSelected);
        },
      });
    }
  }

  @autobind
  handleUpdateWorksheetRow(args) {
    const {
      appId,
      worksheetId,
      viewId,
      filters,
      quickFilter,
      navGroupFilters,
      allWorksheetIsSelected,
      selectedRows,
      worksheetInfo,
      clearSelect,
      reload,
      updateRows,
      getWorksheetSheetViewSummary,
      refreshWorksheetControls,
    } = this.props;
    const rowIds = selectedRows.map(row => row.rowid);
    const controls = args.newOldControl.filter(c => !checkCellIsEmpty(c.value));
    delete args.newOldControl;
    const updateArgs = {
      ...args,
      appId,
      viewId,
      worksheetId,
      rowIds,
      controls,
    };
    if (allWorksheetIsSelected) {
      delete args.rowIds;
      updateArgs.isAll = true;
      updateArgs.excludeRowIds = selectedRows.map(row => row.rowid);
      updateArgs.filterControls = filters.filterControls;
      updateArgs.keyWords = filters.keyWords;
      updateArgs.searchType = filters.searchType;
      updateArgs.fastFilters = (quickFilter || []).map(f =>
        _.pick(f, [
          'controlId',
          'dataType',
          'spliceType',
          'filterType',
          'dateRange',
          'value',
          'values',
          'minValue',
          'maxValue',
        ]),
      );
      updateArgs.navGroupFilters = navGroupFilters;
    }
    updateWorksheetRows(updateArgs).then(data => {
      clearSelect();
      if (data.successCount === selectedRows.length) {
        alert(_l('修改成功'));
      }
      if (_.find(controls, item => _.includes([10, 11], item.type) && /color/.test(item.value))) {
        refreshWorksheetControls();
      }
      reload();
      getWorksheetSheetViewSummary();
    });
  }

  // 批量打印|打印二维码
  renderPrintList() {
    const {
      appId,
      worksheetId,
      viewId,
      worksheetInfo,
      allWorksheetIsSelected,
      selectedRows,
      selectedLength,
      sheetSwitchPermit,
    } = this.props;
    const { printListLoading, printListExpanded, tempList = [] } = this.state;
    const { projectId } = worksheetInfo;
    // 不支持选择所有
    const IsQrCodeSwitch =
      !allWorksheetIsSelected &&
      selectedLength <= 100 &&
      isOpenPermit(permitList.QrCodeSwitch, sheetSwitchPermit, viewId);
    if (allWorksheetIsSelected || (tempList.length <= 0 && !IsQrCodeSwitch)) {
      return '';
    }
    if (!printListLoading) {
      if (tempList.length <= 0) {
        return IsQrCodeSwitch ? (
          <IconText icon="zendeskHelp-qrcode" text={_l('打印二维码')} onClick={this.handlePrintQrCode} />
        ) : (
          ''
        );
      } else {
        let selectedRowIds = [];
        selectedRows.map(it => {
          selectedRowIds.push(it.rowid);
        });
        return (
          <div className="iconText Hand">
            {/* <span
              className="expandBtn ThemeHoverColor3"
              onClick={() => {
                this.setState({
                  printListExpanded: true,
                });
              }}
            >
            </span> */}
            <IconText
              icon="print"
              textCmp={() => {
                return (
                  <React.Fragment>
                    {_l('打印')}
                    <Icon icon="arrow-down-border" className="printDownIcon" />
                  </React.Fragment>
                );
              }}
              onClick={() => {
                this.setState({
                  printListExpanded: true,
                });
              }}
            />
            {printListExpanded && (
              <Menu
                className=""
                style={{ left: '10px' }}
                onClickAway={() => this.setState({ printListExpanded: false })}
                onClickAwayExceptions={[]}
              >
                {IsQrCodeSwitch && (
                  <MenuItem
                    className="defaultPrint"
                    onClick={() => {
                      this.handlePrintQrCode();
                      this.setState({ printListExpanded: false });
                    }}
                  >
                    {_l('打印二维码')}
                  </MenuItem>
                )}
                <div
                  className={cx('printList', {
                    noBorder: !IsQrCodeSwitch,
                  })}
                >
                  {tempList.map(it => (
                    <MenuItem
                      className=""
                      onClick={evt => {
                        const { isNo, isFree } = this.state;
                        if (isNo) {
                          upgradeVersionDialog({
                            projectId,
                            explainText: _l('Word批量打印是高级功能，请升级至付费版解锁开启'),
                            isFree,
                          });
                        } else {
                          let printId = it.id;
                          let printData = {
                            printId,
                            isDefault: false, // word模板
                            worksheetId,
                            projectId,
                            rowId: selectedRowIds.join(','),
                            getType: 1,
                            viewId,
                            appId,
                            name: it.name,
                            isBatch: true,
                          };
                          let printKey = Math.random().toString(36).substring(2);
                          add({
                            key: `${printKey}`,
                            value: JSON.stringify(printData),
                          });
                          window.open(`/printForm/worksheet/preview/print/${printKey}`);
                          this.setState({
                            printListExpanded: false,
                          });
                        }
                      }}
                    >
                      <span title={it.name}>{it.name}</span>
                    </MenuItem>
                  ))}
                </div>
              </Menu>
            )}
          </div>
        );
      }
    }
  }

  @autobind
  handlePrintQrCode() {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    const { appId, viewId, controls, selectedRows, worksheetInfo } = this.props;
    const { worksheetId, name } = worksheetInfo;
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
    printQrCode({
      appId,
      viewId,
      worksheetId: worksheetId,
      worksheetName: name,
      columns: controls,
      selectedRows,
    });
  }

  render() {
    const {
      appId,
      worksheetId,
      viewId,
      rows,
      view,
      controls,
      filters,
      quickFilter,
      navGroupFilters,
      worksheetInfo,
      count,
      selectedRows,
      selectedLength,
      allWorksheetIsSelected,
      permission,
      rowsSummary,
      clearSelect,
      sheetSwitchPermit,
    } = this.props;
    // funcs
    const { reload, updateRows, hideRows, getWorksheetSheetViewSummary } = this.props;
    const { projectId, entityName, downLoadUrl } = worksheetInfo;
    const { printListLoading, customButtonLoading, customButtons } = this.state;
    const showExport = isOpenPermit(permitList.viewExportSwitch, sheetSwitchPermit, viewId);
    const canEdit =
      !_.isEmpty(permission) && permission.canEdit && isOpenPermit(permitList.batchEdit, sheetSwitchPermit, viewId);
    return (
      <ReactCSSTransitionGroup
        transitionName="batchOperateCon"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={300}
      >
        {!!selectedLength && rows.length && !printListLoading && !_.isEmpty(permission) && (
          <div className="batchOperateCon">
            <div className="selected">
              <span className="selectedStatus">
                {allWorksheetIsSelected
                  ? _l(`已选择"${view.name}"所有 %0 条%1`, selectedLength, entityName)
                  : _l('已选择本页 %0 条%1', selectedLength, entityName)}
              </span>
            </div>
            <div className="operate flexRow">
              {permission && canEdit && (
                <IconText
                  icon="hr_edit"
                  text={_l('编辑')}
                  onClick={() => {
                  if (allWorksheetIsSelected && selectedLength > md.global.SysSettings.worktableBatchOperateDataLimitCount) {
                    alert(_l('当前选中的记录数量超过%0条，无法执行操作', md.global.SysSettings.worktableBatchOperateDataLimitCount), 3);
                      return;
                    }
                    editRecord({
                      appId,
                      viewId,
                      projectId,
                      view,
                      worksheetId,
                      searchArgs: filters,
                      quickFilter,
                      navGroupFilters,
                      clearSelect,
                      allWorksheetIsSelected,
                      updateRows,
                      getWorksheetSheetViewSummary,
                      reloadWorksheet: reload,
                      selectedRows,
                      worksheetInfo: worksheetInfo,
                    });
                  }}
                />
              )}
              {this.renderPrintList()}
              {showExport && (
                <IconText
                  icon="file_download"
                  text={_l('导出')}
                  onClick={() => {
                    if (window.isPublicApp) {
                      alert(_l('预览模式下，不能操作'), 3);
                      return;
                    }
                    exportSheet({
                      allCount: count,
                      allWorksheetIsSelected: allWorksheetIsSelected,
                      appId: appId,
                      exportView: view,
                      worksheetId,
                      projectId: projectId,
                      searchArgs: filters,
                      selectRowIds: selectedRows.map(item => item.rowid),
                      columns: filterHidedControls(controls, view.controls).filter(item => {
                        return item.controlPermissions && item.controlPermissions[0] === '1';
                      }),
                      downLoadUrl: downLoadUrl,
                      worksheetSummaryTypes: rowsSummary.types,
                      quickFilter,
                      navGroupFilters,
                    });
                  }}
                />
              )}
              {permission && permission.canRemove && (
                <IconText
                  className="delete"
                  icon="delete2"
                  text={_l('删除')}
                  onClick={() => {
                    if (window.isPublicApp) {
                      alert(_l('预览模式下，不能操作'), 3);
                      return;
                    }
                    Dialog.confirm({
                      title: <span className="Red">{_l('批量删除%0', entityName)}</span>,
                      buttonType: 'danger',
                      description: _l('60天内可在 回收站 内找回已删除%0，无编辑权限的数据无法删除。', entityName),
                      onOk: () => {
                        const hasAuthRowIds = selectedRows
                          .filter(item => item.allowdelete || item.allowDelete)
                          .map(item => item.rowid);
                        if (!allWorksheetIsSelected && hasAuthRowIds.length === 0) {
                          alert(_l('无权限删除选择的记录'), 3);
                        } else {
                          const args = {
                            appId,
                            viewId,
                            worksheetId,
                            isAll: allWorksheetIsSelected,
                          };
                          if (args.isAll) {
                            args.excludeRowIds = selectedRows.map(item => item.rowid);
                            args.fastFilters = (quickFilter || []).map(f =>
                              _.pick(f, [
                                'controlId',
                                'dataType',
                                'spliceType',
                                'filterType',
                                'dateRange',
                                'value',
                                'values',
                                'minValue',
                                'maxValue',
                              ]),
                            );
                            args.navGroupFilters = navGroupFilters;
                            args.filterControls = filters.filterControls;
                            args.keyWords = filters.keyWords;
                            args.searchType = filters.searchType;
                          } else {
                            args.rowIds = hasAuthRowIds;
                          }
                          deleteWorksheetRows(args)
                            .then(res => {
                              if (res.isSuccess) {
                                if (hasAuthRowIds.length === selectedRows.length) {
                                  alert(_l('删除成功'));
                                } else if (hasAuthRowIds.length < selectedRows.length) {
                                  alert(_l('删除成功，无编辑权限的记录无法删除'));
                                }
                                if (allWorksheetIsSelected) {
                                  reload();
                                } else {
                                  hideRows(hasAuthRowIds);
                                  clearSelect();
                                }
                              }
                            })
                            .fail(err => {
                              alert(_l('批量删除失败', 3));
                            });
                        }
                      },
                    });
                  }}
                />
              )}
              {!customButtonLoading && !!customButtons.length && (
                <div className="flex">
                  <Buttons
                    buttons={customButtons}
                    appId={appId}
                    viewId={viewId}
                    projectId={projectId}
                    worksheetId={worksheetId}
                    selectedRows={selectedRows}
                    isAll={allWorksheetIsSelected}
                    handleTriggerCustomBtn={this.handleTriggerCustomBtn}
                    handleUpdateWorksheetRow={this.handleUpdateWorksheetRow}
                    onUpdateRow={() => {
                      clearSelect();
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </ReactCSSTransitionGroup>
    );
  }
}

export default BatchOperate;
