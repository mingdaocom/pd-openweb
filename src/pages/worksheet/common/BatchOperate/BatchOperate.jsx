import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Dialog, Tooltip } from 'ming-ui';
import DeleteConfirm from 'ming-ui/components/DeleteReconfirm';
import { mdNotification } from 'ming-ui/functions';
import worksheetAjax from 'src/api/worksheet';
import processAjax from 'src/pages/workflow/api/process';
import { batchEditRecord } from 'worksheet/common/BatchEditRecord';
import { printQrBarCode } from 'worksheet/common/PrintQrBarCode';
import { refreshRecord } from 'worksheet/common/RefreshRecordDialog';
import DropMotion from 'worksheet/components/Animations/DropMotion';
import IconText from 'worksheet/components/IconText';
import { CUSTOM_BUTTOM_CLICK_TYPE } from 'worksheet/constants/enum';
import { copyRow } from 'worksheet/controllers/record';
import { canEditApp, canEditData, isHaveCharge } from 'worksheet/redux/actions/util';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import Buttons from 'src/pages/worksheet/common/recordInfo/RecordForm/CustomButtonsAutoWidth';
import { emitter } from 'src/utils/common';
import { checkCellIsEmpty } from 'src/utils/control';
import { handleRecordError } from 'src/utils/record';
import { replaceBtnsTranslateInfo } from 'src/utils/translate';
import { getGroupControlId } from 'src/utils/worksheet';
import ExportList from './ExportList';
import PrintList from './PrintList';
import SubButton from './SubButton';
import './BatchOperate.less';

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

