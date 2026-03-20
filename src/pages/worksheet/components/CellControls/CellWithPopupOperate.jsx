import React, { useCallback, useEffect, useRef, useState } from 'react';
import { isFunction } from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { emitter } from 'src/utils/common';

const Con = styled.div`
  .resizeDrag {
    position: absolute;
    right: 0px;
    top: 0;
    bottom: 0;
    width: 8px;
    cursor: ew-resize;
    &::after {
      content: ' ';
      position: absolute;
      top: calc(50% - 8px);
      height: 16px;
      right: 0;
      width: 1px;
      cursor: ew-resize;
    }
    &:hover {
      &::after {
        width: 2px;
        background-color: #1677ff !important;
      }
    }
  }
`;

const PopupOperateCon = styled.div`
  .box {
    border-radius: 4px;
    border: 1px solid var(--color-border-primary);
    background-color: #fff;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
    .iconButton {
      line-height: 26px;
      cursor: pointer;
      padding: 0 8px;
      .icon {
        font-size: 18px;
        color: #9e9e9e;
        cursor: pointer;
        top: 2px;
        position: relative;
        &.delete {
          color: var(--color-error);
        }
      }
      &:hover {
        background-color: #f8f8f8;
      }
    }
  }
  .footer {
    height: 2px;
    width: 200%;
    margin-left: -100%;
  }
`;

export default function CellWithPopupOperate({
  className,
  rowIndex,
  disabled,
  canDrag = true,
  style = {},
  control = {},
  tableId,
  columnIndex,
  cellContent,
  cellProps = {},
  row,
  updateSheetColumnWidths = () => {},
}) {
  const {
    onOpenRecord,
    onDeleteRecord,
    onCopyRecord,
    useUserPermission,
    allowCopy,
    recordId,
    renderColumnPopupContent,
  } = cellProps;
  const [popupVisible, setPopupVisible] = useState(false);
  const dragRef = useRef();
  const allowDelete = useUserPermission && !!recordId ? row?.allowdelete : true;
  const customPopupContent = isFunction(renderColumnPopupContent)
    ? renderColumnPopupContent({ className, style, rowIndex, row })
    : null;
  const handleMouseDown = useCallback(
    e => {
      console.log(style.width);
      e.preventDefault();
      const columnWidth = style.width;
      const tableElement = dragRef.current && $(dragRef.current).parents('.sheetViewTable')[0];
      if (!tableElement) {
        return;
      }
      const tableId = (tableElement.className.match(/id-([\w-]+)-id/) || [])[1];
      const defaultLeft = e.clientX - tableElement.getBoundingClientRect().left;
      emitter.emit('TRIGGER_CHANGE_COLUMN_WIDTH_MASK_' + tableId, {
        columnIndex,
        columnWidth: columnWidth - (control.appendWidth || 0),
        defaultLeft,
        target: tableElement,
        callback: newWidth => {
          updateSheetColumnWidths({ controlId: columnIndex, value: newWidth });
          // if (isLast) {
          //   setTimeout(() => {
          //     if ($(tableElement).find('.scroll-x')[0]) {
          //       $(tableElement).find('.scroll-x')[0].scrollLeft = 100000;
          //     }
          //   }, 30);
          // }
        },
      });
    },
    [style.width],
  );
  const handlePopupVisibleChange = useCallback(
    ({ newHoverColumnIndex, visible } = {}) => {
      if (visible && String(newHoverColumnIndex) === String(columnIndex)) {
        setPopupVisible(visible);
      } else {
        setPopupVisible(false);
      }
    },
    [columnIndex],
  );
  useEffect(() => {
    emitter.addListener('TRIGGER_CELL_POPUP_OPERATE_VISIBLE_' + tableId, handlePopupVisibleChange);
    return () => {
      emitter.removeListener('TRIGGER_CELL_POPUP_OPERATE_VISIBLE_' + tableId, handlePopupVisibleChange);
    };
  }, [handlePopupVisibleChange]);
  if (isFunction(renderColumnPopupContent) && !customPopupContent) {
    return null;
  }
  return (
    <Trigger
      action={['']}
      zIndex={999}
      popup={
        <PopupOperateCon
          className="tableColumnsPopup"
          onMouseEnter={() => {
            setPopupVisible(true);
          }}
          onMouseLeave={e => {
            if (document.querySelector('.relateRecordDropdownPopup')) {
              return;
            }
            if (e.nativeEvent.target?.checkVisibility?.()) {
              setPopupVisible(false);
            }
          }}
        >
          {isFunction(renderColumnPopupContent) ? (
            renderColumnPopupContent({ className, style, rowIndex, row })
          ) : (
            <div className="box">
              <span className="iconButton" onClick={() => onOpenRecord(columnIndex - 1)}>
                <i className="icon icon-worksheet_enlarge"></i>
              </span>
              {allowCopy && (
                <span className="iconButton" onClick={() => onCopyRecord(row)}>
                  <i className="icon icon-copy"></i>
                </span>
              )}
              {allowDelete && cellProps.allowDelete && (
                <span className="iconButton" onClick={() => onDeleteRecord(row)}>
                  <i className="icon icon-trash delete"></i>
                </span>
              )}
            </div>
          )}
          <div className="footer"></div>
        </PopupOperateCon>
      }
      popupAlign={{
        points: ['br', 'tr'],
        offset: [0, 0],
        overflow: { adjustY: true, adjustX: true },
      }}
      getPopupContainer={() => document.querySelector(`.sheetViewTable.id-${tableId}-id`) || document.body}
      popupVisible={popupVisible}
    >
      <Con
        className="cellPopupCon"
        style={{
          position: 'absolute',
          left: style.left,
          top: style.top,
          width: style.width,
          height: style.height,
        }}
      >
        {React.cloneElement(cellContent, {
          style: {
            ...style,
            left: 0,
            top: 0,
          },
        })}
        {!disabled && canDrag && <span ref={dragRef} className="resizeDrag Hand" onMouseDown={handleMouseDown}></span>}
      </Con>
    </Trigger>
  );
}
