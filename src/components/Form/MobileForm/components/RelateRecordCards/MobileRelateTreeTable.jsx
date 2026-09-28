import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActionSheet } from 'antd-mobile';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { getTitleTextFromControls } from 'src/utils/domain/control/display';
import { controlState } from 'src/utils/domain/control/state';
import { getControlStyles } from 'src/utils/domain/control/style';
import { lineHeightInfo, TableWrap } from '../ChildTable/TableComponent';
import { getTableBodyHeight, getTableScrollers } from '../ChildTable/utils';
import MobileCardCellControl from '../MobileCardCellControls/MobileCardCellControl';

const TREE_LEVEL_INDENT = 16;
const TREE_TITLE_CELL_MAX_WIDTH = 180;

const getCurrentViewportSize = () => {
  const viewport = window.visualViewport;

  return {
    width: Math.round((viewport && viewport.width) || window.innerWidth || document.documentElement.clientWidth),
    height: Math.round((viewport && viewport.height) || window.innerHeight || document.documentElement.clientHeight),
  };
};

const TreeTableWrap = styled(TableWrap)`
  margin-bottom: 10px;

  .titleCell {
    display: flex;
    align-items: center;
    box-sizing: content-box;
    max-width: ${TREE_TITLE_CELL_MAX_WIDTH}px;
    min-width: 0;
  }

  .treeToggle {
    width: 18px;
    flex-shrink: 0;
    color: var(--color-text-tertiary);
    text-align: center;
    margin-right: 8px;
  }

  .treeNumber {
    flex-shrink: 0;
    margin-right: 8px;
    color: var(--color-text-tertiary);
  }

  .treeTitle {
    min-width: 0;
    color: var(--color-text-title);
    font-size: 14px;
    font-weight: 600;
  }

  .treeLoading {
    display: inline-block;
    animation: rotate 1.2s linear infinite;
  }

  .moreOperate {
    width: 100%;
    text-align: center;
    color: var(--color-text-tertiary);
  }
`;

const getChildren = (row, rows) => {
  const childrenIds = safeParse(row.childrenids, 'array');

  return _.sortBy(
    rows.filter(item => item.pid === row.rowid || _.includes(childrenIds, item.rowid)),
    item => item.addTime,
  );
};

const getRootRows = rows => {
  const referencedIds = new Set();

  rows.forEach(row => {
    safeParse(row.childrenids, 'array').forEach(id => id && referencedIds.add(id));
  });

  return rows.filter(row => !row.pid && !referencedIds.has(row.rowid));
};

const getDefaultExpandedIds = (rows, defaultLayer) => {
  const expandedIds = new Set();
  const visitedIds = new Set();

  const visit = (row, level) => {
    if (visitedIds.has(row.rowid) || level > 50) return;
    visitedIds.add(row.rowid);
    const children = getChildren(row, rows);

    if (level < defaultLayer && children.length) {
      expandedIds.add(row.rowid);
      children.forEach(child => visit(child, level + 1));
    }
  };

  getRootRows(rows).forEach(row => visit(row, 1));
  return expandedIds;
};