const ButtonsCon = styled.div`
  position: relative;
  margin-left: 12px;
  padding-left: 12px;
  &:before {
    content: ' ';
    position: absolute;
    top: 8px;
    left: 0px;
    width: 1px;
    height: 13px;
    background-color: #ddd;
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
      needReloadButtons = true;
      this.setState({ loading: false });
      if (_.isEmpty(permission)) {
        updateViewPermission({ appId, worksheetId, viewId });
      }
    }
    if (needReloadButtons) {
      this.loadCustomButtons(updateRowId);
    }
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
            customButtons: replaceBtnsTranslateInfo(appId, data).filter(
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
    const { worksheetId, viewId, selectedRows, filters, filtersGroup, quickFilter, navGroupFilters } = this.props;
    const { filterControls, keyWords, searchType } = filters;
    let args = { isAll };
    if (isAll) {
      args = {
        ...args,
        viewId,
        filterControls,
        keyWords,
        navGroupFilters,
        filtersGroup,
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
        pushUniqueId: _.get(window, 'md.global.Config.pushUniqueId'),
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

  handleTriggerCustomBtn = btn => {
    const { allWorksheetIsSelected } = this.props;
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
  };

  handleUpdateWorksheetRow = (args, callback = () => {}) => {
    const {
      appId,
      worksheetId,
      viewId,
      filters,
      quickFilter,
      navGroupFilters,
      filtersGroup,
      allWorksheetIsSelected,
      selectedRows,
      reload,
      updateRows,
      getWorksheetSheetViewSummary,
      refreshWorksheetControls,
    } = this.props;
    const rowIds = selectedRows.map(row => row.rowid);
    const isEditSingle = rowIds.length === 1 && !allWorksheetIsSelected;
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
    if (isEditSingle) {
      updateArgs.newOldControl = controls;
      updateArgs.rowId = rowIds[0];
      delete updateArgs.controls;
      delete updateArgs.rowIds;
    }
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
      updateArgs.filtersGroup = filtersGroup;
    }
    (isEditSingle ? worksheetAjax.updateWorksheetRow : worksheetAjax.updateWorksheetRows)(updateArgs).then(data => {
      callback();
      if ((isEditSingle ? data.resultCode === 1 : data.successCount === selectedRows.length) && !args.noAlert) {
        alert(_l('修改成功'));
      } else if (isEditSingle && data.resultCode !== 1) {
        handleRecordError(data.resultCode);
      }
      if (data.resultCode !== 1 && !data.isSuccess) return;
      if (_.find(controls, item => _.includes([10, 11], item.type) && /color/.test(item.value))) {
        refreshWorksheetControls();
      }
      if (allWorksheetIsSelected || args.hasFilters || _.find(controls, c => c.type === 29)) {
        reload();
      } else {
        updateRows(
          rowIds,
          [{}, ...controls].reduce((a, b) => Object.assign({}, a, { [b.controlId]: b.value })),
        );
      }
      getWorksheetSheetViewSummary();
    });
  };

  handlePrintQrCode = ({ printType = 1 } = {}) => {
    const { isCharge } = this.props;
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    const { appId, viewId, controls, selectedRows, worksheetInfo } = this.props;
    const { projectId, worksheetId, name } = worksheetInfo;
    const disablePrint = !window.isChrome && !window.isFirefox && !window.isSafari;
    if (window.isMDClient) {
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
      ...this.getFilterArgs(),
    });
  };

  findLastId(ids) {
    const { rows } = this.props;
    const indexList = ids.map(id => _.findIndex(rows, row => row.rowid === id));
    return rows[_.max(indexList)].rowid;
  }

  getFilterArgs() {
    const { filters = {}, quickFilter, navGroupFilters } = this.props;
    return {
      filterControls: filters.filterControls,
      fastFilters: quickFilter,
      navGroupFilters,
    };
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
      navGroupFilters,
      filtersGroup,
      worksheetInfo,
      count,
      selectedRows,
      selectedLength,
      allWorksheetIsSelected,
      permission,
      clearSelect,
      sheetSwitchPermit,
      refresh,
      addRecord,
      setHighLightOfRows,
      permissionType,
    } = this.props;
    // funcs
    const { reload, updateRows, hideRows, getWorksheetSheetViewSummary } = this.props;
    const { projectId, entityName, roleType } = worksheetInfo;
    const { loading, select1000, customButtonLoading } = this.state;
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
    const showCodePrint = isOpenPermit(permitList.QrCodeSwitch, sheetSwitchPermit, viewId);
    const selectedTip = (
      <div className="selected">
        <span className="selectedStatus">
          {(() => {
            if (allWorksheetIsSelected) {
              if (select1000) {
                return _l(`已选择 ${md.global.SysSettings.worktableBatchOperateDataLimitCount} 条数据`);
              }
              if (selectedLength === -1) {
                return _l(`已选择"%0"所有%1`, view.name, entityName);
              }
              return _l(`已选择"%0"所有 %1 条%2`, view.name, selectedLength, entityName);
            }
            return _l('已选择本页 %0 条%1', selectedLength, entityName);
          })()}
        </span>
      </div>
    );

    function handleLock(isLock) {
      const hasAuthRowIds = selectedRows
        .filter(item => (item.allowdelete || item.allowDelete) && !(isLock ? item.sys_lock : false))
        .map(item => item.rowid);
      if (!hasAuthRowIds.length) {
        alert(_l('没有可以%0的记录', isLock ? _l('锁定') : _l('解锁')), 3);
        return;
      }
      const args = {
        appId,
        viewId,
        worksheetId,
        rowIds: hasAuthRowIds,
        updateType: isLock ? 41 : 42,
      };
      if (allWorksheetIsSelected) {
        delete args.rowIds;
        args.isAll = true;
        args.excludeRowIds = selectedRows.map(row => row.rowid);
        args.filterControls = filters.filterControls;
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
        args.navGroupFilters = navGroupFilters;
        args.keyWords = filters.keyWords;
        args.searchType = filters.searchType;
      }
      worksheetAjax
        .updateWorksheetRows(args)
        .then(res => {
          if (res.isSuccess) {
            alert(isLock ? _l('锁定成功') : _l('解锁成功'));
            reload();
          } else {
            alert(isLock ? _l('锁定失败') : _l('解锁失败'), 3);
          }
        })
        .catch(() => {
          alert(isLock ? _l('锁定失败') : _l('解锁失败'), 3);
        });
    }

    return (
      <DropMotion
        duration={200}
        style={{ position: 'absolute', width: '100%', top: 0, left: 0, right: 0, zIndex: 2 }}
        visible={!!selectedLength && rows.length && !loading && !_.isEmpty(permission)}
      >
        <div className={cx('batchOperateCon', { single: type === 'single' })}>
          {type !== 'single' && selectedTip}
          <div className="operate flexRow">
            {type === 'single' && selectedTip}
            {permission && canEdit && (!selectedRow || selectedRow.allowedit) && (
              <IconText
                dataEvent="edit"
                icon="hr_edit"
                text={_l('编辑')}
                onClick={() => {
                  const _this = this;
                  if (window.isPublicApp) {
                    alert(_l('预览模式下，不能操作'), 3);
                    return;
                  }
                  function handleEdit() {
                    batchEditRecord({
                      appId,
                      viewId,
                      projectId,
                      isCharge,
                      view,
                      worksheetId,
                      searchArgs: filters,
                      quickFilter,
                      navGroupFilters,
                      filtersGroup,
                      allWorksheetIsSelected,
                      updateRows,
                      getWorksheetSheetViewSummary,
                      reloadWorksheet: () => {
                        reload();
                        _this.setState({ select1000: false });
                      },
                      selectedRows,
                      worksheetInfo: worksheetInfo,
                    });
                  }
                  if (
                    selectedLength > md.global.SysSettings.worktableBatchOperateDataLimitCount ||
                    selectedLength === -1
                  ) {
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
                dataEvent="copy"
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
                          if (getGroupControlId(view)) {
                            refresh();
                            return;
                          }
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
            <PrintList
              {...{
                isCharge,
                showCodePrint,
                appId,
                worksheetId,
                projectId,
                viewId,
                controls,
                selectedRows: selectedRows.length ? selectedRows : rows,
                selectedRowIds: selectedRows.map(r => r.rowid),
                count: count,
                allowLoadMore: allWorksheetIsSelected,
              }}
              {...this.getFilterArgs()}
            />
            {showExport && <ExportList {...this.props} />}
            {canDelete && (
              <IconText
                dataEvent="delete"
                className="delete"
                icon="trash"
                text={_l('删除')}
                onClick={() => {
                  if (window.isPublicApp) {
                    alert(_l('预览模式下，不能操作'), 3);
                    return;
                  }
                  function handleDelete(thoroughDelete) {
                    const hasAuthRowIds = selectedRows
                      .filter(item => (item.allowdelete || item.allowDelete) && !item.sys_lock)
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
                            emitter.emit('ROWS_UPDATE');
                            if (allWorksheetIsSelected && res.successCount === 0) {
                              alert(_l('无权限删除选择的记录'), 3);
                            } else if (hasAuthRowIds.length < selectedRows.length || allWorksheetIsSelected) {
                              alert(_l('删除成功，锁定或无删除权限的记录已被忽略'));
                            } else if (hasAuthRowIds.length === selectedRows.length) {
                              alert(_l('删除成功'));
                            }
                            if (
                              allWorksheetIsSelected ||
                              selectedRows.length === pageSize ||
                              selectedRows.length === rows.length
                            ) {
                              reload();
                            } else {
                              clearSelect();
                              hideRows(hasAuthRowIds);
                              getWorksheetSheetViewSummary();
                            }
                          }
                        })
                        .catch(() => {
                          alert(_l('批量删除失败'), 3);
                        });
                    }
                  }
                  const configOptions = {
                    title: <span className="Red">{_l('批量删除%0', entityName)}</span>,
                    buttonType: 'danger',
                    description:
                      selectedLength <= md.global.SysSettings.worktableBatchOperateDataLimitCount &&
                      selectedLength !== -1
                        ? _l(
                            '%0天内可在 回收站 找回已删除%1。未锁定且有删除权限的%1才可被删除。',
                            md.global.SysSettings.worksheetRowRecycleDays,
                            entityName,
                          )
                        : _l(
                            '批量操作单次最大支持%0行记录。点击“确认”将删除前%0行未锁定且有删除权限的记录，删除后%1天内可在 回收站 找回。',
                            md.global.SysSettings.worktableBatchOperateDataLimitCount,
                            md.global.SysSettings.worksheetRowRecycleDays,
                          ),
                    onOk: handleDelete,
                  };
                  if (
                    isHaveCharge(permissionType) &&
                    selectedLength >= md.global.SysSettings.worktableBatchOperateDataLimitCount
                  ) {
                    configOptions.onlyClose = true;
                    configOptions.cancelType = 'danger-gray';
                    configOptions.onCancel = () => {
                      DeleteConfirm({
                        footer: isCharge ? undefined : null,
                        clickOmitText: false,
                        style: { width: 560 },
                        bodyStyle: { marginLeft: 36 },
                        title: (
                          <div className="Bold flexRow alignItemsCenter">
                            <i className="icon-error error" style={{ fontSize: '28px', marginRight: '8px' }} />
                            {_l('彻底删除所有%0行记录', selectedLength)}
                          </div>
                        ),
                        description: (
                          <div style={{ marginLeft: 36 }}>
                            <span style={{ color: '#151515', fontWeight: 'bold' }}>
                              {_l('此操作将彻底删除所有数据，不可从回收站中恢复！')}
                            </span>
                            {_l(
                              '当前所选记录数量超过%0行，数据不会进入回收站而直接进行彻底删除。此操作只有应用管理员可以执行。',
                              md.global.SysSettings.worktableBatchOperateDataLimitCount,
                            )}
                            <div className="Bold Gray mTop18">{_l('注意:')}</div>
                            <ul className="mTop10 9 mLeft4 Font14">
                              <li style={{ listStyle: 'inside' }}>{_l('将直接物理删除，永远无法恢复')}</li>
                              <li style={{ listStyle: 'inside' }}>{_l('所选记录中锁定或无删除权限的记录将被跳过')}</li>
                              <li style={{ listStyle: 'inside' }}>
                                {_l('其他表与已删除记录的关联关系不会被清除，记录将显示为“已删除”')}
                              </li>
                              <li style={{ listStyle: 'inside' }}>{_l('彻底删除不触发工作流、同步任务')}</li>
                            </ul>
                            {!isCharge && <div className="Gray mTop20">{_l('你没有权限进行此操作！')}</div>}
                          </div>
                        ),
                        data: isCharge ? [{ text: _l('我已了解注意事项，并确认彻底删除数据'), value: 1 }] : [],
                        onOk: () => handleDelete(true),
                      });
                      return;
                    };
                    configOptions.cancelText = (
                      <CancelTextContent>
                        <i className="icon icon-error" />
                        {_l('彻底删除所有%0', entityName)}
                      </CancelTextContent>
                    );
                  }
                  Dialog.confirm(configOptions);
                }}
              />
            )}

            {showCusTomBtn ? (
              <ButtonsCon className="flex">
                <Buttons
                  isCharge={isCharge}
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
              </ButtonsCon>
            ) : (
              <div className="flex" />
            )}
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
            {(canEditApp(permissionType) || //管理员|开发者
              canEditData(permissionType)) && ( //运营者
              <SubButton
                className="mTop4"
                list={[
                  {
                    text: _l('校准数据'),
                    icon: 'architecture',
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
                  ...(roleType === 2
                    ? [
                        {
                          text: _l('锁定'),
                          icon: 'lock',
                          onClick: () => {
                            if (window.isPublicApp) {
                              alert(_l('预览模式下，不能操作'), 3);
                              return;
                            }
                            Dialog.confirm({
                              title: _l('批量锁定%0', entityName),
                              description: _l('已选中%0条记录。一次最多处理1000条记录。', selectedLength),
                              onOk: () => handleLock(true),
                            });
                          },
                        },
                        {
                          text: _l('解锁'),
                          icon: 'task-new-no-locked',
                          onClick: () => {
                            if (window.isPublicApp) {
                              alert(_l('预览模式下，不能操作'), 3);
                              return;
                            }
                            Dialog.confirm({
                              title: _l('批量解锁%0', entityName),
                              description: _l('已选中%0条记录。一次最多处理1000条记录。', selectedLength),
                              onOk: () => handleLock(false),
                            });
                          },
                        },
                      ]
                    : []),
                ]}
              >
                <i className="icon icon-more_horiz  Gray_9e Font18 pointer ThemeHoverColor3  mRight12" />
              </SubButton>
            )}
          </div>
        </div>
      </DropMotion>
    );
  }
}

export default BatchOperate;
