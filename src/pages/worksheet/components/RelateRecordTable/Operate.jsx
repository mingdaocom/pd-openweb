import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Motion, spring } from 'react-motion';
import cx from 'classnames';
import { find, get, isEmpty, isUndefined, last } from 'lodash';
import moment from 'moment';
import { bool, func, shape, string } from 'prop-types';
import { arrayOf } from 'prop-types';
import styled from 'styled-components';
import { Dialog, Input } from 'ming-ui';
import addRecord from 'worksheet/common/newRecord/addRecord';
import WorkSheetFilter from 'worksheet/common/WorkSheetFilter';
import ExportSheetButton from 'worksheet/components/ExportSheetButton';
import Pagination from 'worksheet/components/Pagination';
import { openRelateRelateRecordTable } from 'worksheet/components/RelateRecordTableDialog';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import { selectRecords } from 'src/components/SelectRecords';
import { exportRelateRecordRecords } from 'src/pages/worksheet/common/recordInfo/crtl';
import { getTranslateInfo } from 'src/utils/app';
import { emitter } from 'src/utils/common';
import * as actions from './redux/action';
import { initialChanges } from './redux/reducer';
import RelateRecordBtn from './RelateRecordBtn';
import { getVisibleControls } from './utils';

const Con = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  line-height: 36px;
  min-height: 38px;
  ${({ smallMode }) => smallMode && 'display: block;'}
  .worksheetFilterTrigger {
    line-height: 1em;
    min-width: 28px;
    margin-right: 6px;
    text-align: center;
  }
  .selectedFilter {
    margin-right: 0px;
  }
  .filterTrigger {
    line-height: 1em;
  }
  .searchIcon {
    position: relative;
    z-index: 2;
    .icon-search {
      position: relative;
      margin: 5px 0 0;
    }
    .searchInput {
      font-size: 0px;
      overflow: hidden;
      background: #eaeaea;
      height: 28px;
      border-radius: 28px;
      input {
        width: 150px;
        margin-left: 30px;
        padding-left: 0px;
        height: 28px;
        line-height: 28px;
        font-size: 12px;
        border: none;
        background: transparent;
      }
    }
    .clearKeywords {
      cursor: pointer;
      margin: 5px;
      position: absolute;
      right: 0px;
    }
  }
`;

const IconBtn = styled.span`
  color: #9e9e9e;
  display: inline-block;
  height: 28px;
  font-size: 20px;
  line-height: 28px;
  padding: 0 4px;
  border-radius: 5px;
  &:hover {
    background: #f7f7f7;
  }
