import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDragLayer } from 'react-dnd-latest';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { ITEM_TYPE, ITEM_TYPE_GROUP } from './constants';
import { renderCustomBtnStyleIcon } from './icon';

function getGroupedDragLayerPointStyle({ initialClientOffset, currentOffset, initialSourceClientOffset }) {
  if (!initialClientOffset || !currentOffset || !initialSourceClientOffset) {
    return { display: 'none' };
  }

  const { x, y } = currentOffset;
  const offsetX = initialClientOffset.x - initialSourceClientOffset.x;
  const offsetY = initialClientOffset.y - initialSourceClientOffset.y;
  const transform = `translate(${x - offsetX}px, ${y - offsetY}px)`;
  const w = _.get(window, 'MD_DRAG_ITEM.width');

  return {
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 100002,
    pointerEvents: 'none',
    transform,
    WebkitTransform: transform,
    width: w ? `${w}px` : undefined,
    minWidth: 260,
    maxWidth: 560,
  };
}

function ButtonDragPreview({ btn }) {
  const { name = '', icon = '', color = '', iconUrl } = btn;
  return (
    <div className="customBtnGroupedDragFloatCard customBtnGroupedDragFloatCardBtn">
      <div className="customBtnGroupedDragPreviewBtnRow flexRow alignItemsCenter">
        {renderCustomBtnStyleIcon(icon, iconUrl, color)}
        <span className="flex Font13 textPrimary Bold overflow_ellipsis WordBreak">{name}</span>
        <span className="flex" />
        <Icon icon="more_horiz" className="Font18 colorPrimary customBtnGroupedDragPreviewMore" />
      </div>
    </div>
  );
}

function GroupDragPreview({ seg }) {
  const { name, icon, iconUrl, iconColor } = seg;
  return (
    <div className="customBtnGroupedDragFloatCard customBtnGroupedDragFloatCardGroup">
      <div className="customBtnGroupedDragPreviewGroupTop flexRow alignItemsCenter">
        <span className="customBtnGroupedDragPreviewGroupIcon InlineFlex alignItemsCenter justifyContentCenter">
          {renderCustomBtnStyleIcon(icon || 'adds', iconUrl, iconColor)}
        </span>
        <span className="flex Font13 textPrimary overflow_ellipsis WordBreak">{name}</span>
        <span className="flex" />
        <Icon icon="more_horiz" className="Font18 colorPrimary customBtnGroupedDragPreviewMore" />
      </div>
    </div>
  );
}

export function GroupedLayoutDragLayer({ layoutDragStateRef }) {
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

  if (!isDragging || (itemType !== ITEM_TYPE && itemType !== ITEM_TYPE_GROUP)) {
    return null;
  }

  const pointStyle = getGroupedDragLayerPointStyle({ initialClientOffset, currentOffset, initialSourceClientOffset });

  if (pointStyle.display === 'none') {
    return null;
  }

  const { segments, btnById } = layoutDragStateRef.current;
  const content =
    itemType === ITEM_TYPE && item && item.btnId ? (
      btnById[item.btnId] ? (
        <ButtonDragPreview btn={btnById[item.btnId]} />
      ) : null
    ) : itemType === ITEM_TYPE_GROUP && item && item.segmentIndex != null ? (
      segments[item.segmentIndex] && segments[item.segmentIndex].type === 'group' ? (
        <GroupDragPreview seg={segments[item.segmentIndex]} />
      ) : null
    ) : null;

  if (!content) {
    return null;
  }

  return createPortal(
    <div className="customBtnGroupedDragLayerWrap" style={pointStyle}>
      {content}
    </div>,
    document.body,
  );
}

/** 拖拽结束（松手、取消、拖到区外）时清掉投放高亮，避免蓝条残留 */
export function GroupedLayoutDropIndicatorCleanup({
  clearActiveDropPlacement,
  setActiveGap,
  setActiveGroupInsert,
  setActiveButtonInsert,
}) {
  const wasDraggingRef = useRef(false);
  const isDragging = useDragLayer(monitor => monitor.isDragging());

  useEffect(() => {
    if (wasDraggingRef.current && !isDragging) {
      clearActiveDropPlacement();
      setActiveGap(null);
      setActiveGroupInsert(null);
      setActiveButtonInsert(null);
    }

    wasDraggingRef.current = isDragging;
  }, [clearActiveDropPlacement, isDragging, setActiveGap, setActiveGroupInsert, setActiveButtonInsert]);

  return null;
}
