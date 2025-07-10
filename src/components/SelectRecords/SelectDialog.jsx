import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useKey, useKeyPressEvent } from 'react-use';
import {
  debounce,
  find,
  findIndex,
  get,
  identity,
  isEmpty,
  isNumber,
  isUndefined,
  union,
  unionBy,
  values,
} from 'lodash';
import styled from 'styled-components';
import { Button, Menu, MenuItem, Modal } from 'ming-ui';
import addRecord from 'worksheet/common/newRecord/addRecord';
import { openRecordInfo } from 'worksheet/common/recordInfo';
import ColumnHead from 'worksheet/components/BaseColumnHead';
import Pagination from 'worksheet/components/Pagination';
import WorksheetTable from 'worksheet/components/WorksheetTable';
import 'src/pages/worksheet/components/WorksheetTable/components/ColumnHead/ColumnHead.less';
import { checkIsTextControl, isRelateRecordTableControl } from 'src/utils/control';
import { replaceControlsTranslateInfo } from 'src/utils/translate';
import { getSheetStylesOfRelateRecordTable } from 'src/utils/worksheet';
import Header from './Header';
import RowHead from './RowHeadForSelectRecords';
import SelectedInfo from './SelectedInfo';
import useRecords, { ERROR_MESSAGE, getWorksheetInfo } from './useRecords';

const Con = styled.div`
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Table = styled.div`
  flex: 1;
  margin: 17px 0;
  position: relative;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  .worksheetTableComp,
  .tableBorder {
    border: none !important;
  }
  .cell {
    cursor: pointer;
  }
  &.noSelect {
    * {
      user-select: none !important;
    }
  }
`;

const AbnormalTableCon = styled.div`
  flex: 1;
  margin: 17px 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Loading = styled.div`
  flex: 1;
  margin: 17px 0;
  position: relative;
`;

const Footer = styled.div`
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SearchIcon = styled.div`
  width: 130px;
  height: 130px;
  background-color: #f5f5f5;
  display: inline-block;
  border-radius: 130px;
  text-align: center;
  line-height: 130px;
  font-size: 80px;
  color: #c2c3c3;
  margin-bottom: 12px;
  flex-shrink: 0;
`;

const RefreshBtn = styled.div`
  position: absolute;
  font-size: 22px;
  color: #9e9e9e;
  width: 32px;
  height: 40px;
  right: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const PAGE_SIZE = 100;

function getTitleControl(control, controls) {
  let titleControl =
    get(control, 'advancedSetting.showtitleid') &&
    find(controls, { controlId: get(control, 'advancedSetting.showtitleid') });
  if (!titleControl) {
    const attributeTitle = find(controls, { attribute: 1 });
    titleControl = attributeTitle;
  }
  return titleControl;
}

function getTableConfig(controlsForShow, { titleControl, coverControl } = {}) {
  let fixedColumnCount = 1;
  let visibleControls = controlsForShow;
  if (titleControl) {
    visibleControls = [titleControl].concat(visibleControls.filter(c => c.controlId !== titleControl.controlId));
  }
  if (coverControl) {
    fixedColumnCount += 1;
    visibleControls = [coverControl].concat(visibleControls.filter(c => c.controlId !== coverControl.controlId));
  }
  return {
    visibleControls,
    fixedColumnCount,
  };
}

function getEmptyText({ keyWords, error } = {}) {
  if (error) {
    return ERROR_MESSAGE[error];
  }
  return keyWords ? _l('没有搜索结果') : _l('暂无记录');
}

function getNumFromLocalStorage(key, defaultValue) {
  return localStorage.getItem(key) &&
    !isNaN(Number(localStorage.getItem(key))) &&
    isNumber(Number(localStorage.getItem(key)))
    ? Number(localStorage.getItem(key))
    : defaultValue;
}

