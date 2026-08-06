import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getEmptyImage } from 'react-dnd-html5-backend-latest';
import { useDrag, useDragLayer, useDrop } from 'react-dnd-latest';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, SvgIcon } from 'ming-ui';
import { SYS_BTN_LIST } from '../config';

const ITEM_TYPE = 'VIEW_CUSTOM_ROW_ACTION';

function renderIcon(data, key, isDisabled = false) {
  if (key === 'sys') {
    return <Icon icon={data.icon} style={{ color: data.color }} className={cx('mRight12 Font18 InlineFlex Alpha10')} />;
  }

  if (key === 'btn' || key === 'group') {
    const { color, icon, iconUrl } = data;
    const mutedFill =
      isDisabled && key === 'btn'
        ? 'var(--color-text-disabled)'
        : !color
          ? 'var(--color-primary)'
          : color === 'transparent'
            ? 'var(--color-text-primary)'
            : color;
    const mutedIconColor =
      isDisabled && key === 'btn'
        ? 'var(--color-text-disabled)'
        : !icon
          ? undefined
          : !color
            ? undefined
            : color === 'transparent'
              ? undefined
              : color;

    return !!iconUrl && !!icon && (icon.endsWith('_svg') || icon.startsWith('sys_')) ? (
      <SvgIcon
        className="mRight12 svgIconForBtn InlineFlex"
        addClassName="TxtMiddle"
        url={iconUrl}
        fill={mutedFill}
        size={18}
      />
    ) : (
      <Icon
        icon={icon || 'custom_actions'}
        style={{ color: mutedIconColor }}
        className={cx(
          'mRight12 Font18 InlineFlex',
          isDisabled && key === 'btn'
            ? 'textDisabled'
            : !icon
              ? 'textDisabled'
              : !color
                ? 'colorPrimary'
                : color === 'transparent'
                  ? 'textPrimary'
                  : '',
        )}
      />
    );
  }

  return <Icon icon="print" className={cx('mRight12 Font18 textSecondary InlineFlex')} />;
}

function getRowItemType(item) {
  return SYS_BTN_LIST.map(o => o.key).includes(item.type) ? 'sys' : item.type;
}

function RowActionContent({ item, onDelete, isPreview = false }) {
  const rowType = getRowItemType(item);
  const isDisabled = rowType === 'btn' && item.status === 0;

  return (
    <div
      className={cx('customBtn alignItemsCenter customBtnGroupedRow customBtnRowActionItem', {
        isPreview,
        disabledCustomBtn: isDisabled,
      })}
    >
      <span className="Hand con overflow_ellipsis alignItemsCenter">
        <span className="Font13 WordBreak textPrimary Bold flexRow alignItemsCenter">
          {renderIcon(item, rowType, isDisabled)}
          <span className={cx('flex overflow_ellipsis', { textTertiary: isDisabled })}>
            {item.name || _l('已删除')}
            {isDisabled && <span className="Normal mLeft5">{`[${_l('停用')}]`}</span>}
          </span>
        </span>
      </span>
      <span
        className="customBtnRowActionDelete Hand InlineFlex alignItemsCenter justifyContentCenter"
        onClick={e => {
          e.stopPropagation();
          onDelete(item);
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        <Icon className="Font16" icon="trash" />
      </span>
    </div>
  );
}

function moveItem(items, fromIndex, gapIndex) {
  if (fromIndex < 0 || fromIndex >= items.length || gapIndex < 0 || gapIndex > items.length) {
    return items;
  }

  if (fromIndex === gapIndex || fromIndex + 1 === gapIndex) {
    return items;
  }

  const next = [...items];
  const [row] = next.splice(fromIndex, 1);
  const insertAt = fromIndex < gapIndex ? gapIndex - 1 : gapIndex;
  next.splice(insertAt, 0, row);
  return next;
}

function RowDropGap({ gapIndex, activeGap }) {
  return (
    <div
      className={cx('customBtnGroupedDropGap customBtnRowActionDropGap', {
        isActive: activeGap === gapIndex,
      })}
    />
  );
}

function DraggableRowAction({ item, index, onDelete, onDropRow, activeGap, setActiveGap }) {
  const rowRef = useRef(null);
  const [{ isDragging }, drag, dragPreview] = useDrag({
    item: { type: ITEM_TYPE, index },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
    begin: () => {
      const el = rowRef.current;

      if (el) {
        window.MD_DRAG_ITEM = {
          width: el.offsetWidth,
          height: el.offsetHeight,
        };
      }
    },
    end: () => {
      window.MD_DRAG_ITEM = undefined;
    },
  });
  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (dragItem, monitor) => {
      if (!rowRef.current || dragItem.index === index) {
        return;
      }

      const rect = rowRef.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) {
        return;
      }

      const gapIndex = clientOffset.y - rect.top <= rect.height / 2 ? index : index + 1;
      setActiveGap(gapIndex);
    },
    drop: (dragItem, monitor) => {
      if (!monitor.didDrop()) {
        onDropRow(dragItem.index, activeGap == null ? index : activeGap);
      }
    },
  });
  const attachRef = useCallback(
    node => {
      rowRef.current = node;
      drag(drop(node));
    },
    [drag, drop],
  );

  useEffect(() => {
    dragPreview(getEmptyImage());
  }, [dragPreview]);

  return (
    <div ref={attachRef} className="customBtnGroupedDragRow" style={{ opacity: isDragging ? 0 : 1 }}>
      <RowActionContent item={item} onDelete={onDelete} />
    </div>
  );
}

