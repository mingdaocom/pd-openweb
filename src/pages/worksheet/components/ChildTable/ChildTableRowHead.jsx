import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Checkbox } from 'ming-ui/antd-components';
import ChangeSheetLayout from 'worksheet/components/ChangeSheetLayout';
import RecordOperate from 'worksheet/components/RecordOperate';

// 插入行加号 / 拖拽手柄都要显示在行外（表格左缘之外或骑在分割线上），
// 而行头在冻结列 grid 内、overflow:hidden 会裁掉溢出部分、相邻单元格也会盖住它们，
// 故统一做成挂在 body 上的单例悬浮元素（fixed 定位，不被裁/不被盖），行头 hover 时定位到对应行。

// 拖拽手柄：位于表格左缘外侧、垂直居中于本行，hover 光标 pointer
let floatDrag = null;
let dragHideTimer = null;

export function hideFloatDragNow() {
  if (!floatDrag) {
    return;
  }
  clearTimeout(dragHideTimer);
  floatDrag.btn.style.display = 'none';
}

function scheduleHideFloatDrag() {
  clearTimeout(dragHideTimer);
  dragHideTimer = setTimeout(hideFloatDragNow, 80);
}

function getFloatDrag() {
  if (floatDrag) {
    return floatDrag;
  }
  const btn = document.createElement('div');
  btn.className = 'childTableDragFloat';
  btn.innerHTML = '<i class="icon icon-drag"></i>';
  document.body.appendChild(btn);
  floatDrag = { btn, rowid: null, onDragStart: null };

  btn.addEventListener('mouseenter', () => clearTimeout(dragHideTimer));
  btn.addEventListener('mouseleave', scheduleHideFloatDrag);
  btn.addEventListener('mousedown', e => {
    const { onDragStart, rowid } = floatDrag;
    if (typeof onDragStart === 'function') {
      onDragStart(e, rowid);
    }
  });
  return floatDrag;
}

// cellRect 为该行任意单元格的矩形（决定竖向位置），tableRect 决定横向（贴表格左缘外侧）
function showFloatDrag({ cellRect, tableRect, rowid, onDragStart }) {
  const fd = getFloatDrag();
  clearTimeout(dragHideTimer);
  fd.rowid = rowid;
  fd.onDragStart = onDragStart;
  // 紧贴表格左缘外侧、垂直居中于本行（按钮 20px）；夹住 left 不小于 2，避免表格贴视口左缘时手柄跑出屏幕
  fd.btn.style.left = `${Math.max(tableRect.left - 22, 2)}px`;
  fd.btn.style.top = `${cellRect.top + cellRect.height / 2 - 10}px`;
  fd.btn.style.display = 'flex';
}

// 插入行加号：骑在本行上分割线上、圆心对齐左上角；按钮自身 hover 时变蓝放大、右侧画整表蓝色线。
let floatInsert = null;
let floatHideTimer = null;

export function hideFloatInsertNow() {
  if (!floatInsert) {
    return;
  }
  clearTimeout(floatHideTimer);
  floatInsert.btn.style.display = 'none';
  floatInsert.btn.classList.remove('active');
  floatInsert.line.style.display = 'none';
}

function scheduleHideFloatInsert() {
  clearTimeout(floatHideTimer);
  floatHideTimer = setTimeout(hideFloatInsertNow, 80);
}

function getFloatInsert() {
  if (floatInsert) {
    return floatInsert;
  }
  const line = document.createElement('div');
  line.className = 'childTableInsertFloatLine';
  const btn = document.createElement('div');
  btn.className = 'childTableInsertFloat';
  btn.innerHTML = '<i class="icon icon-add_circle_outline"></i>';
  document.body.appendChild(line);
  document.body.appendChild(btn);
  floatInsert = { btn, line, rowid: null, onInsert: null, tableRight: 0 };

  btn.addEventListener('mouseenter', () => {
    clearTimeout(floatHideTimer);
    btn.classList.add('active');
    const r = btn.getBoundingClientRect();
    // 蓝线从加号右侧起，画到表格右边缘（加号本身盖住线的左端，故左侧无端点/无圆点）
    line.style.left = `${r.right}px`;
    line.style.width = `${Math.max(0, floatInsert.tableRight - r.right)}px`;
    line.style.top = `${r.top + r.height / 2 - 1}px`;
    line.style.display = 'block';
  });
  btn.addEventListener('mouseleave', () => {
    btn.classList.remove('active');
    line.style.display = 'none';
    scheduleHideFloatInsert();
  });
  // 只挡默认行为（避免拖选文本），不能 stopPropagation：单元格编辑态由 ClickAway 收尾，
  // 而它监听的正是 document 上的 mousedown，拦下来编辑值就提交不了、编辑态也退不出去。
  // 加号挂在 body 上，冒泡路径不经过表格，放行也不会误触单元格（拖拽手柄同样没拦）。
  btn.addEventListener('mousedown', e => {
    e.preventDefault();
  });
  btn.addEventListener('click', () => {
    const { onInsert, rowid } = floatInsert;
    hideFloatInsertNow();
    if (typeof onInsert === 'function') {
      onInsert(rowid);
    }
  });
  return floatInsert;
}

