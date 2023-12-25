import React, { useState, useReducer, useEffect, useRef } from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { Modal, Dialog, Checkbox, VerifyPasswordConfirm } from 'ming-ui';
import styled from 'styled-components';
import update from 'immutability-helper';
import worksheetAjax from 'src/api/worksheet';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import WorksheetTable from 'worksheet/components/WorksheetTable';
import { RowHead } from 'worksheet/components/WorksheetTable/components/';
import ColumnHead from './TrashColumnHead';
import TrashBatchOperate from './TrashBatchOperate';
import Header from './Header';
import _ from 'lodash';
import { SHEET_VIEW_HIDDEN_TYPES } from 'worksheet/constants/enum';
import { BrowserRouter } from 'react-router-dom';

const Con = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Body = styled.div`
  flex: 1;
  overflow: hidden;
  margin: 0 -24px;
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
`;

const trashReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_RECORDS':
      return update(state, { $merge: _.omit(action, ['type']) });
    case 'DELETE_RECORD':
      return update(state, {
        records: { $apply: records => records.filter(r => !_.includes(action.ids, r.rowid)) },
        count: { $set: state.count - action.ids.length },
      });
    case 'UPDATE_LOADING':
      return update(state, { loading: { $set: action.loading } });
    case 'CLEAR':
      return { loading: false };
    default:
      return state;
  }
};

const PAGE_SIZE = 50;

const createActions = (dispatch, state) => ({
  loadRows: ({
    appId,
    worksheetId,
    searchType = 1,
    pageIndex,
    pageSize,
    searchText,
    sortControls = [],
    filterControls = [],
  }) => {
    if (sortControls.filter(_.identity).length === 0) {
      sortControls = [
        {
          controlId: 'dtime',
          datatype: 16,
          isAsc: false,
        },
      ];
    }
    dispatch({
      type: 'UPDATE_LOADING',
      loading: true,
    });
    worksheetAjax
      .getFilterRows({
        appId,
        worksheetId,
        searchType,
        pageSize: pageSize,
        pageIndex,
        keyWords: searchText,
        status: 9,
        sortControls: sortControls.filter(_.identity),
        filterControls,
      })
      .then(data => {
        dispatch({
          type: 'UPDATE_RECORDS',
          records: data.data,
          count: data.count,
          pageIndex,
          pageSize,
          filterControls,
          loading: false,
        });
      });
  },
  deleteRecord: ids => {
    dispatch({
      type: 'DELETE_RECORD',
      ids,
    });
  },
  clear: ({ appId, worksheetId }) => {
    worksheetAjax
      .removeWorksheetRows({
        appId,
        worksheetId,
      })
      .then(() => {
        dispatch({
          type: 'CLEAR',
        });
        alert(_l('已清空回收站'));
      });
  },
});