export default function SelectDialog({ ...args }) {
  const {
    singleConfirm,
    isCharge,
    appId,
    viewId,
    projectId,
    control = {},
    controlId,
    multiple,
    isDraft,
    recordId,
    defaultRelatedSheet,
    filterRelatesheetControlIds,
    parentWorksheetId,
    formData,
    allowNewRecord,
    selectedCount,
    maxCount,
    filterRowIds = [],
    ignoreRowIds = [],
    onClose,
    onOk,
  } = args;
  const worksheetId = control.dataSource || args.worksheetId;
  const {
    loading,
    recordsLoading,
    worksheetInfo,
    error,
    records,
    total,
    sortControl,
    pageIndex,
    pageSize,
    keyWords,
    searchConfig,
    quickFilters,
    changePageIndex,
    changePageSize,
    setIgnoreAllFilters,
    setRecords,
    refresh,
    handleUpdateKeyWords,
    handleUpdateSortControl,
    handleUpdateQuickFilters,
  } = useRecords({
    appId,
    worksheetId,
    viewId,
    projectId,
    control,
    defaultPageSize: getNumFromLocalStorage('selectRecordsPageSize', PAGE_SIZE),
    recordId,
    isDraft,
    controlId,
    parentWorksheetId,
    ignoreRowIds,
    filterRowIds,
    formData,
  });
  const recordsCache = useRef({});
  const tableRef = useRef();
  const cache = useRef({});
  const [activeRowIndex, setActiveRowIndex] = useState(-1);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [tempSheetColumnWidths, setTempSheetColumnWidths] = useState({});
  const allowShowIgnoreAllFilters = isCharge && recordId === 'FAKE_RECORD_ID_FROM_BATCH_EDIT';
  const showNewRecord =
    !loading && allowNewRecord && (get(window, 'shareState.isPublicFormPreview') ? false : worksheetInfo.allowAdd);
  const lineNumberBegin = 0;
  const controls = replaceControlsTranslateInfo(worksheetInfo.appId, null, get(worksheetInfo, 'template.controls', []));
  const showControls = control.showControls || args.showControls || [];
  let controlsForShow = (
    get(control, 'advancedSetting.chooseshow') === '1'
      ? safeParse(get(control, 'advancedSetting.chooseshowids'), 'array')
      : showControls
  )
    .map(controlId => find(controls, { controlId }))
    .filter(identity);
  const titleControl = getTitleControl(control, controls);
  const { clickSearch } = searchConfig;
  const isWaitToClickSearch = clickSearch && !keyWords;
  const showTable = !loading && !isWaitToClickSearch;
  if (isEmpty(controlsForShow)) {
    controlsForShow = [titleControl].filter(identity);
  }
  const coverControl = get(control, 'coverCid') && find(controls, { controlId: get(control, 'coverCid') });
  const tableConfig = getTableConfig(controlsForShow, {
    titleControl: !isRelateRecordTableControl(control) && titleControl,
    coverControl: !isRelateRecordTableControl(control) && coverControl,
  });
  const sheetStyles =
    !loading &&
    getSheetStylesOfRelateRecordTable({
      control,
      viewId: control.viewId,
      worksheetInfo,
    });
  const [fixedColumnCount, setFixedColumnCount] = useState(tableConfig.fixedColumnCount || 2);
  const summaryConfig = safeParse(get(control, 'advancedSetting.reportsetting'), 'array');
  const summaryControls = summaryConfig
    .map(({ controlId, type }) => {
      if (type === 0) return null;
      const matchedControl = find(controlsForShow, { controlId });
      return (
        matchedControl && {
          ...matchedControl,
          summaryType: type,
        }
      );
    })
    .filter(identity);

  const handleToggleSelect = useCallback(
    (toggleRowId, rowIndex = 0) => {
      setActiveRowIndex(rowIndex);
      if (multiple) {
        setSelectedRowIds(prev => {
          const selectIndex = findIndex(
            unionBy(records.concat(values(recordsCache.current)), 'rowid'),
            r => r.rowid === toggleRowId,
          );
          if (cache.current.shiftActive && !!prev.length) {
            let startIndex = Math.min(...[selectIndex, cache.current.shiftActiveRowIndex]);
            let endIndex = Math.max(...[selectIndex, cache.current.shiftActiveRowIndex]);
            if (endIndex > records.length - 1) {
              endIndex = records.length - 1;
            }
            return union(
              unionBy(records.concat(values(recordsCache.current)), 'rowid')
                .slice(startIndex, endIndex + 1)
                .map(r => r.rowid)
                .concat(prev),
            );
          }
          cache.current.shiftActiveRowIndex = selectIndex;
          if (prev.includes(toggleRowId)) {
            return prev.filter(id => id !== toggleRowId);
          }
          return [...prev, toggleRowId];
        });
      } else {
        const toggleRow = find(records.concat(values(recordsCache.current)), record => record.rowid === toggleRowId);
        setSelectedRowIds([toggleRowId]);
        onOk([toggleRow]);
        onClose();
      }
    },
    [multiple, selectedCount, maxCount, records],
  );

  const width = window.innerWidth - 32 * 2 > 1600 ? 1600 : window.innerWidth - 32 * 2;
  const handleInputKeyDown = useCallback(
    e => {
      if (e.key === 'Enter') {
        if (activeRowIndex !== -1) {
          handleToggleSelect(records[activeRowIndex].rowid, activeRowIndex);
        }
      } else if (e.key === 'ArrowDown') {
        const newActiveRowIndex = activeRowIndex + 1;
        if (newActiveRowIndex < records.length && isNumber(newActiveRowIndex) && !isNaN(newActiveRowIndex)) {
          setActiveRowIndex(newActiveRowIndex);
        }
        tableRef.current.table.focusRow(newActiveRowIndex);
      } else if (e.key === 'ArrowUp') {
        const newActiveRowIndex = activeRowIndex - 1;
        if (newActiveRowIndex >= 0 && isNumber(newActiveRowIndex) && !isNaN(newActiveRowIndex)) {
          setActiveRowIndex(newActiveRowIndex);
        }
        tableRef.current.table.focusRow(newActiveRowIndex);
      }
    },
    [activeRowIndex, records],
  );
  const handleConfirm = useCallback(() => {
    if (!selectedRowIds.length) return;
    const selectedRecords = selectedRowIds.map(id =>
      find(records.concat(values(recordsCache.current)), record => record.rowid === id),
    );
    if (!isUndefined(selectedCount) && selectedCount + selectedRecords.length > maxCount) {
      alert(_l('最多关联%0条', maxCount), 3);
      return;
    }
    onOk(selectedRecords);
    onClose();
  }, [selectedRowIds, records, selectedCount, maxCount]);
  useKeyPressEvent(
    'Shift',
    () => {
      cache.current.shiftActive = true;
      document.querySelector('#selectRecordsTableCon') &&
        document.querySelector('#selectRecordsTableCon').classList.add('noSelect');
    },
    () => {
      cache.current.shiftActive = false;
      document.querySelector('#selectRecordsTableCon') &&
        document.querySelector('#selectRecordsTableCon').classList.remove('noSelect');
    },
  );
  useKeyPressEvent('Enter', e => {
    if (e.ctrlKey || e.metaKey) {
      handleConfirm();
    }
  });
  useEffect(() => {
    setFixedColumnCount(tableConfig.fixedColumnCount);
  }, [tableConfig.fixedColumnCount]);
  useEffect(() => {
    selectedRowIds.forEach(selectedRowId => {
      if (!recordsCache.current[selectedRowId]) {
        recordsCache.current[selectedRowId] = find(records, record => record.rowid === selectedRowId);
      }
    });
  }, [selectedRowIds, records]);
  useEffect(() => {
    return () => {
      document.querySelector('#selectRecordsTableCon') &&
        document.querySelector('#selectRecordsTableCon').classList.remove('noSelect');
    };
  }, []);
  return (
    <Modal
      visible
      className="selectRecordsDialog contentScroll"
      footer={null}
      onCancel={() => {
        onClose();
      }}
      type="fixed"
      style={{ minWidth: width }}
      verticalAlign="bottom"
      bodyStyle={{
        padding: 0,
        position: 'relative',
        height: '100%',
        flex: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Con>
        <RefreshBtn onClick={refresh}>
          <i className="icon icon-task-later ThemeHoverColor3"></i>
        </RefreshBtn>
        <Header
          loading={loading}
          showNewRecord={showNewRecord}
          entityName={worksheetInfo.entityName}
          btnName={get(worksheetInfo, 'advancedSetting.btnname')}
          projectId={worksheetInfo.projectId}
          appId={worksheetInfo.appId}
          worksheetId={worksheetId}
          control={control}
          searchConfig={searchConfig}
          controls={controls}
          quickFilters={quickFilters}
          onSearch={debounce(handleUpdateKeyWords, 500)}
          onFilter={handleUpdateQuickFilters}
          onNewRecord={() => {
            if (!isUndefined(selectedCount) && selectedCount + selectedRowIds.length > maxCount) {
              alert(_l('最多关联%0条', maxCount), 3);
              return;
            }
            addRecord({
              className: 'worksheetRelateNewRecord worksheetRelateNewRecordFromSelectRelateRecord',
              viewId,
              worksheetId,
              projectId: worksheetInfo.projectId,
              masterRecordRowId: recordId,
              addType: 2,
              entityName: worksheetInfo.entityName,
              filterRelateSheetIds: [worksheetId],
              filterRelatesheetControlIds,
              defaultFormDataEditable: true,
              isDraft,
              defaultFormData:
                searchConfig.searchControl && checkIsTextControl(searchConfig.searchControl.type) && keyWords
                  ? {
                      [searchConfig.searchControl.controlId]: keyWords,
                    }
                  : {},
              defaultRelatedSheet,
              onAdd: row => {
                if (multiple || singleConfirm) {
                  setRecords(prev => [row, ...prev]);
                  handleToggleSelect(row.rowid, 0);
                } else {
                  onOk([row]);
                  onClose();
                }
              },
            });
          }}
          onKeyDown={handleInputKeyDown}
        />
        {showTable && (
          <Fragment>
            {loading ? (
              <Loading />
            ) : (
              <Table id="selectRecordsTableCon">
                <WorksheetTable
                  ref={tableRef}
                  enableRules={false}
                  triggerClickImmediate
                  rowHeadWidth={66}
                  appId={appId}
                  loading={recordsLoading}
                  viewId={viewId}
                  projectId={projectId}
                  showSearchEmpty={!records.length && !loading && !recordsLoading}
                  keyWords={error ? '' : keyWords}
                  lineNumberBegin={lineNumberBegin}
                  fixedColumnCount={fixedColumnCount}
                  sheetColumnWidths={Object.assign(
                    sheetStyles ? sheetStyles.sheetColumnWidths : {},
                    tempSheetColumnWidths,
                    tempSheetColumnWidths,
                  )}
                  onColumnWidthChange={(controlId, value) => {
                    setTempSheetColumnWidths(prev => ({ ...prev, [controlId]: value }));
                  }}
                  columnStyles={sheetStyles ? sheetStyles.columnStyles : {}}
                  columns={tableConfig.visibleControls}
                  rowHeight={!isRelateRecordTableControl(control) && coverControl ? 88 : 34}
                  data={records}
                  sheetViewHighlightRows={
                    activeRowIndex > -1 && records[activeRowIndex] ? { [records[activeRowIndex].rowid]: true } : {}
                  }
                  onCellClick={(clickedControl, clickedRow, rowIndex) => {
                    handleToggleSelect(clickedRow.rowid, rowIndex);
                  }}
                  renderColumnHead={({ control, ...rest }) => {
                    const { columnIndex } = rest;
                    const showFrozen = columnIndex < 11 && !control.hideFrozen && fixedColumnCount !== columnIndex;
                    const showUnFrozen = columnIndex === fixedColumnCount && !control.hideFrozen;
                    const showDropdown = showFrozen || showUnFrozen;
                    return (
                      <ColumnHead
                        {...rest}
                        control={control}
                        worksheetId={worksheetId}
                        showDropdown={showDropdown}
                        renderPopup={({ closeMenu }) => (
                          <Menu className="worksheetColumnHeadMenu" style={{ width: 180 }} onClickAway={closeMenu}>
                            {showFrozen && (
                              <MenuItem
                                onClick={() => {
                                  if (window.isPublicApp) {
                                    alert(_l('预览模式下，不能操作'), 3);
                                    return;
                                  }
                                  setFixedColumnCount(columnIndex);
                                  closeMenu();
                                }}
                              >
                                <i className="icon icon-task-new-locked"></i>
                                {_l('冻结')}
                              </MenuItem>
                            )}
                            {showUnFrozen && (
                              <MenuItem
                                onClick={() => {
                                  setFixedColumnCount(0);
                                  closeMenu();
                                }}
                              >
                                <i className="icon icon-task-new-no-locked"></i>
                                {_l('解冻')}
                              </MenuItem>
                            )}
                          </Menu>
                        )}
                        selected={!!selectedRowIds.length}
                        isAsc={
                          control.controlId === (sortControl || {}).controlId ? (sortControl || {}).isAsc : undefined
                        }
                        changeSort={newIsAsc => {
                          const newSortControl = _.isUndefined(newIsAsc)
                            ? {}
                            : {
                                controlId: control.controlId,
                                isAsc: newIsAsc,
                              };
                          handleUpdateSortControl(newSortControl);
                        }}
                      />
                    );
                  }}
                  renderRowHead={({ className, style, rowIndex, row }) => (
                    <RowHead
                      className={className}
                      style={style}
                      rowIndex={rowIndex}
                      data={records}
                      type={multiple ? 0 : 1}
                      selectedRowIds={selectedRowIds}
                      onToggleSelect={handleToggleSelect}
                      onUpdateSelectedRowIds={setSelectedRowIds}
                      onOpenRecord={() => {
                        openRecordInfo({
                          appId,
                          worksheetId,
                          viewId,
                          projectId,
                          recordId: row.rowid,
                        });
                      }}
                    />
                  )}
                  emptyIcon={
                    <SearchIcon>
                      <i className="iconBox" />
                    </SearchIcon>
                  }
                  emptyText={
                    <div>
                      {getEmptyText({ keyWords, error })}
                      {allowShowIgnoreAllFilters && (
                        <div
                          className="ignoreAllFilters ThemeColor3 Font14 mTop10 Hand"
                          onClick={() => setIgnoreAllFilters(true)}
                        >
                          {_l('查看全部记录')}
                        </div>
                      )}
                    </div>
                  }
                />
              </Table>
            )}
          </Fragment>
        )}
        {isWaitToClickSearch && (
          <AbnormalTableCon>
            <div className="abnormalTableConTitle Font16 Gray_9e">
              {_l('输入%0进行查询', get(searchConfig, 'searchControl.controlName', _l('关键字')))}
            </div>
          </AbnormalTableCon>
        )}
        <Footer>
          <div className="flex">
            {multiple && selectedRowIds.length > 0 && (
              <SelectedInfo
                selectedRowIds={selectedRowIds}
                records={unionBy(records.concat(values(recordsCache.current)), 'rowid')}
                summaryControls={summaryControls}
              />
            )}
          </div>
          {!!total && !selectedRowIds.length && (
            <Pagination
              disabled={loading || recordsLoading}
              appendToBody
              pageIndex={pageIndex}
              pageSize={pageSize}
              allCount={total}
              changePageSize={newPageSize => {
                localStorage.setItem('selectRecordsPageSize', newPageSize);
                changePageSize(newPageSize);
                changePageIndex(1);
              }}
              changePageIndex={changePageIndex}
              onPrev={() => {
                changePageIndex(pageIndex - 1);
              }}
              onNext={() => {
                changePageIndex(pageIndex + 1);
              }}
            />
          )}
          {multiple && (
            <Fragment>
              <Button
                type="link"
                onClick={() => {
                  setSelectedRowIds([]);
                  onClose();
                }}
              >
                {_l('取消')}
              </Button>
              <Button
                type="primary"
                className="tip-top"
                data-tip={window.isMacOs ? '⌘ + Enter' : 'Ctrl + Enter'}
                disabled={!selectedRowIds.length}
                onClick={handleConfirm}
              >
                {_l('确定')}
              </Button>
            </Fragment>
          )}
        </Footer>
      </Con>
    </Modal>
  );
}