export default function MobileRelateTreeTable(props) {
  const {
    appId,
    control,
    controls,
    rows,
    titleControl,
    displayControls,
    projectId,
    worksheetId,
    sheetSwitchPermit,
    h5height,
    showExpand,
    showHeader = true,
    allowAddChild,
    allowRemove,
    onAddChild,
    onLoadChildren,
    onOpen,
    onRemove,
    isEdit = false,
  } = props;
  const defaultLayer = Math.max(Number(_.get(control, 'advancedSetting.defaultlayer')) || 1, 1);
  const [expandedIds, setExpandedIds] = useState(() => getDefaultExpandedIds(rows, defaultLayer));
  const [loadingIds, setLoadingIds] = useState([]);
  const actionSheetHandlerRef = useRef(null);
  const tableRef = useRef(null);
  const touchRef = useRef(null);
  const visibleRows = useMemo(() => {
    const result = [];
    const visitedIds = new Set();

    const visit = (row, level, numberPath) => {
      if (visitedIds.has(row.rowid) || level > 50) return;
      visitedIds.add(row.rowid);
      result.push({ ...row, treeLevel: level, treeNumber: numberPath.join('.') });

      if (expandedIds.has(row.rowid)) {
        getChildren(row, rows).forEach((child, index) => visit(child, level + 1, numberPath.concat(index + 1)));
      }
    };

    getRootRows(rows).forEach((row, index) => visit(row, 1, [index + 1]));
    return result;
  }, [expandedIds, rows]);
  const maxTreePadding = Math.max((_.max(visibleRows.map(row => row.treeLevel)) || 1) - 1, 0) * TREE_LEVEL_INDENT;
  const showNumber = _.get(control, 'advancedSetting.hidenumber') !== '1';

  const toggleRow = async row => {
    const isExpanded = expandedIds.has(row.rowid);

    if (isExpanded) {
      setExpandedIds(current => {
        const next = new Set(current);
        next.delete(row.rowid);
        return next;
      });
      return;
    }

    setExpandedIds(current => new Set(current).add(row.rowid));
    if (!getChildren(row, rows).length && safeParse(row.childrenids, 'array').length) {
      setLoadingIds(current => _.uniq(current.concat(row.rowid)));
      try {
        await onLoadChildren(row);
      } finally {
        setLoadingIds(current => current.filter(id => id !== row.rowid));
      }
    }
  };

  const showOperate = row => {
    const sourceRow = _.omit(row, ['treeLevel', 'treeNumber']);
    const title = getTitleTextFromControls(controls, sourceRow) || _l('未命名');
    const actions = [
      allowRemove && {
        key: 'remove',
        text: (
          <div className="flexRow valignWrapper">
            <Icon icon="link_Dismiss" className="Font18 textError mRight16" />
            <span className="bold">{_l('取消关联')}</span>
          </div>
        ),
      },
      allowAddChild && {
        key: 'addChild',
        text: (
          <div className="flexRow valignWrapper">
            <Icon icon="add" className="Font18 textTertiary mRight16" />
            <span className="bold">{_l('添加下级记录')}</span>
          </div>
        ),
      },
    ].filter(Boolean);

    if (!actions.length) return;

    actionSheetHandlerRef.current = ActionSheet.show({
      popupClassName: 'md-adm-actionSheet',
      actions,
      extra: (
        <div className="flexRow header">
          <span className="Font13 overflow_ellipsis">{title}</span>
          <div className="closeIcon flex-shrink-0" onClick={() => actionSheetHandlerRef.current?.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
      onAction: action => {
        actionSheetHandlerRef.current?.close();
        if (action.key === 'remove') {
          onRemove(sourceRow);
        } else if (action.key === 'addChild') {
          setExpandedIds(current => new Set(current).add(row.rowid));
          onAddChild(sourceRow);
        }
      },
    });
  };

  const columns = [
    {
      dataIndex: titleControl.controlId || 'title',
      title: titleControl.controlName || _l('标题'),
      width: TREE_TITLE_CELL_MAX_WIDTH + maxTreePadding,
      render: (value, row) => {
        const children = getChildren(row, rows);
        const hasChildren = children.length || safeParse(row.childrenids, 'array').length;
        const isExpanded = expandedIds.has(row.rowid);
        const isLoading = _.includes(loadingIds, row.rowid);

        return (
          <div
            className="titleCell"
            style={{ paddingLeft: (row.treeLevel - 1) * TREE_LEVEL_INDENT }}
            onClick={() => onOpen(_.omit(row, ['treeLevel', 'treeNumber']))}
          >
            <span className="treeToggle" onClick={event => event.stopPropagation()}>
              {isLoading ? (
                <i className="icon icon-loading_button treeLoading Font12" />
              ) : (
                !!hasChildren && (
                  <i
                    className={`icon ${isExpanded ? 'icon-arrow-down' : 'icon-arrow-right-tip'} Font12`}
                    onClick={() => toggleRow(row)}
                  />
                )
              )}
            </span>
            {showNumber && <span className="treeNumber">{row.treeNumber}</span>}
            <span className="treeTitle titleText ellipsis">
              {getTitleTextFromControls(controls, row) || _l('未命名')}
            </span>
          </div>
        );
      },
    },
    ...displayControls.map(item => ({
      dataIndex: item.controlId,
      title: item.controlName,
      width: 110,
      render: (value, row) => {
        const currentControl = {
          ...item,
          fieldPermission: item.fieldPermission || '111',
          controlPermissions: item.controlPermissions || '111',
        };

        return (
          <div onClick={() => onOpen(_.omit(row, ['treeLevel', 'treeNumber']))}>
            {controlState(currentControl).visible && (
              <MobileCardCellControl
                appId={appId}
                control={currentControl}
                isTableCell
                projectId={projectId}
                row={row}
                rowHeight={30}
                rowFormData={() => controls.map(c => ({ ...c, value: row[c.controlId] }))}
                sheetSwitchPermit={sheetSwitchPermit}
                showControlName={false}
                worksheetId={worksheetId}
              />
            )}
          </div>
        );
      },
    })),
    ...(!showExpand && (allowRemove || allowAddChild)
      ? [
          {
            dataIndex: 'operate',
            title: '',
            width: 40,
            render: (value, row) => (
              <div className="moreOperate" onClick={() => showOperate(row)}>
                <i className="icon icon-more_horiz Font18" />
              </div>
            ),
          },
        ]
      : []),
  ];
  const tableScrollX = _.sumBy(columns, 'width');

  useEffect(() => {
    if (!showExpand || !tableRef.current) return;

    const tableRoot = tableRef.current;

    const updateTableBodyHeight = () => {
      const bodyHeight = getTableBodyHeight(tableRoot);

      if (bodyHeight) {
        tableRoot.style.setProperty('--mobile-table-body-height', `${bodyHeight}px`);
      }
    };

    const frame = window.requestAnimationFrame(updateTableBodyHeight);
    const resizeObserver = window.ResizeObserver ? new window.ResizeObserver(updateTableBodyHeight) : null;

    resizeObserver?.observe(tableRoot);
    window.addEventListener('resize', updateTableBodyHeight);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateTableBodyHeight);
      tableRoot.style.removeProperty('--mobile-table-body-height');
    };
  }, [showExpand]);

  const handleTouchStart = event => {
    const touch = event.touches[0];
    const { horizontalScroller, verticalScroller } = getTableScrollers(tableRef.current);

    touchRef.current =
      touch && (horizontalScroller || verticalScroller)
        ? {
            x: touch.clientX,
            y: touch.clientY,
            left: horizontalScroller?.scrollLeft || 0,
            top: verticalScroller?.scrollTop || 0,
            horizontalScroller,
            verticalScroller,
          }
        : null;
  };

  const handleTouchMove = event => {
    const touch = event.touches[0];
    const touchInfo = touchRef.current;

    if (!touch || !touchInfo) return;

    const offsetX = touch.clientX - touchInfo.x;
    const offsetY = touch.clientY - touchInfo.y;
    const absX = Math.abs(offsetX);
    const absY = Math.abs(offsetY);
    const viewportSize = getCurrentViewportSize();
    const isRotateHorizontal = viewportSize.width <= viewportSize.height;

    if (Math.max(absX, absY) < 4 || (!isRotateHorizontal && absY > absX)) return;

    if (isRotateHorizontal && absX > absY) {
      const { verticalScroller } = touchInfo;

      if (!verticalScroller) return;

      const maxTop = verticalScroller.scrollHeight - verticalScroller.clientHeight;
      const nextTop = Math.max(0, Math.min(maxTop, touchInfo.top + offsetX));

      if (nextTop === verticalScroller.scrollTop) return;

      verticalScroller.scrollTop = nextTop;
    } else {
      const { horizontalScroller } = touchInfo;

      if (!horizontalScroller) return;

      const offset = isRotateHorizontal && absY > absX ? offsetY : offsetX;
      const maxLeft = horizontalScroller.scrollWidth - horizontalScroller.clientWidth;
      const nextLeft = Math.max(0, Math.min(maxLeft, touchInfo.left - offset));

      if (nextLeft === horizontalScroller.scrollLeft) return;

      horizontalScroller.scrollLeft = nextLeft;
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
    <>
      <div
        ref={tableRef}
        className="flex overflowHidden"
        style={{ minHeight: 0 }}
        onTouchStartCapture={showExpand ? handleTouchStart : undefined}
        onTouchMoveCapture={showExpand ? handleTouchMove : undefined}
        onTouchEndCapture={showExpand ? clearTouch : undefined}
        onTouchCancelCapture={showExpand ? clearTouch : undefined}
      >
        <TreeTableWrap
          className="mobileRelationTable treeRelationTable"
          $controlStyles={getControlStyles([titleControl, ...displayControls].filter(Boolean))}
          $h5height={h5height}
          $noData={!visibleRows.length}
          $showExpand={showExpand}
          $showHeader={showHeader}
          columns={columns.map(item => ({
            ...item,
            title: (
              <div className={`ellipsis control-head-${item.dataIndex}`}>
                <span className="controlName ellipsis">{item.title}</span>
              </div>
            ),
            className: `mobileTableItem control-val-${item.dataIndex}`,
            onCell: () => ({
              style: {
                maxWidth: item.width,
                minWidth: item.width,
              },
            }),
          }))}
          dataSource={visibleRows}
          pagination={false}
          showHeader={showHeader}
          rowClassName={() => lineHeightInfo[h5height]}
          rowKey="rowid"
          scroll={
            showExpand
              ? { x: tableScrollX, y: 'var(--mobile-table-body-height, calc(100% - 40px))' }
              : { x: tableScrollX }
          }
          tableLayout="fixed"
        />
      </div>
      {!isEdit && !visibleRows.length && <div className="textTertiary mTop15 bold">{_l('暂无记录')}</div>}
    </>
  );
}

MobileRelateTreeTable.propTypes = {
  appId: PropTypes.string,
  control: PropTypes.shape({}),
  controls: PropTypes.arrayOf(PropTypes.shape({})),
  rows: PropTypes.arrayOf(PropTypes.shape({})),
  titleControl: PropTypes.shape({}),
  displayControls: PropTypes.arrayOf(PropTypes.shape({})),
  projectId: PropTypes.string,
  worksheetId: PropTypes.string,
  sheetSwitchPermit: PropTypes.array,
  h5height: PropTypes.oneOf(['0', '1', '2', '3']),
  showExpand: PropTypes.bool,
  showHeader: PropTypes.bool,
  allowAddChild: PropTypes.bool,
  allowRemove: PropTypes.bool,
  onAddChild: PropTypes.func,
  onLoadChildren: PropTypes.func,
  onOpen: PropTypes.func,
  onRemove: PropTypes.func,
  isEdit: PropTypes.bool,
};