`;

function AnimatedInput(props) {
  const { className, control, onSearch } = props;
  const inputRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [keywords, setKeywords] = useState(props.keywords);
  useLayoutEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible]);
  useEffect(() => {
    if (keywords && !props.keywords) {
      setKeywords('');
    }
  }, [props.keywords]);
  useEffect(() => {
    if (!keywords && props.keywords) {
      setKeywords(props.keywords);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [props.control.controlId]);
  return (
    <Motion
      defaultStyle={{ width: 0, opacity: 0, iconLeft: 0 }}
      style={{
        width: spring(visible ? 180 : 0),
        opacity: spring(visible ? 1 : 0),
        iconLeft: spring(visible ? 27 : 0),
      }}
    >
      {value =>
        !visible ? (
          <span data-tip={_l('搜索')} style={{ height: 28, marginRight: 6 }}>
            <IconBtn className="Hand ThemeHoverColor3" onClick={() => setVisible(true)}>
              <i className="icon icon-search"></i>
            </IconBtn>
          </span>
        ) : (
          <div className={cx('searchIcon flexRow', className)}>
            <i className="icon icon-search Gray_9e Font20 Hand" style={{ left: value.iconLeft }}></i>
            <div
              className="searchInput"
              style={{ width: value.width, backgroundColor: `rgba(234, 234, 234, ${value.opacity})` }}
            >
              <Input
                manualRef={inputRef}
                placeholder={_l('搜索') + '"' + control.controlName + '"'}
                value={keywords}
                onChange={setKeywords}
                onBlur={() => {
                  if (!props.keywords && !keywords && visible) {
                    setVisible(false);
                  }
                }}
                onKeyDown={e => {
                  if (e.keyCode === 13) {
                    onSearch(keywords);
                  }
                }}
              />
              {props.keywords && visible && (
                <i
                  className="icon icon-cancel Gray_9e Font16 clearKeywords"
                  onClick={e => {
                    e.stopPropagation();
                    setKeywords('');
                    onSearch('');
                    setVisible(false);
                  }}
                ></i>
              )}
            </div>
          </div>
        )
      }
    </Motion>
  );
}

AnimatedInput.propTypes = {
  control: shape({}),
  className: string,
  keywords: string,
  onSearch: func,
};

function Operate(props) {
  const {
    mode,
    cache,
    tableId,
    smallMode,
    style,
    className,
    base = {},
    tableState = {},
    recordTitle,
    formData,
    changes = {},
    records,
    iseditting,
    appendRecords,
    handleAddRelation,
    handleRemoveRelation,
    updatePageIndex,
    updatePageSize,
    refresh,
    loadRecords,
    search,
    updateTableState,
    handleOpenRecordInfo,
    updateWorksheetControls,
    deleteOriginalRecords,
    updateBase,
    batchUpdateRecords,
    isDraft,
    controls,
  } = props;
  const { addedRecords } = changes;
  const {
    from,
    isCharge,
    appId,
    viewId,
    control,
    allowEdit,
    searchMaxCount,
    worksheetId,
    recordId,
    isTreeTableView,
    addVisible,
    relateWorksheetInfo,
    sheetSwitchPermit,
    selectVisible,
    allowRemoveRelation,
    allowDeleteFromSetting,
    allowExportFromSetting,
  } = base;
  const {
    tableLoading,
    keywords,
    pageIndex,
    pageSize,
    count,
    isBatchEditing,
    selectedRowIds,
    countForShow,
    filterControls = [],
  } = tableState;
  const allowBatchEdit = base.allowBatchEdit && !!records.length;
  const cacheStore = useRef({});
  const workSheetFilterContainerRef = useRef(null);
  const worksheetFilterRef = useRef(null);
  const columns = getVisibleControls(control, controls);
  const { batchcancel = '1', batchdelete = '1', batchedit = '1', batchexport = '1' } = control.advancedSetting;
  const handleBatchUpdateRecords = useCallback(
    ({ activeControl } = {}) => {
      batchUpdateRecords({ selectedRowIds, records, activeControl });
    },
    [selectedRowIds],
  );
  useEffect(() => {
    if (!isEmpty(cacheStore.current.oldFilterControls) && isEmpty(filterControls)) {
      if (worksheetFilterRef.current) {
        worksheetFilterRef.current.reset();
      }
    }
    cacheStore.current.oldFilterControls = filterControls;
  }, [filterControls]);
  useEffect(() => {
    emitter.emit(`relationSearchCount:${control.controlId}`, count);
  }, [count]);
  return (
    <Con className={className} style={style} smallMode={smallMode} ref={workSheetFilterContainerRef}>
      {(addVisible || selectVisible || allowBatchEdit) && (
        <RelateRecordBtn
          btnVisible={{
            enterBatchEdit: allowBatchEdit,
            edit: allowEdit && batchedit === '1',
            removeRelation: allowRemoveRelation && batchcancel === '1',
            deleteRecords: !!recordId && allowDeleteFromSetting && batchdelete === '1',
            exportRecords:
              allowExportFromSetting &&
              !!recordId &&
              from !== RECORD_INFO_FROM.DRAFT &&
              control.recordInfoFrom !== RECORD_INFO_FROM.WORKFLOW &&
              batchexport === '1',
          }}
          isBatchEditing={isBatchEditing}
          btnName={_.get(relateWorksheetInfo, 'advancedSetting.btnname')}
          entityName={
            getTranslateInfo(appId, null, control.dataSource).recordName ||
            relateWorksheetInfo.entityName ||
            control.sourceEntityName ||
            ''
          }
          addVisible={addVisible}
          selectVisible={selectVisible}
          selectedRowIds={selectedRowIds}
          onNew={() => {
            addRecord({
              worksheetId: control.dataSource,
              masterRecord: base.saveSync
                ? {
                    rowId: recordId,
                    controlId: control.controlId,
                    worksheetId,
                  }
                : undefined,
              defaultRelatedSheet: control.type !== 51 && {
                worksheetId,
                relateSheetControlId: control.controlId,
                value: actions.getDefaultRelatedSheetValue(formData, recordId),
              },
              needCache: recordId || worksheetId !== control.dataSource,
              directAdd: true,
              showFillNext: true,
              isDraft,
              onAdd: record => {
                if (record) {
                  appendRecords([record]);
                }
              },
              openRecord: id => handleOpenRecordInfo({ recordId: id }),
              handleAddRelation:
                control.type === 29
                  ? selectedRecords => {
                      handleAddRelation(selectedRecords);
                    }
                  : undefined,
            });
          }}
          onSelect={() => {
            selectRecords({
              canSelectAll: true,
              multiple: true,
              control: { ...control, recordId: recordId },
              allowNewRecord: false,
              viewId: control.viewId,
              parentWorksheetId: worksheetId,
              controlId: control.controlId,
              recordId,
              worksheetId: relateWorksheetInfo.worksheetId,
              isDraft: from === RECORD_INFO_FROM.DRAFT || control.from === RECORD_INFO_FROM.DRAFT,
              filterRowIds: (relateWorksheetInfo.worksheetId === worksheetId ? [recordId] : []).concat(
                recordId && from !== 21 && base.saveSync
                  ? []
                  : (base.saveSync ? records : records.concat(addedRecords)).map(r => r.rowid),
              ),
              onOk: async selectedRecords => {
                handleAddRelation(selectedRecords);
              },
              formData,
            });
          }}
          onBatchOperate={({ action }) => {
            let allowDeleteRowIds;
            switch (action) {
              case 'enterBatchEditing':
                cache.current.lastSelectRowIndex = undefined;
                updateTableState({
                  isBatchEditing: true,
                });
                break;
              case 'exitBatchEditing':
                updateTableState({
                  isBatchEditing: false,
                  selectedRowIds: [],
                });
                break;
              case 'removeRelation':
                // 批量取消关联
                handleRemoveRelation(selectedRowIds);
                break;
              case 'deleteRecords':
                allowDeleteRowIds = selectedRowIds.filter(rowId => {
                  const selectedRow = find(records, { rowid: rowId });
                  return selectedRow && selectedRow.allowdelete;
                });
                if (!allowDeleteRowIds.length) {
                  alert(_l('没有有权限删除的记录'), 3);
                  return;
                }
                if (allowRemoveRelation) {
                  Dialog.confirm({
                    onlyClose: true,
                    title: (
                      <span className="Bold" style={{ color: '#f44336' }}>
                        {_l('注意：此操作将删除原始记录')}
                      </span>
                    ),
                    description: _l('如果只需要取消与当前记录的关联关系，仍保留原始记录。可以选择仅取消关联关系'),
                    buttonType: 'danger',
                    cancelType: 'ghostgray',
                    okText: _l('删除记录'),
                    cancelText: _l('仅取消关联关系'),
                    onOk: () => {
                      deleteOriginalRecords({
                        recordIds: allowDeleteRowIds,
                      });
                    },
                    onCancel: () => handleRemoveRelation(selectedRowIds),
                  });
                } else {
                  Dialog.confirm({
                    title: _l('是否删除此条记录'),
                    buttonType: 'danger',
                    onOk: () => {
                      deleteOriginalRecords({
                        recordIds: allowDeleteRowIds,
                      });
                    },
                  });
                }
                break;
              case 'exportRecords':
                exportRelateRecordRecords({
                  appId: relateWorksheetInfo.appId,
                  worksheetId: relateWorksheetInfo.worksheetId,
                  downLoadUrl: relateWorksheetInfo.downLoadUrl,
                  viewId: control.viewId,
                  projectId: relateWorksheetInfo.projectId,
                  exportControlsId: control.showControls,
                  rowIds: selectedRowIds,
                });
                break;
              case 'edit':
                handleBatchUpdateRecords();
                break;
            }
          }}
        />
      )}
      <div className="flex"></div>
      {!isBatchEditing && (
        <div
          className={cx('operateButtons flexRow alignItemsCenter', { isInForm: base.isInForm && mode !== 'dialog' })}
        >
          {!!recordId && <AnimatedInput className="mRight6" keywords={keywords} control={control} onSearch={search} />}
          {!isTreeTableView &&
            !control.isCustomButtonFillRecord &&
            !get(window, 'shareState.shareId') &&
            control.type !== 51 &&
            recordId && (
              <WorkSheetFilter
                style={{ paddingTop: 8 }}
                disableAdd={iseditting}
                filterCompId={tableId}
                ref={worksheetFilterRef}
                className="actionWrap"
                isCharge={isCharge}
                // appPkg={appPkg}
                getPopupContainer={() => document.body}
                zIndex={1000}
                sheetSwitchPermit={sheetSwitchPermit}
                appId={relateWorksheetInfo.appId}
                viewId={control.viewId}
                projectId={relateWorksheetInfo.projectId}
                worksheetId={control.dataSource}
                columns={columns.map(c => ({ ...c, controlPermissions: '111' }))}
                filterResigned={false}
                showSavedFilters={false}
                onChange={({ searchType, filterControls }) => {
                  updateTableState({
                    filterControls,
                  });
                  loadRecords({ pageIndex: 1 });
                }}
              />
            )}
          {from !== RECORD_INFO_FROM.DRAFT &&
            allowExportFromSetting &&
            !!recordId &&
            !get(window, 'shareState.shareId') && (
              <ExportSheetButton
                className="mRight6"
                style={{
                  height: 28,
                }}
                exportSheet={cb => {
                  if (!records.length) {
                    cb();
                    alert(_l('数据为空，暂不支持导出！'), 3);
                    return;
                  }
                  return exportRelateRecordRecords({
                    worksheetId,
                    rowId: recordId,
                    controlId: control.controlId,
                    filterControls: control.type === 51 ? filterControls : [],
                    fileName:
                      `${recordTitle ? recordTitle + '_' : ''}${control.controlName}_${moment().format(
                        'YYYYMMDDHHmmss',
                      )}`.trim() + '.xlsx',
                    onDownload: cb,
                  });
                }}
              />
            )}
          {!isBatchEditing &&
            from !== 21 &&
            !!recordId &&
            (base.isTab || _.isEqual(changes, initialChanges) || _.isEmpty(changes)) && (
              <span
                className="mRight6"
                data-tip={_l('刷新')}
                style={{ height: 28 }}
                onClick={() => {
                  refresh();
                }}
              >
                <IconBtn className="Hand ThemeHoverColor3">
                  <i className="icon icon-task-later" />
                </IconBtn>
              </span>
            )}
          {mode === 'recordForm' && !!recordId && from !== RECORD_INFO_FROM.DRAFT && (
            <span
              data-tip={_l('全屏')}
              style={{ height: 28, marginRight: 6 }}
              onClick={() =>
                openRelateRelateRecordTable({
                  appId,
                  viewId,
                  worksheetId,
                  recordId,
                  control: { ...control, ...(base.isTab ? { store: undefined } : {}) },
                  allowEdit,
                  formdata: formData,
                  reloadTable: base.isTab ? refresh : () => {},
                  updateWorksheetControls: updatedControls => {
                    updateBase({ control: updatedControls[0] });
                    updateWorksheetControls(updatedControls);
                  },
                })
              }
            >
              <IconBtn className="Hand ThemeHoverColor3">
                <i className="icon icon-worksheet_enlarge" />
              </IconBtn>
            </span>
          )}

          {(!!recordId || control.type === 51) && (
            <Pagination
              allowChangePageSize={base.isTab}
              disabled={tableLoading}
              className="pagination"
              pageIndex={pageIndex}
              pageSize={pageSize}
              allCount={
                control.type === 51 && !isUndefined(searchMaxCount) && count > searchMaxCount ? searchMaxCount : count
              }
              countForShow={countForShow}
              changePageIndex={value => {
                updatePageIndex(value);
              }}
              changePageSize={value => {
                updatePageSize(value);
                localStorage.setItem('relateRecordTablePageSize', value);
              }}
              onPrev={() => {
                updatePageIndex(pageIndex - 1 < 0 ? 0 : pageIndex - 1);
              }}
              onNext={() => {
                updatePageIndex(
                  pageIndex + 1 > Math.ceil(count / pageSize) ? Math.ceil(count / pageSize) : pageIndex + 1,
                );
              }}
            />
          )}
        </div>
      )}
    </Con>
  );
}

Operate.propTypes = {
  mode: string,
  cache: shape({}),
  smallMode: bool,
  style: shape({}),
  className: string,
  base: shape({}),
  tableState: shape({}),
  records: arrayOf(shape({})),
  appendRecords: func,
  handleAddRelation: func,
  handleRemoveRelation: func,
  updatePageIndex: func,
  refresh: func,
  search: func,
  updateTableState: func,
  handleOpenRecordInfo: func,
  updateWorksheetControls: func,
  deleteOriginalRecords: func,
};

export default connect(
  state => ({ ...state }),
  dispatch => ({
    appendRecords: bindActionCreators(actions.appendRecords, dispatch),
    updatePageIndex: bindActionCreators(actions.updatePageIndex, dispatch),
    updatePageSize: bindActionCreators(actions.updatePageSize, dispatch),
    refresh: bindActionCreators(actions.refresh, dispatch),
    loadRecords: bindActionCreators(actions.loadRecords, dispatch),
    batchUpdateRecords: bindActionCreators(actions.batchUpdateRecords, dispatch),
    updateBase: bindActionCreators(actions.updateBase, dispatch),
    search: bindActionCreators(actions.search, dispatch),
    handleAddRelation: bindActionCreators(actions.handleAddRelation, dispatch),
    handleRemoveRelation: bindActionCreators(actions.handleRemoveRelation, dispatch),
    updateTableState: bindActionCreators(actions.updateTableState, dispatch),
    deleteOriginalRecords: bindActionCreators(actions.deleteOriginalRecords, dispatch),
  }),
)(Operate);
