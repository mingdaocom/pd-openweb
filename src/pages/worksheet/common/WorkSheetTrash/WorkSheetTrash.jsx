import React, { useState, useReducer, useEffect, useRef } from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { Modal, Dialog, Checkbox } from 'ming-ui';
import styled from 'styled-components';
import update from 'immutability-helper';
import { getFilterRows, removeWorksheetRows, restoreWorksheetRows } from 'src/api/worksheet';
import WorksheetTable from 'worksheet/components/WorksheetTable';
import { RowHead } from 'worksheet/components/WorksheetTable/components/';
import ColumnHead from './TrashColumnHead';
import TrashBatchOperate from './TrashBatchOperate';
import Header from './Header';

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
    getFilterRows({
      appId,
      worksheetId,
      searchType,
      pageSize: pageSize,
      pageIndex,
      keyWords: searchText,
      status: 9,
      sortControls: sortControls.filter(_.identity),
      filterControls,
    }).then(data => {
      dispatch({
        type: 'UPDATE_RECORDS',
        records: data.data,
        count: data.count,
        pageIndex,
        pageSize,
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
    removeWorksheetRows({
      appId,
      worksheetId,
    }).then(() => {
      dispatch({
        type: 'CLEAR',
      });
      alert(_l('??????????????????'));
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
  const [state, dispatch] = useReducer(trashReducer, { records: [] });
  const { loading = true, count = 0, pageIndex = 1, pageSize = PAGE_SIZE, records = [], searchText = '' } = state;
  const lineNumberBegin = (pageIndex - 1) * pageSize;
  const hasAuthRows = selectRows.filter(item => item.allowedit || item.allowEdit);
  const hasAuthRowIds = hasAuthRows.map(item => item.rowid);
  const actions = createActions(dispatch, state);
  function loadRows(args) {
    actions.loadRows(Object.assign({}, { appId, worksheetId, pageIndex, pageSize, sortControls: [sortControl] }, args));
  }
  useEffect(() => {
    loadRows({ appId, worksheetId, pageIndex, sortControls: [sortControl] });
  }, []);
  return (
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
          selectedLength={selected.length}
          totalLength={records.length}
          entityName={worksheetInfo.entityName}
          onRestore={() => {
            if (hasAuthRowIds.length === 0) {
              alert(_l('??????????????????????????????'), 3);
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
                  args.excludeRowIds = records.filter(r => !_.includes(selected, r.rowid)).map(r => r.rowid);
                }
                args.restoreRelation = !!needRestoreRelation.current;
                restoreWorksheetRows(args).then(res => {
                  if (!res.isSuccess) {
                    alert(_l('????????????'), 3);
                    return;
                  }
                  setIsAll(false);
                  if (res.successCount === selected.length) {
                    alert(_l('????????????'));
                    setSelected([]);
                    reloadWorksheet();
                    actions.deleteRecord(hasAuthRowIds);
                  } else {
                    alert(_l('?????????????????????????????????????????????????????????'));
                    setSelected([]);
                    reloadWorksheet();
                    loadRows({ pageIndex: 1 });
                    return;
                  }
                  if (records.length - hasAuthRowIds === 0 && pageIndex > 1) {
                    loadRows({ pageIndex: 1 });
                  }
                });
              };
              if (controls.find(c => c.type === 29)) {
                Dialog.confirm({
                  title: _l('????????????'),
                  description: (
                    <Checkbox
                      defaultChecked={!!needRestoreRelation.current}
                      text={_l('????????????????????????????????????')}
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
            setSelected([]);
            setSelectRows([]);
          }}
          onHardDelete={() => {
            Dialog.confirm({
              title: <span style={{ color: '#f44336' }}>{_l('????????????%0', worksheetInfo.entityName)}</span>,
              buttonType: 'danger',
              description: _l('??????????????????????????????????????????????????????????????????????????????????????????????????????'),
              okText: _l('??????'),
              onOk: () => {
                if (hasAuthRowIds.length === 0) {
                  alert(_l('??????????????????????????????'), 3);
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
                    args.excludeRowIds = records.filter(r => !_.includes(selected, r.rowid)).map(r => r.rowid);
                  }
                  removeWorksheetRows(args).then(() => {
                    if (selectRows.length === selected.length) {
                      alert(_l('????????????'));
                    } else {
                      alert(_l('???????????????????????????????????????????????????'));
                    }
                    setIsAll(false);
                    setSelected([]);
                    reloadWorksheet();
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
          title={`${_l('?????????')}???${worksheetInfo.name}???`}
          isCharge={isCharge}
          projectId={projectId}
          appId={appId}
          viewId={viewId}
          worksheetId={worksheetId}
          controls={controls}
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
            loading={loading}
            viewId={viewId}
            noRenderEmpty={!searchText}
            lineNumberBegin={lineNumberBegin}
            columns={controls
              .filter(column => column.controlId !== 'utime')
              .concat([
                {
                  controlId: 'dtime',
                  controlName: _l('????????????'),
                  type: 16,
                },
                {
                  controlId: 'daid',
                  controlName: _l('?????????'),
                  type: 26,
                },
              ])}
            rowHeight={34}
            selectedIds={selected}
            data={records}
            renderColumnHead={({ control, ...rest }) => (
              <ColumnHead
                {...rest}
                selected={!!selected.length}
                control={control}
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
                setFilter={headerRef.current.addFilterByControl}
              />
            )}
            renderRowHead={({ className, style, rowIndex, row }) => (
              <RowHead
                isTrash
                // canSelectAll
                className={className}
                style={{ ...style, width: 80 }}
                lineNumberBegin={lineNumberBegin}
                selectedIds={selected}
                onSelectAllWorksheet={() => {
                  setIsAll(true);
                  setSelected(records.map(row => row.rowid));
                  setSelectRows(records);
                }}
                onSelect={newSelected => {
                  const selectRows = [];
                  newSelected.forEach(rowId => {
                    const row = _.find(records, trashRow => trashRow.rowid === rowId);
                    if (row && (row.allowedit || row.allowEdit)) {
                      selectRows.push(row);
                    }
                  });
                  setSelected(newSelected);
                  setSelectRows(selectRows);
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
            emptyText={_l('??????????????????')}
          />
        </Body>
      </Con>
    </Modal>
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