function RowActionDragLayer({ items }) {
  const { isDragging, itemType, item, initialClientOffset, currentOffset, initialSourceClientOffset } = useDragLayer(
    monitor => ({
      isDragging: monitor.isDragging(),
      itemType: monitor.getItemType(),
      item: monitor.getItem(),
      initialClientOffset: monitor.getInitialClientOffset(),
      currentOffset: monitor.getClientOffset(),
      initialSourceClientOffset: monitor.getInitialSourceClientOffset(),
    }),
  );

  if (!isDragging || itemType !== ITEM_TYPE || !item || !items[item.index] || !initialClientOffset || !currentOffset) {
    return null;
  }

  const offsetX = initialClientOffset.x - initialSourceClientOffset.x;
  const offsetY = initialClientOffset.y - initialSourceClientOffset.y;
  const transform = `translate(${currentOffset.x - offsetX}px, ${currentOffset.y - offsetY}px)`;

  return createPortal(
    <div
      className="customBtnGroupedDragLayerWrap customBtnRowActionDragLayerWrap"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100002,
        pointerEvents: 'none',
        transform,
        WebkitTransform: transform,
        width: _.get(window, 'MD_DRAG_ITEM.width') ? `${_.get(window, 'MD_DRAG_ITEM.width')}px` : undefined,
        minWidth: 260,
        maxWidth: 560,
      }}
    >
      <div className="customBtnGroupedDragFloatCard customBtnGroupedDragFloatCardBtn">
        <RowActionContent item={items[item.index]} onDelete={() => {}} isPreview />
      </div>
    </div>,
    document.body,
  );
}

function DropCleanup({ setActiveGap }) {
  const wasDraggingRef = useRef(false);
  const isDragging = useDragLayer(monitor => monitor.isDragging());

  useEffect(() => {
    if (wasDraggingRef.current && !isDragging) {
      setActiveGap(null);
    }

    wasDraggingRef.current = isDragging;
  }, [isDragging, setActiveGap]);

  return null;
}

export default function SortableRowActionList({ items, onSortEnd, onDelete }) {
  const [activeGap, setActiveGap] = useState(null);
  const handleDropRow = useCallback(
    (fromIndex, gapIndex) => {
      const next = moveItem(items, fromIndex, gapIndex);

      if (next !== items) {
        onSortEnd(next);
      }

      setActiveGap(null);
    },
    [items, onSortEnd],
  );

  return (
    <React.Fragment>
      <RowActionDragLayer items={items} />
      <DropCleanup setActiveGap={setActiveGap} />
      <div className="customBtnRowActionList">
        {items.map((item, index) => (
          <React.Fragment key={item.actionKey}>
            <RowDropGap gapIndex={index} activeGap={activeGap} />
            <DraggableRowAction
              item={item}
              index={index}
              onDelete={onDelete}
              onDropRow={handleDropRow}
              activeGap={activeGap}
              setActiveGap={setActiveGap}
            />
          </React.Fragment>
        ))}
        <RowDropGap gapIndex={items.length} activeGap={activeGap} />
      </div>
    </React.Fragment>
  );
}
