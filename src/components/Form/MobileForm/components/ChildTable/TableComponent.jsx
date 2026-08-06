import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Table } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MobileCardCellControl from 'src/components/MobileCardCellControls/MobileCardCellControl';
import * as actions from 'src/pages/worksheet/components/ChildTable/redux/actions';
import { getControlStyles } from 'src/utils/control';
import { controlState, isRelateRecordTableControl } from 'src/utils/control';
import { updateRulesData } from '../../../core/formUtils/updateRulesData';
import { addWidthToColumns } from './utils';

const TableWrap = styled(Table)`
  height: 100%;
  .ant-spin-nested-loading,
  .ant-spin-container,
  .ant-table,
  .ant-table-container {
    height: 100%;
  }
  .ant-table {
    ${({ h5height }) => h5height === '0' && 'font-size: 0.8em !important;'};
    ${({ h5height }) => h5height === '1' && 'font-size: 0.9em !important;'};
    ${({ h5height }) => (h5height === '2' || h5height === '3') && 'font-size: 1em !important;'};
    color: var(--color-text-title) !important;
    border: 1px solid var(--color-border-secondary);
    border-radius: 8px;
    overflow: hidden;
    ${({ noData }) => (noData ? 'border-bottom:none' : '')}
  }
  .ant-table-thead
    > tr
    > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before,
  .ant-table-ping-right:not(.ant-table-has-fix-right) .ant-table-container::before,
  .ant-table-ping-right:not(.ant-table-has-fix-right) .ant-table-container::after {
    display: none;
  }
  .ant-table-tbody > tr.ant-table-row:hover > td,
  .ant-table-tbody > tr > td.ant-table-cell-row-hover {
    background-color: var(--color-background-primary);
  }

  .ant-table-tbody > tr > td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--color-border-secondary);
  }

  .ant-table-thead > tr > th {
    padding: 12px;
    color: var(--color-text-title);
    background: var(--color-background-tertiary);
    font-size: 13px;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: top;
  }
  .ant-table-body {
    max-height: calc(100% - 40px);
  }

  .ant-table-placeholder {
    display: none !important;
  }
  .compactness {
    height: 44px !important;

    .customFormNull {
      margin: 0 !important;
    }
    .cell,
    .cell .ellipsis,
    .mobileRelateRecordWrap {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: top;
    }
  }
  .mobileRelateRecordWrap {
    display: block;
    overflow: hidden;
    word-break: break-all;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: top;
  }
  /* 中等 */
  .mediumTable {
    height: 64px;
    .cell,
    .cell .ellipsis,
    .mobileRelateRecordWrap {
      display: -webkit-box !important;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      white-space: pre-wrap;
    }
    .relateMultiple {
      display: flex !important;
      align-items: center;
    }
  }
  /* 高 */
  .heightTable {
    height: 88px;
    .cell,
    .cell .ellipsis,
    .mobileRelateRecordWrap {
      display: -webkit-box !important;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      white-space: pre-wrap;
    }
    .relateMultiple {
      display: flex !important;
      align-items: center;
    }
  }
  /* 自适应 */
  .adaptive {
    min-height: 44px;
    td {
      padding: 8px 12px !important;
    }
    .cell,
    .cell .ellipsis,
    .mobileRelateRecordWrap {
      display: -webkit-box !important;
      -webkit-box-orient: vertical;
      white-space: pre-wrap;
      -webkit-line-clamp: unset !important;
    }
    .mobileRelateRecordWrap {
      white-space: pre-line;
    }
    .customFormNull {
      width: 22px;
      height: 6px;
      background: var(--color-border-primary);
      margin: 15px 0;
      border-radius: 3px;
    }
  }
  .cellUsers {
    .userName {
      word-break: break-all;
    }
  }
  .cellDepartments {
    width: 100%;
    .cellDepartment {
      max-width: 100%;
      .departmentName {
        white-space: nowrap;
      }
    }
  }
  .RelateRecordDropdown {
    .normalSelectedItem {
      white-space: nowrap !important;
    }
  }

  ${({ controlStyles }) => controlStyles || ''}
`;

const Pagination = styled.div`
  display: flex;
  text-align: center;
  align-items: center;
  height: 36px;
  margin-top: 10px;
  .prev,
  .next {
    height: 100%;
    line-height: 36px;
    color: var(--color-white);
    padding: 0 12px;
    background: var(--color-primary);
    border-radius: 3px;
    &.disabled {
      color: var(--color-text-disabled);
      background: var(--color-background-secondary);
    }
  }
`;