// cellRect 为该行任意单元格的矩形（决定竖向位置），tableRect 决定横向（对齐表格左缘=行左缘）
function showFloatInsert({ cellRect, tableRect, rowid, onInsert }) {
  const fi = getFloatInsert();
  clearTimeout(floatHideTimer);
  fi.rowid = rowid;
  fi.onInsert = onInsert;
  fi.tableRight = tableRect.right;
  // 圆心对齐本行左上角（表格左缘, 行顶）：按钮 20px，半径 10px，故左上偏移各 -10
  fi.btn.style.left = `${tableRect.left - 10}px`;
  fi.btn.style.top = `${cellRect.top - 10}px`;
  fi.btn.style.display = 'flex';
}

// 整行 hover 时的统一入口：由 ChildTable 的 onCellEnter 回调（指针进入本行任意单元格即触发）
export function showRowFloats({ cell, rowid, canDrag, canInsert, onDragStart, onInsert }) {
  // 整行拖拽进行中：指针经过其它行时不弹出手柄/加号（拖拽态跟随手柄由 rowDrag 自己画）
  if (document.documentElement.classList.contains('childTableRowDragging')) {
    return;
  }
  const table = cell.closest('.sheetViewTable');
  if (!table) {
    return;
  }
  const cellRect = cell.getBoundingClientRect();
  const tableRect = table.getBoundingClientRect();
  // 加号 / 手柄是挂在 body 上的单例：不可用时必须主动收掉，
  // 否则（如行数刚达到上限）它们会继续停在上次定位的位置上
  if (canInsert) {
    showFloatInsert({ cellRect, tableRect, rowid, onInsert });
  } else {
    hideFloatInsertNow();
  }

  if (canDrag) {
    showFloatDrag({ cellRect, tableRect, rowid, onDragStart });
  } else {
    hideFloatDragNow();
  }
}

export function scheduleHideRowFloats() {
  scheduleHideFloatInsert();
  scheduleHideFloatDrag();
}

const ROW_CHECKBOX_STYLE = { marginRight: -2 };

const Con = styled.span`
  padding: 0 !important;
  line-height: 34px;
  .rowIndex {
    display: inline-block;
    width: 44px;
    text-align: center;
    .num {
      font-size: 13px;
      color: var(--color-text-tertiary);
    }
  }
  .moreOperate {
    margin: 5px 8px 0 12px;
  }
  .open,
  .operateBtn,
  .moreOperate {
    display: none;
  }
  .operateBtn {
    margin: 0 13px;
    min-width: 18px;
  }
  .operateBtn,
  .open .icon {
    font-size: 18px;
    color: var(--color-text-tertiary);
    cursor: pointer;
    top: 2px;
    position: relative;
    &.delete:hover {
      color: var(--color-error);
    }
  }
  .delete {
    display: none;
  }
  &.hover {
    .open {
      display: inline-block;
    }
  }
  &.isNew {
    &::before {
      content: '';
      position: absolute;
      z-index: 3;
      left: 0;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--color-primary);
    }
  }
  &:not(.disabled).hover {
    .delete,
    .open,
    .operateBtn,
    .moreOperate {
      display: inline-block;
    }
    .rowIndex {
      display: none;
    }
    &.oneColumn {
      display: flex;
      justify-content: center;
      .moreOperate {
        margin-left: 0px;
        margin-right: 0px;
      }
    }
  }
  &.showCheckbox {
    .rowIndex {
      position: absolute;
      display: inline-block !important;
      z-index: 2;
    }
  }
  /* 批量编辑态行头只展示 checkbox，hover 时不再叠加显示更多操作 icon */
  &.showCheckbox.hover {
    .delete,
    .open,
    .operateBtn,
    .moreOperate {
      display: none;
    }
  }
  &.disabled:not(.showNumber) {
    text-align: center;
    .rowIndex {
      display: none;
    }
  }
  /* 拖拽手柄与插入加号都要显示在行外，均为挂在 body 的悬浮单例，故此处不再有对应样式 */
`;