export default function WorkSheetTrash(props) {
  const {
    isCharge,
    projectId,
    appId,
    viewId,
    worksheetId,
    controls = [],
    worksheetInfo = {},
    reloadWorksheet = () => {},
    onCancel = () => {},
  } = props;
  const headerRef = useRef();
  const needRestoreRelation = useRef(true);
  const [isAll, setIsAll] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selectRows, setSelectRows] = useState([]);
  const [sortControl, setSortControl] = useState();
  const [disableMaskDataControls, setDisableMaskDataControls] = useState({});
  const [state, dispatch] = useReducer(trashReducer, { records: [] });
  const {
    loading = true,
    count = 0,
    pageIndex = 1,
    pageSize = PAGE_SIZE,
    records = [],
    filterControls,
    searchText = '',
  } = state;
  const lineNumberBegin = (pageIndex - 1) * pageSize;
  const hasAuthRows = selectRows.filter(item => item.allowedit || item.allowEdit);
  const hasAuthRowIds = hasAuthRows.map(item => item.rowid);
  const actions = createActions(dispatch, state);
  const controlsForShow = controls
    .filter(
      column =>
        !_.includes(SHEET_VIEW_HIDDEN_TYPES, column.type) &&
        !_.includes(['utime', 'uaid'], column.controlId) &&
        controlState(column).visible,
    )
    .map(c =>
      disableMaskDataControls[c.controlId]
        ? {
            ...c,
            advancedSetting: Object.assign({}, c.advancedSetting, {
              datamask: '0',
            }),
          }
        : c,
    )
    .concat([
      {
        controlId: 'dtime',
        controlName: _l('删除时间'),
        type: 16,
      },
      {
        controlId: 'daid',
        controlName: _l('删除者'),
        type: 26,
      },
    ]);
  function loadRows(args) {
    actions.loadRows(
      Object.assign({}, { appId, worksheetId, pageIndex, pageSize, sortControls: [sortControl], filterControls }, args),
    );
  }
  useEffect(() => {
    loadRows({ appId, worksheetId, pageIndex, sortControls: [sortControl] });
  }, []);
  return (
    <BrowserRouter>
      <Modal
        visible
        closable={false}
        width={document.body.clientWidth * 0.9}
        type="fixed"
        bodyStyle={{ paddingTop: 0, position: 'relative' }}
        closeStyle={{ margin: '16px', width: '30px', height: '30px', lineHeight: '30px' }}
      >
        <Con>
          <TrashBatchOperate
            isCharge={isCharge}
            isAll={isAll}
            selectedLength={isAll ? count - selected.length : selected.length}
            totalLength={records.length}
            entityName={worksheetInfo.entityName}
            onRestore={() => {
              if (!isAll && hasAuthRowIds.length === 0) {
                alert(_l('无权限恢复选择的记录'), 3);
                setSelected([]);
              } else {
                const restore = () => {
                  const args = {
                    appId,
                    worksheetId,
                    rowIds: hasAuthRowIds,
                  };
                  if (isAll) {
                    delete args.rowIds;
                    args.isAll = true;
                    args.excludeRowIds = hasAuthRowIds;
                    args.filterControls = filterControls;
                  }
                  args.restoreRelation = !!needRestoreRelation.current;
                  worksheetAjax.restoreWorksheetRows(args).then(res => {
                    if (!res.isSuccess) {
                      alert(_l('恢复失败'), 3);
                      return;
                    }
                    setIsAll(false);
                    if (res.successCount === selected.length || isAll) {
                      alert(_l('恢复成功'));
                      setSelected([]);
                      reloadWorksheet();
                      actions.deleteRecord(hasAuthRowIds);
                    } else {
                      alert(_l('恢复成功，部分数据已被彻底删除无法恢复'));
                      setSelected([]);
                      reloadWorksheet();
                      return;
                    }
                    setTimeout(
                      () => {
                        loadRows({ pageIndex: 1 });
                      },
                      isAll ? 1000 : 0,
                    );
                  });
                };
                if (controls.find(c => c.type === 29)) {
                  Dialog.confirm({
                    title: _l('恢复记录'),
                    description: (
                      <Checkbox
                        defaultChecked={!!needRestoreRelation.current}
                        text={_l('恢复记录同时恢复关联关系')}
                        onClick={checked => {
                          needRestoreRelation.current = checked;
                        }}
                      />
                    ),
                    onOk: restore,
                  });
                } else {
                  restore();
                }
              }
            }}
            onCancel={() => {
              setIsAll(false);
              setSelected([]);
              setSelectRows([]);
            }}
            onHardDelete={() => {
              VerifyPasswordConfirm.confirm({
                title: (
                  <div className="Bold" style={{ color: '#f44336', display: 'flex', alignItems: 'center' }}>
                    <i className="icon-error error" style={{ fontSize: '28px', marginRight: '8px' }}></i>
                    {_l('彻底删除%0', worksheetInfo.entityName)}
                  </div>
                ),
                description: (
                  <div className="Font14 Gray_75">
                    {_l('记录删除后无法恢复，请确认您和工作表成员都不再需要这些记录再行删除。')}
                  </div>
                ),
                confirmType: 'danger',
                allowNoVerify: false,
                onOk: () => {
                  if (!isAll && hasAuthRowIds.length === 0) {
                    alert(_l('无权限删除选择的记录'), 3);
                    setSelected([]);
                  } else {
                    const args = {
                      worksheetId,
                      appId,
                      rowIds: hasAuthRowIds,
                    };
                    if (isAll) {
                      delete args.rowIds;
                      args.isAll = true;
                      args.excludeRowIds = hasAuthRowIds;
                    }
                    worksheetAjax.removeWorksheetRows(args).then(() => {
                      if (selectRows.length === selected.length || isAll) {
                        alert(_l('删除成功'));
                      } else {
                        alert(_l('删除成功，无编辑权限的记录无法删除'));
                      }
                      setIsAll(false);
                      setSelected([]);
                      reloadWorksheet();
                      if (isAll) {
                        setTimeout(() => {
                          loadRows({ pageIndex: 1 });
                        }, 1000);
                        return;
                      }
                      actions.deleteRecord(hasAuthRowIds);
                    });
                  }
                },
              });
            }}
          />
          <Header
            ref={headerRef}
            entityName={worksheetInfo.entityName}
            title={`${_l('回收站')}（${worksheetInfo.name}）`}
            isCharge={isCharge}
            projectId={projectId}
            appId={appId}
            viewId={viewId}
            worksheetId={worksheetId}
            controls={controlsForShow}
            pageSize={pageSize}
            pageIndex={pageIndex}
            count={count}
            onCancel={onCancel}
            loadRows={loadRows}
            onClear={() => actions.clear({ worksheetId, appId })}
            onSearch={keywords => loadRows({ pageIndex: 1, searchText: keywords })}
            onReload={() => loadRows({ pageIndex: 1, searchText: '' })}
            changePageSize={newPageSize => loadRows({ pageSize: newPageSize, pageIndex: 1 })}
            changePageIndex={newPageIndex => loadRows({ pageIndex: newPageIndex })}
          />
          <Body>
            <WorksheetTable
              isTrash
              appId={appId}
              loading={loading}
              viewId={viewId}
              projectId={projectId}
              noRenderEmpty={!searchText}
              lineNumberBegin={lineNumberBegin}
              columns={controlsForShow}
              rowHeight={34}
              selectedIds={selected}
              data={records}
              renderColumnHead={({ control, ...rest }) => (
                <ColumnHead
                  {...rest}
                  control={
                    disableMaskDataControls[control.controlId]
                      ? {
                          ...control,
                          advancedSetting: Object.assign({}, control.advancedSetting, {
                            datamask: '0',
                          }),
                        }
                      : control
                  }
                  worksheetId={worksheetId}
                  type="trash"
                  selected={!!selected.length}
                  isAsc={control.controlId === (sortControl || {}).controlId ? (sortControl || {}).isAsc : undefined}
                  changeSort={newIsAsc => {
                    const newSortControl = _.isUndefined(newIsAsc)
                      ? {}
                      : {
                          controlId: control.controlId,
                          isAsc: newIsAsc,
                        };
                    setSortControl(newSortControl);
                    loadRows({
                      sortControls: _.isUndefined(newIsAsc)
                        ? []
                        : [
                            {
                              datatype: control.type,
                              ...newSortControl,
                            },
                          ],
                    });
                  }}
                  onShowFullValue={() => {
                    setDisableMaskDataControls({ ...disableMaskDataControls, [control.controlId]: true });
                  }}
                />
              )}
              renderRowHead={({ className, style, rowIndex, row }) => (
                <RowHead
                  isTrash
                  canSelectAll
                  className={className}
                  style={{ ...style, width: String(lineNumberBegin + rowIndex).length * 8 + 64 }}
                  lineNumberBegin={lineNumberBegin}
                  allWorksheetIsSelected={isAll}
                  selectedIds={selected}
                  onSelectAllWorksheet={() => {
                    setIsAll(!isAll);
                    setSelected([]);
                    setSelectRows([]);
                  }}
                  onSelect={newSelected => {
                    let newSelectRows = [];
                    if (isAll) {
                      newSelected.forEach(rowId => {
                        newSelectRows = records.filter(r => _.find(newSelected, id => r.rowid !== id));
                        newSelected = newSelectRows.map(r => r.rowid);
                      });
                      setIsAll(false);
                    } else {
                      newSelected.forEach(rowId => {
                        const row = _.find(records, trashRow => trashRow.rowid === rowId);
                        if (row && (row.allowedit || row.allowEdit)) {
                          newSelectRows.push(row);
                        }
                      });
                      setIsAll(false);
                    }
                    setSelected(newSelected);
                    setSelectRows(newSelectRows);
                  }}
                  onReverseSelect={() => {
                    if (isAll) {
                      setIsAll(false);
                      setSelected([]);
                      setSelectRows([]);
                    } else {
                      const newSelectedRows = records
                        .filter(r => !_.find(selected, selectedRowId => selectedRowId === r.rowid))
                        .filter(_.identity);
                      setSelectRows(newSelectedRows);
                      setSelected(newSelectedRows.map(r => r.rowid));
                    }
                  }}
                  rowIndex={rowIndex}
                  data={records}
                />
              )}
              emptyIcon={
                <SearchIcon>
                  <i className="icon icon-search" />
                </SearchIcon>
              }
              emptyText={_l('没有搜索结果')}
            />
          </Body>
        </Con>
      </Modal>
    </BrowserRouter>
  );
}

WorkSheetTrash.propTypes = {
  isCharge: bool,
  projectId: string,
  appId: string,
  viewId: string,
  worksheetId: string,
  controls: arrayOf(shape({})),
  worksheetInfo: shape({}),
  reloadWorksheet: func,
  onCancel: func,
};
