import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import mdNotification from 'ming-ui/functions/notify';
import DeleteConfirm from 'ming-ui/components/DeleteReconfirm';
import { Tooltip, Dialog } from 'ming-ui';
import processAjax from 'src/pages/workflow/api/process';
import worksheetAjax from 'src/api/worksheet';
import { copyRow } from 'worksheet/controllers/record';
import { editRecord } from 'worksheet/common/editRecord';
import { refreshRecord } from 'worksheet/common/RefreshRecordDialog';
import { printQrBarCode } from 'worksheet/common/PrintQrBarCode';
import { exportSheet } from 'worksheet/common/ExportSheet';
import IconText from 'worksheet/components/IconText';
import { CUSTOM_BUTTOM_CLICK_TYPE } from 'worksheet/constants/enum';
import { filterHidedControls, checkCellIsEmpty } from 'worksheet/util';
import PrintList from './PrintList';
import SubButton from './SubButton';
import Buttons from './Buttons';
import './BatchOperate.less';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import _ from 'lodash';

const CancelTextContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  .icon {
    margin-right: 8px;
    font-size: 16px;
    color: #f44336;
  }
`;
class BatchOperate extends React.Component {
  static propTypes = {
    isCharge: PropTypes.bool,
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
  static defaultProps = {
    clearSelect: () => {},
  };
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      select1000: false,
      customButtonExpanded: false,
      customButtonLoading: false,
      customButtons: [],
      templateList: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    const { appId, worksheetId, viewId, permission, updateViewPermission } = this.props;
    if (nextProps.worksheetId !== this.props.worksheetId || nextProps.viewId !== this.props.viewId) {
      this.setState({
        customButtons: [],
      });
    }
    let needReloadButtons = false;
    const nextSelectedRow = nextProps.selectedRows.length === 1 && nextProps.selectedRows[0];
    const nowSelectedRow = this.props.selectedRows.length === 1 && this.props.selectedRows[0];
    let updateRowId;
    if (
      (!nowSelectedRow && nextSelectedRow) ||
      (nowSelectedRow && nextSelectedRow && nowSelectedRow.rowid !== nextSelectedRow.rowid)
    ) {
      updateRowId = nextSelectedRow.rowid;
      needReloadButtons = true;
    } else if (nowSelectedRow && !nextSelectedRow && nextProps.selectedRows.length) {
      needReloadButtons = true;
    }
    if (nextProps.viewId === this.props.viewId && nextProps.selectedLength && !this.props.selectedLength) {
      this.loadPrintList();
      needReloadButtons = true;
      if (_.isEmpty(permission)) {
        updateViewPermission({ appId, worksheetId, viewId });
      }
    }
    if (needReloadButtons) {
      this.loadCustomButtons(updateRowId);
    }
  }

  loadPrintList() {
    const { worksheetId, viewId } = this.props;
    worksheetAjax
      .getPrintList({
        worksheetId,
        viewId,
      })
      .then(data => {
        this.setState({
          templateList: data.filter(d => d.type >= 2).sort((a, b) => a.type - b.type),
          loading: false,
        });
      });
  }

  loadCustomButtons(rowId) {
    const { appId, worksheetId, viewId } = this.props;
    this.setState({
      customButtonLoading: true,
    });
    if (viewId) {
      worksheetAjax
        .getWorksheetBtns({
          appId,
          worksheetId,
          viewId,
          rowId,
        })
        .then(data => {
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

  triggerCustomBtn(btn, isAll) {
    const { worksheetId, viewId, selectedRows, filters, quickFilter, navGroupFilters, clearSelect } = this.props;
    const { filterControls, keyWords, searchType } = filters;
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
    processAjax
      .startProcess({
        appId: worksheetId,
        sources: selectedRows.map(item => item.rowid),
        triggerId: btn.btnId,
        ...args,
      })
      .then(data => {
        if (!data) {
          mdNotification.error({
            title: _l('批量操作"%0"', btn.name),
            description: _l('失败，所有记录都不满足执行条件，或流程尚未启用'),
            duration: 3,
          });
        }
      });
  }

  @autobind
  handleTriggerCustomBtn(btn) {
    const { allWorksheetIsSelected, selectedLength } = this.props;
    if (btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.IMMEDIATELY) {
      // 立即执行
      this.triggerCustomBtn(btn, allWorksheetIsSelected);
    } else if (btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.CONFIRM) {
      // 二次确认
      Dialog.confirm({
        className: 'customButtonConfirm',
        title: btn.confirmMsg,
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
    const controls =
      rowIds.length === 1 ? args.newOldControl : args.newOldControl.filter(c => !checkCellIsEmpty(c.value));
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
    worksheetAjax.updateWorksheetRows(updateArgs).then(data => {
      if (data.successCount === selectedRows.length) {
        alert(_l('修改成功'));
      }
      if (_.find(controls, item => _.includes([10, 11], item.type) && /color/.test(item.value))) {
        refreshWorksheetControls();
      }
      if (allWorksheetIsSelected || args.hasFilters) {
        reload();
      } else {
        updateRows(
          rowIds,
          [{}, ...controls].reduce((a, b) => Object.assign({}, a, { [b.controlId]: b.value })),
        );
      }
      getWorksheetSheetViewSummary();
    });
  }

  @autobind
  handlePrintQrCode({ printType = 1 } = {}) {
    const { isCharge } = this.props;
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    const { appId, viewId, controls, selectedRows, worksheetInfo } = this.props;
    const { projectId, worksheetId, name } = worksheetInfo;
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
    });
  }

  findLastId(ids) {
    const { rows } = this.props;
    const indexList = ids.map(id => _.findIndex(rows, row => row.rowid === id));
    return rows[_.max(indexList)].rowid;
  }

  render() {
    const {
      type,
      isCharge,
      pageSize,
      appId,
      worksheetId,
      viewId,
      rows,
      view,
      controls,
      filters,
      quickFilter,
      filtersGroup,
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
      refresh,
      addRecord,
      setHighLightOfRows,
    } = this.props;
    // funcs
    const { reload, updateRows, hideRows, getWorksheetSheetViewSummary } = this.props;
    const { projectId, entityName, downLoadUrl } = worksheetInfo;
    const { loading, select1000, customButtonLoading, templateList } = this.state;
    let { customButtons } = this.state;
    customButtons = customButtons.filter(b => !b.disabled);
    const selectedRow = selectedRows.length === 1 && selectedRows[0];
    const showExport = isOpenPermit(permitList.export, sheetSwitchPermit, viewId);
    const showCusTomBtn =
      isOpenPermit(permitList.execute, sheetSwitchPermit, viewId) && !customButtonLoading && !!customButtons.length;
    const canDelete =
      isOpenPermit(permitList.delete, sheetSwitchPermit, viewId) &&
      permission &&
      permission.canRemove &&
      (!selectedRow || selectedRow.allowdelete);
    const canEdit =
      !_.isEmpty(permission) && permission.canEdit && isOpenPermit(permitList.batchEdit, sheetSwitchPermit, viewId);
    const canCopy =
      !_.isEmpty(permission) && permission.canEdit && isOpenPermit(permitList.copy, sheetSwitchPermit, viewId);
    const showCodePrint =
      !allWorksheetIsSelected &&
      selectedLength <= 100 &&
      isOpenPermit(permitList.QrCodeSwitch, sheetSwitchPermit, viewId);
    const selectedTip = (
      <div className="selected">
        <span className="selectedStatus">
          {allWorksheetIsSelected
            ? _l(select1000 ? `已选择 ${md.global.SysSettings.worktableBatchOperateDataLimitCount} 条数据` : `已选择"${view.name}"所有 %0 条%1`, selectedLength, entityName)
            : _l('已选择本页 %0 条%1', selectedLength, entityName)}
        </span>
      </div>
    );
    return (
      <ReactCSSTransitionGroup
        transitionName="batchOperateCon"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={300}
      >
        {!!selectedLength && rows.length && !loading && !_.isEmpty(permission) && (
          <div className={cx('batchOperateCon', { single: type === 'single' })}>
            {type !== 'single' && selectedTip}
            <div className="operate flexRow">
              {type === 'single' && selectedTip}
              {permission && canEdit && (!selectedRow || selectedRow.allowedit) && (
                <IconText
                  icon="hr_edit"
                  text={_l('编辑')}
                  onClick={() => {
                    if (window.isPublicApp) {
                      alert(_l('预览模式下，不能操作'), 3);
                      return;
                    }
                    function handleEdit() {
                      editRecord({
                        appId,
                        viewId,
                        projectId,
                        view,
                        worksheetId,
                        searchArgs: filters,
                        quickFilter,
                        navGroupFilters,
                        allWorksheetIsSelected,
                        updateRows,
                        getWorksheetSheetViewSummary,
                        reloadWorksheet: reload,
                        selectedRows,
                        worksheetInfo: worksheetInfo,
                      });
                    }
                    if (selectedLength > md.global.SysSettings.worktableBatchOperateDataLimitCount) {
                      Dialog.confirm({
                        title: (
                          <span style={{ fontWeight: 500, lineHeight: '1.5em' }}>
                            {_l(
                              '最大支持批量执行%0行记录，是否只选中并执行前%0行数据？',
                              md.global.SysSettings.worktableBatchOperateDataLimitCount,
                            )}
                          </span>
                        ),
                        onOk: () => {
                          this.setState({ select1000: true });
                          handleEdit();
                        },
                      });
                    } else {
                      handleEdit();
                    }
                  }}
                />
              )}
              {!allWorksheetIsSelected && permission && canCopy && (!selectedRow || selectedRow.allowedit) && (
                <IconText
                  icon="copy"
                  text={_l('复制')}
                  onClick={() => {
                    if (window.isPublicApp) {
                      alert(_l('预览模式下，不能操作'), 3);
                      return;
                    }
                    if (selectedRows.length > 20) {
                      alert(_l('批量复制不能超过20行'), 3);
                      return;
                    }
                    Dialog.confirm({
                      title: _l('您确认复制这%0条记录吗？', selectedRows.length),
                      onOk: () => {
                        const rowIds = selectedRows.map(r => r.rowid);
                        copyRow(
                          {
                            worksheetId,
                            viewId,
                            rowIds,
                          },
                          newRows => {
                            addRecord(newRows, this.findLastId(rowIds));
                            clearSelect();
                            setHighLightOfRows(newRows.map(r => r.rowid));
                          },
                        );
                      },
                    });
                  }}
                />
              )}
              {!allWorksheetIsSelected && (showCodePrint || !_.isEmpty(templateList)) && (
                <PrintList
                  {...{
                    isCharge,
                    showCodePrint,
                    appId,
                    worksheetId,
                    projectId,
                    viewId,
                    controls,
                    selectedRows,
                    selectedRowIds: selectedRows.map(r => r.rowid),
                    templateList,
                  }}
                />
              )}
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
                      sheetSwitchPermit,
                      selectRowIds: selectedRows.map(item => item.rowid),
                      columns: filterHidedControls(controls, view.controls).filter(item => {
                        return (
                          item.controlPermissions && item.controlPermissions[0] === '1' && item.controlId !== 'rowid'
                        );
                      }),
                      downLoadUrl: downLoadUrl,
                      worksheetSummaryTypes: rowsSummary.types,
                      quickFilter,
                      filtersGroup,
                      navGroupFilters,

                      // 不支持列统计结果
                      hideStatistics: true,
                    });
                  }}
                />
              )}
              {canDelete && (
                <IconText
                  className="delete"
                  icon="delete2"
                  text={_l('删除')}
                  onClick={() => {
                    if (window.isPublicApp) {
                      alert(_l('预览模式下，不能操作'), 3);
                      return;
                    }
                    function handleDelete(thoroughDelete) {
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
                          thoroughDelete,
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
                        worksheetAjax
                          .deleteWorksheetRows(args)
                          .then(res => {
                            if (res.isSuccess) {
                              if (hasAuthRowIds.length === selectedRows.length) {
                                alert(_l('删除成功'));
                              } else if (hasAuthRowIds.length < selectedRows.length) {
                                alert(_l('删除成功，无编辑权限的记录无法删除'));
                              }
                              if (allWorksheetIsSelected || selectedRows.length === pageSize) {
                                reload();
                              } else {
                                clearSelect();
                                hideRows(hasAuthRowIds);
                              }
                            }
                          })
                          .fail(err => {
                            alert(_l('批量删除失败'), 3);
                          });
                      }
                    }
                    const configOptions = {
                      title: <span className="Red">{_l('批量删除%0', entityName)}</span>,
                      buttonType: 'danger',
                      description:
                        selectedLength <= md.global.SysSettings.worktableBatchOperateDataLimitCount
                          ? _l('60天内可在 回收站 内找回已删除%0，无编辑权限的数据无法删除。', entityName)
                          : _l(
                              '批量操作单次最大支持%0行记录，点击删除后将只删除前%0行记录',
                              md.global.SysSettings.worktableBatchOperateDataLimitCount,
                            ),
                      onOk: handleDelete,
                    };
                    if (isCharge && selectedLength >= md.global.SysSettings.worktableBatchOperateDataLimitCount) {
                      configOptions.onlyClose = true;
                      configOptions.cancelType = 'danger-gray';
                      configOptions.onCancel = () => {
                        DeleteConfirm({
                          footer: isCharge ? undefined : null,
                          clickOmitText: false,
                          title: (
                            <div className="Bold">
                              <i className="icon-error error" style={{ fontSize: '28px', marginRight: '8px' }} />
                              {_l('彻底删除所有%0行记录', selectedLength)}
                            </div>
                          ),
                          description: (
                            <div>
                              <span style={{ color: '#333', fontWeight: 'bold' }}>
                                {_l('注意：此操作将彻底删除所有数据，不可从回收站中恢复！')}
                              </span>
                              {_l(
                                '当前所选记录数量超过%0行，数据不会进入回收站而直接进行彻底删除，且不会触发工作流。此操作只有应用管理员可以执行，请请务必确认所有应用成员都不再需要这些数据后再执行此操作',
                                md.global.SysSettings.worktableBatchOperateDataLimitCount,
                              )}
                              {!isCharge && <div className="Gray mTop20">{_l('你没有权限进行此操作！')}</div>}
                            </div>
                          ),
                          data: isCharge ? [{ text: _l('我确认永久删除这些数据'), value: 1 }] : [],
                          onOk: () => handleDelete(true),
                        });
                        return;
                      };
                      configOptions.cancelText = (
                        <CancelTextContent>
                          <i className="icon icon-error" />
                          {_l('彻底删除所有数据', selectedLength)}
                        </CancelTextContent>
                      );
                    }
                    Dialog.confirm(configOptions);
                  }}
                />
              )}

              <div className="flex">
                {showCusTomBtn && (
                  <Buttons
                    count={selectedLength}
                    buttons={customButtons}
                    appId={appId}
                    viewId={viewId}
                    recordId={selectedRows.length === 1 && selectedRows[0].rowid}
                    projectId={projectId}
                    worksheetId={worksheetId}
                    selectedRows={selectedRows}
                    isAll={allWorksheetIsSelected}
                    handleTriggerCustomBtn={this.handleTriggerCustomBtn}
                    handleUpdateWorksheetRow={this.handleUpdateWorksheetRow}
                  />
                )}
              </div>
              <Tooltip popupPlacement="bottom" text={<span>{_l('刷新视图')}</span>}>
                <i
                  className={cx(
                    'refreshBtn icon icon-task-later refresh Gray_9e Font18 pointer ThemeHoverColor3 mTop5 mRight12',
                  )}
                  onClick={() => {
                    refresh({ noClearSelected: true, updateWorksheetControls: true });
                  }}
                />
              </Tooltip>
              {isCharge && (
                <SubButton
                  className="mTop4"
                  list={[
                    {
                      text: _l('校准数据'),
                      icon: 'Empty_nokey',
                      onClick: () => {
                        if (window.isPublicApp) {
                          alert(_l('预览模式下，不能操作'), 3);
                          return;
                        }
                        refreshRecord({
                          controls,
                          appId,
                          viewId,
                          projectId,
                          view,
                          worksheetId,
                          searchArgs: filters,
                          quickFilter,
                          navGroupFilters,
                          allWorksheetIsSelected,
                          updateRows,
                          getWorksheetSheetViewSummary,
                          reloadWorksheet: reload,
                          selectedRows,
                          worksheetInfo: worksheetInfo,
                          clearSelect,
                        });
                      },
                    },
                  ]}
                >
                  <i className="icon icon-more_horiz  Gray_9e Font18 pointer ThemeHoverColor3  mRight12" />
                </SubButton>
              )}
            </div>
          </div>
        )}
      </ReactCSSTransitionGroup>
    );
  }
}

export default BatchOperate;