export default function RowHead(props) {
  const {
    useUserPermission,
    row = {},
    allowOpenRecord,
    allowCopy,
    changeSheetLayoutVisible,
    disabled,
    allowAdd,
    allowCancel,
    className,
    style,
    isSelectAll,
    rowIndex,
    recordId,
    showCheckbox,
    selectedRowIds,
    showNumber = true,
    lineNumberBegin = 0,
    onOpen = () => {},
    onDelete = () => {},
    onCopy = () => {},
    saveSheetLayout = () => {},
    resetSheetLayout = () => {},
    onSelect = () => {},
    onSelectAll = () => {},
  } = props;
  const isSavedData = !/^temp/.test(row.rowid);
  const hideOperate = disabled || (isSavedData && (!allowAdd || !allowCancel));

  if (rowIndex === -1) {
    return showCheckbox ? (
      <div className={cx(className, 'noRightBorder')} style={style}>
        <span
          className="rowIndex TxtCenter InlineBlock"
          style={{
            width: 44,
          }}
        >
          <Checkbox
            indeterminate={!isSelectAll && selectedRowIds.length}
            // disabled={!data.length}
            checked={isSelectAll}
            onChange={() => {
              onSelectAll(!selectedRowIds.length);
            }}
            size="small"
            style={ROW_CHECKBOX_STYLE}
          />
        </span>
      </div>
    ) : (
      <div className={cx(className, 'noRightBorder')} style={style}>
        {changeSheetLayoutVisible && (
          <ChangeSheetLayout
            description={_l('保存当前表格的列宽、列冻结配置，并应用给所有用户')}
            onSave={saveSheetLayout}
            onCancel={resetSheetLayout}
          />
        )}
      </div>
    );
  }

  if (!row.rowid || row.rowid.startsWith('empty')) {
    return <Con className={cx(className, 'noRightBorder placeholder')} style={style} />;
  }

  // 拖拽手柄/插入加号的显隐改由整行 hover 驱动（ChildTable 的 onCellEnter/onCellLeave），此处不再挂行头级 hover
  return (
    <Con
      className={cx(className, 'noRightBorder', {
        disabled: disabled || (isSavedData && (!allowAdd || !allowCopy) && !allowCancel),
        showNumber,
        showCheckbox,
        isNew: !isSavedData,
        oneColumn: style.width < 50,
      })}
      style={style}
    >
      <span className="rowIndex">
        {showNumber && !showCheckbox && <span className={cx('num')}>{lineNumberBegin + rowIndex + 1}</span>}

        {showCheckbox && (
          <Checkbox
            checked={_.includes(selectedRowIds, row.rowid)}
            onChange={() => {
              onSelect(row.rowid, !_.includes(selectedRowIds, row.rowid));
            }}
            size="small"
            style={ROW_CHECKBOX_STYLE}
          />
        )}
      </span>
      {!hideOperate && (
        <RecordOperate
          action={['hover']}
          placement="bottomLeft"
          isSubList
          mouseEnterDelay={0.5}
          defaultCustomButtons={[]}
          allowCopy={allowCopy}
          shows={['copy']}
          allowDelete={useUserPermission && !!recordId ? row.allowdelete : true}
          showTask={false}
          showHr={false}
          onDelete={onDelete}
          onCopy={onCopy}
        />
      )}
      {!disabled && isSavedData && allowAdd && !allowCancel && allowCopy && (
        <i className="operateBtn icon icon-copy hand hoverColorPrimary" onClick={onCopy}></i>
      )}
      {!disabled &&
        isSavedData &&
        allowCancel &&
        !allowAdd &&
        ((useUserPermission ? row.allowdelete : true) ? (
          <i className="operateBtn delete icon icon-trash hand" onClick={onDelete}></i>
        ) : (
          <span className="operateBtn"></span>
        ))}
      {allowOpenRecord && (
        <span className="open" onClick={() => onOpen(rowIndex)}>
          <i className="icon icon-worksheet_enlarge hoverColorPrimary"></i>
        </span>
      )}
    </Con>
  );
}

//

RowHead.propTypes = {
  className: PropTypes.string,
  showCheckbox: PropTypes.bool,
  showNumber: PropTypes.bool,
  isSelectAll: PropTypes.bool,
  selectedRowIds: PropTypes.arrayOf(PropTypes.string),
  row: PropTypes.shape({}),
  allowAdd: PropTypes.bool,
  allowCancel: PropTypes.bool,
  disabled: PropTypes.bool,
  rowIndex: PropTypes.number,
  style: PropTypes.shape({}),
  onOpen: PropTypes.func,
  onDelete: PropTypes.func,
  onCopy: PropTypes.func,
  saveSheetLayout: PropTypes.func,
  resetSheetLayout: PropTypes.func,
  onSelect: PropTypes.func,
  onSelectAll: PropTypes.func,
};