const INITIAL_EXPAND_RENDER_COUNT = 50;
const EXPAND_RENDER_STEP = 50;

const getWidthDataSource = (dataSource, showExpand) => {
  if (!showExpand || dataSource.length <= INITIAL_EXPAND_RENDER_COUNT) return dataSource;

  const step = Math.ceil(dataSource.length / INITIAL_EXPAND_RENDER_COUNT);
  return dataSource.filter((item, index) => index % step === 0).slice(0, INITIAL_EXPAND_RENDER_COUNT);
};

const lineHeightInfo = { 0: 'compactness', 1: 'mediumTable', 2: 'heightTable', 3: 'adaptive' }; // h5height: 0=>紧凑 1=>中等 2=>高 3=>自适应
const getCurrentViewportSize = () => {
  const viewport = window.visualViewport;

  return {
    width: (viewport && viewport.width) || window.innerWidth || document.documentElement.clientWidth,
    height: (viewport && viewport.height) || window.innerHeight || document.documentElement.clientHeight,
  };
};

function TableComponent(props) {
  const {
    disabled,
    controls,
    rows,
    isEdit,
    sheetSwitchPermit,
    masterData,
    worksheetId,
    projectId,
    controlPermission,
    recordId,
    showControls = [],
    h5height,
    allowcancel,
    useUserPermission,
    rules,
    appId,
    control,
    showExpand,
    pagination = {},
    cellErrors = {},
    onSave = () => {},
    submitChildTableCheckData = () => {},
    updatePagination = () => {},
    onOpen = () => {},
    onDelete = () => {},
  } = props;
  const { pageIndex, count, pageSize } = pagination;
  const totalPage = Math.ceil(count / pageSize);
  const dataSource = useMemo(
    () => rows.slice((pageIndex - 1) * pageSize, pageIndex * pageSize),
    [pageIndex, pageSize, rows],
  );
  const renderKey = `${showExpand ? 1 : 0}-${pageIndex}-${pageSize}-${dataSource.length}`;
  const getInitialRenderCount = () =>
    showExpand ? Math.min(INITIAL_EXPAND_RENDER_COUNT, dataSource.length) : dataSource.length;
  const [renderState, setRenderState] = useState(() => ({ key: renderKey, count: getInitialRenderCount() }));
  const renderCount = renderState.key === renderKey ? renderState.count : getInitialRenderCount();
  const renderDataSource = useMemo(() => dataSource.slice(0, renderCount), [dataSource, renderCount]);
  const widthDataSource = useMemo(() => getWidthDataSource(dataSource, showExpand), [dataSource, showExpand]);
  const columns = useMemo(() => {
    const showDeleteCol =
      _.findIndex(
        rows,
        row => /^temp/.test(row.rowid) || (allowcancel && (useUserPermission && !!recordId ? row.allowdelete : true)),
      ) > -1;
    let visibleColumns = showControls
      .map(item => _.find(controls, c => c.controlId === item))
      .filter(_.identity)
      .filter(c => c.type !== 34 && controlState(c).visible && !isRelateRecordTableControl(c));
    visibleColumns =
      !disabled && isEdit && !_.isEmpty(rows) && showDeleteCol
        ? [{ controlId: 'delete', controlName: '', className: 'deleteAction', width: 30 }].concat(visibleColumns)
        : visibleColumns;

    return addWidthToColumns(visibleColumns, widthDataSource);
  }, [allowcancel, controls, disabled, isEdit, recordId, rows, showControls, useUserPermission, widthDataSource]);
  const tableScrollX = _.sumBy(columns, item => item.width || 180);
  const timerRef = useRef(null);
  const tableRef = useRef(null);
  const touchRef = useRef(null);
  const rowRuleDataMap = useMemo(() => {
    const map = new Map();

    renderDataSource.forEach(record => {
      map.set(
        record.rowid,
        updateRulesData({
          rules,
          recordId: record.rowid,
          data: controls.map(v => ({ ...v, value: record[v.controlId] })),
        }),
      );
    });

    return map;
  }, [controls, renderDataSource, rules]);

  useEffect(() => {
    const total = dataSource.length;

    if (!showExpand || total <= INITIAL_EXPAND_RENDER_COUNT) {
      setRenderState({ key: renderKey, count: total });
      return;
    }

    const useAnimationFrame = typeof window.requestAnimationFrame === 'function';
    let nextCount = INITIAL_EXPAND_RENDER_COUNT;
    let frame;

    setRenderState({ key: renderKey, count: nextCount });

    const renderNext = () => {
      const update = () => {
        nextCount = Math.min(nextCount + EXPAND_RENDER_STEP, total);
        setRenderState({ key: renderKey, count: nextCount });

        if (nextCount < total) {
          renderNext();
        }
      };

      frame = useAnimationFrame ? window.requestAnimationFrame(update) : window.setTimeout(update, 16);
    };

    renderNext();

    return () => {
      if (useAnimationFrame) {
        window.cancelAnimationFrame(frame);
      } else {
        window.clearTimeout(frame);
      }
    };
  }, [dataSource.length, renderKey, showExpand]);

  const changePage = type => {
    if ((type === 'prev' && pageIndex === 1) || (type === 'next' && pageIndex >= totalPage)) {
      return;
    }

    updatePagination({ pageIndex: type === 'prev' ? pageIndex - 1 : pageIndex + 1 });
  };

  const handleTouchStart = event => {
    const touch = event.touches[0];
    const scroller = tableRef.current?.querySelector('.ant-table-body, .ant-table-content');
    const canScrollX = scroller && scroller.scrollWidth > scroller.clientWidth;
    const canScrollY = scroller && scroller.scrollHeight > scroller.clientHeight;

    touchRef.current =
      touch && scroller && (canScrollX || canScrollY)
        ? { x: touch.clientX, y: touch.clientY, left: scroller.scrollLeft, top: scroller.scrollTop, scroller }
        : null;
  };

  const handleTouchMove = event => {
    const touch = event.touches[0];
    const touchInfo = touchRef.current;

    if (!touch || !touchInfo) return;

    const { scroller } = touchInfo;
    const maxLeft = scroller.scrollWidth - scroller.clientWidth;
    const maxTop = scroller.scrollHeight - scroller.clientHeight;
    const offsetX = touch.clientX - touchInfo.x;
    const offsetY = touch.clientY - touchInfo.y;
    const absX = Math.abs(offsetX);
    const absY = Math.abs(offsetY);
    const viewportSize = getCurrentViewportSize();
    const isRotateHorizontal = viewportSize.width <= viewportSize.height;

    if (Math.max(absX, absY) < 4 || (!isRotateHorizontal && absY > absX)) return;

    // The rotated popup swaps the visible axes, so map the dominant swipe back to the table scroller.
    if (isRotateHorizontal && absX > absY) {
      const nextTop = Math.max(0, Math.min(maxTop, touchInfo.top + offsetX));

      if (nextTop === scroller.scrollTop) return;

      scroller.scrollTop = nextTop;
    } else {
      const offset = isRotateHorizontal && absY > absX ? offsetY : offsetX;
      const nextLeft = Math.max(0, Math.min(maxLeft, touchInfo.left - offset));

      if (nextLeft === scroller.scrollLeft) return;

      scroller.scrollLeft = nextLeft;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    event.stopPropagation();
  };

  const clearTouch = () => {
    touchRef.current = null;
  };

  return (
    <Fragment>
      <div
        ref={tableRef}
        className="flex overflowHidden"
        style={{ minHeight: 0 }}
        onTouchStartCapture={showExpand ? handleTouchStart : undefined}
        onTouchMoveCapture={showExpand ? handleTouchMove : undefined}
        onTouchEndCapture={showExpand ? clearTouch : undefined}
        onTouchCancelCapture={showExpand ? clearTouch : undefined}
      >
        <TableWrap
          controlStyles={getControlStyles(columns)}
          tableLayout="fixed"
          rowClassName={record =>
            cx(lineHeightInfo[h5height], {
              errorRow: _.some(controls, v => cellErrors[record.rowid + '-' + v.controlId]),
            })
          }
          h5height={h5height}
          noData={_.isEmpty(dataSource)}
          pagination={false}
          dataSource={renderDataSource}
          scroll={{ x: tableScrollX, y: 'calc(100% - 40px)' }}
          rowKey="rowid"
          columns={columns.map(item => ({
            dataIndex: item.controlId,
            title: (
              <div className={`ellipsis control-head-${item.controlId}`}>
                <span className="controlName ellipsis">{item.controlName}</span>
              </div>
            ),
            align: 'left',
            className: `${item.className} mobileTableItem control-val-${item.controlId}`,
            textWrap: 'word-break',
            width: item.width || 180,
            onCell: () => {
              return {
                style: {
                  maxWidth: item.width || 180,
                  minWidth: item.width || 180,
                },
              };
            },
            render: (text, record) => {
              if (item.controlId === 'delete') {
                const allowDelete =
                  /^temp/.test(record.rowid) ||
                  (allowcancel && (useUserPermission && !!recordId ? record.allowdelete : true));
                return allowDelete ? (
                  <div
                    className="action"
                    onClick={event => {
                      event.stopPropagation();
                      onDelete(record.rowid);
                    }}
                  >
                    <i className="icon icon-trash Font16 Red"></i>
                  </div>
                ) : null;
              }

              const tableFormData = rowRuleDataMap.get(record.rowid) || [];
              const currentCell = _.find(tableFormData, v => v.controlId === item.controlId);
              const cellControl = {
                ...item,
                fieldPermission: currentCell ? currentCell.fieldPermission : item.fieldPermission,
              };

              return (
                <MobileCardCellControl
                  control={cellControl}
                  row={record}
                  showControlName={false}
                  sheetSwitchPermit={sheetSwitchPermit}
                  worksheetId={worksheetId}
                  projectId={projectId}
                  appId={appId}
                  style={
                    _.includes([29, 51], cellControl.type)
                      ? {
                          width: 180,
                          height:
                            h5height === '0'
                              ? 28
                              : h5height === '1'
                                ? 64
                                : h5height === '2'
                                  ? 88
                                  : cellControl.type == 29
                                    ? ''
                                    : 'auto',
                        }
                      : {}
                  }
                  masterData={masterData}
                  rowFormData={() => controls.map(c => Object.assign({}, c, { value: record[c.controlId] }))}
                  canedit={cellControl.type === 36 && controlPermission.editable && !control.mobileCheckRuleLocked}
                  updateCell={({ value }) => {
                    if (cellControl.type !== 36) return;

                    onSave({ ...record, [cellControl.controlId]: value }, [cellControl.controlId]);

                    if (isEdit) return;
                    clearTimeout(timerRef.current);
                    timerRef.current = setTimeout(() => {
                      submitChildTableCheckData({ isQuickUpdateCheck: true });
                    }, 500);
                  }}
                />
              );
            },
          }))}
          onRow={(record, index) => {
            return {
              onClick: event => {
                event.stopPropagation();
                onOpen((pageIndex - 1) * pageSize + +index);
              },
            };
          }}
        ></TableWrap>
      </div>
      {!isEdit && _.isEmpty(rows) && <div className="textTertiary mTop15 bold">{_l('暂无记录')}</div>}
      {totalPage > 1 && (
        <Pagination className="Font14">
          <div className={cx('prev mLeft16', { disabled: pageIndex === 1 })} onClick={() => changePage('prev')}>
            {_l('上一页')}
          </div>
          <div className="flex textPrimary Font15">
            <span className="colorPrimary bold">{pageIndex}</span>/<span>{totalPage}</span>
          </div>
          <div className={cx('next mRight16', { disabled: pageIndex >= totalPage })} onClick={() => changePage('next')}>
            {_l('下一页')}
          </div>
        </Pagination>
      )}
    </Fragment>
  );
}

TableComponent.propTypes = {
  controls: PropTypes.array, //子表值字段
  rows: PropTypes.array, // 子表记录
  isEdit: PropTypes.bool, // 是否可编辑
  sheetSwitchPermit: PropTypes.array, // 权限
  masterData: PropTypes.object, //主记录数据
  worksheetId: PropTypes.string,
  projectId: PropTypes.string,
  controlPermission: PropTypes.object, // 字段权限
  showControls: PropTypes.array, // 展示字段
  showExpand: PropTypes.bool,
  h5height: PropTypes.oneOf(['0', '1', '2', '3']), // 行高
  onSave: PropTypes.func, // 保存
  submitChildTableCheckData: PropTypes.func, // 更新检查项字段
  updatePagination: PropTypes.func,
  onOpen: PropTypes.func,
};

const mapStateToProps = state => ({
  pagination: state.pagination,
});

const mapDispatchToProps = dispatch => ({
  updatePagination: bindActionCreators(actions.updatePagination, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(TableComponent);
