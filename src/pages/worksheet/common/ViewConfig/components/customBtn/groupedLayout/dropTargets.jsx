import React, { useCallback, useRef } from 'react';
import { useDragLayer, useDrop } from 'react-dnd-latest';
import cx from 'classnames';
import { ITEM_TYPE, ITEM_TYPE_GROUP } from './constants';

function getActiveDropPlacement(activeDropPlacementRef, item) {
  const placement = activeDropPlacementRef.current;

  return placement && placement.layoutId === item.layoutId && placement.itemType === item.type ? placement : null;
}

function createBoundaryPlacement(layoutId, itemType, insertBefore) {
  return { kind: 'boundary', layoutId, itemType, insertBefore };
}

function createInsidePlacement(layoutId, itemType, segmentIndex, gapIndex) {
  return { kind: 'inside', layoutId, itemType, segmentIndex, gapIndex };
}

function applyActivePlacement({
  placement,
  itemType,
  setActiveDropPlacement,
  setActiveGap,
  setActiveGroupInsert,
  setActiveButtonInsert,
}) {
  setActiveDropPlacement(placement);

  if (placement.kind === 'inside') {
    setActiveGroupInsert(null);
    setActiveButtonInsert(null);
    setActiveGap({ segmentIndex: placement.segmentIndex, gapIndex: placement.gapIndex });
    return;
  }

  setActiveGap(null);

  if (itemType === ITEM_TYPE_GROUP) {
    setActiveButtonInsert(null);
    setActiveGroupInsert(placement.insertBefore);
  } else {
    setActiveGroupInsert(null);
    setActiveButtonInsert(placement.insertBefore);
  }
}

export function SegmentBoundaryGap({
  insertBefore,
  layoutId,
  activeGroupInsert,
  activeButtonInsert,
  setActiveDropPlacement,
  setActiveGap,
  setActiveGroupInsert,
  setActiveButtonInsert,
  onDropGroupSegment,
  onDropButtonToBoundary,
  isAfterGroup = false,
}) {
  const active = activeGroupInsert === insertBefore || activeButtonInsert === insertBefore;
  const [, drop] = useDrop({
    accept: [ITEM_TYPE_GROUP, ITEM_TYPE],
    hover: (item, monitor) => {
      if (item.layoutId !== layoutId || !monitor.isOver({ shallow: true })) {
        return;
      }

      applyActivePlacement({
        placement: createBoundaryPlacement(layoutId, item.type, insertBefore),
        itemType: item.type,
        setActiveDropPlacement,
        setActiveGap,
        setActiveGroupInsert,
        setActiveButtonInsert,
      });
    },
    drop: (item, monitor) => {
      if (item.layoutId !== layoutId || !monitor.isOver({ shallow: true })) {
        return;
      }

      if (item.type === ITEM_TYPE_GROUP) {
        onDropGroupSegment(item.segmentIndex, insertBefore);
      } else {
        onDropButtonToBoundary(item.segmentIndex, item.idIndex, insertBefore);
      }
    },
  });

  return <div ref={drop} className={cx('customBtnGroupedSegmentReorderGap', { isActive: active, isAfterGroup })} />;
}

export function DropGap({ segmentIndex, gapIndex, activeGap }) {
  const active = activeGap && activeGap.segmentIndex === segmentIndex && activeGap.gapIndex === gapIndex;
  return <div className={cx('customBtnGroupedDropGap', { isActive: active })} />;
}

/** 空分组用：不占布局高度，仅在拖入自定义动作时启用命中，避免「空白占位条」 */
function FlowlessDropGap({ segmentIndex, gapIndex, activeGap }) {
  const isDraggingLayoutItem = useDragLayer(monitor => monitor.isDragging() && monitor.getItemType() === ITEM_TYPE);
  const active = activeGap && activeGap.segmentIndex === segmentIndex && activeGap.gapIndex === gapIndex;
  const isHitVisible = isDraggingLayoutItem || active;
  return (
    <div
      className={cx('customBtnGroupedDropGap', 'customBtnGroupedDropGapFlowless', { isActive: active, isHitVisible })}
    />
  );
}

export function EmptyGroupDropTarget({
  segmentIndex,
  layoutId,
  activeDropPlacementRef,
  onDropOnGap,
  onDropButtonToBoundary,
  setActiveDropPlacement,
  setActiveGap,
  setActiveGroupInsert,
  setActiveButtonInsert,
  activeGap,
}) {
  const ref = useRef(null);

  const getPlacement = monitor => {
    const node = ref.current;
    const clientOffset = monitor.getClientOffset();

    if (!node || !clientOffset) {
      return 'inside';
    }

    const rect = node.getBoundingClientRect();

    return clientOffset.y - rect.top > Math.min(6, rect.height / 3) ? 'after' : 'inside';
  };

  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item, monitor) => {
      if (item.layoutId !== layoutId || !monitor.isOver({ shallow: true })) {
        return;
      }

      const placement = getPlacement(monitor);
      const activePlacement =
        placement === 'after'
          ? createBoundaryPlacement(layoutId, item.type, segmentIndex + 1)
          : createInsidePlacement(layoutId, item.type, segmentIndex, 0);

      applyActivePlacement({
        placement: activePlacement,
        itemType: item.type,
        setActiveDropPlacement,
        setActiveGap,
        setActiveGroupInsert,
        setActiveButtonInsert,
      });
    },
    drop: (item, monitor) => {
      if (item.layoutId === layoutId && monitor.isOver({ shallow: true })) {
        const activePlacement = getActiveDropPlacement(activeDropPlacementRef, item);

        if (activePlacement && activePlacement.kind === 'boundary') {
          onDropButtonToBoundary(item.segmentIndex, item.idIndex, activePlacement.insertBefore);
        } else if (activePlacement && activePlacement.kind === 'inside') {
          onDropOnGap(item.segmentIndex, item.idIndex, activePlacement.segmentIndex, activePlacement.gapIndex);
        } else if (getPlacement(monitor) === 'after') {
          onDropButtonToBoundary(item.segmentIndex, item.idIndex, segmentIndex + 1);
        } else {
          onDropOnGap(item.segmentIndex, item.idIndex, segmentIndex, 0);
        }
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });
  const attachRef = useCallback(
    node => {
      ref.current = node;
      drop(node);
    },
    [drop],
  );

  return (
    <div ref={attachRef} className="customBtnGroupedEmptyHitArea">
      <FlowlessDropGap
        segmentIndex={segmentIndex}
        gapIndex={0}
        activeGap={isOver ? { segmentIndex, gapIndex: 0 } : activeGap}
      />
    </div>
  );
}

function getGroupGapIndexFromPoint(blockNode, clientY, idsLength) {
  const rowNodes = Array.from(blockNode.querySelectorAll('.customBtnGroupedDragRow'));

  for (let i = 0; i < rowNodes.length; i++) {
    const rect = rowNodes[i].getBoundingClientRect();

    if (clientY < rect.top + rect.height / 2) {
      return i;
    }
  }

  return idsLength;
}

export function SegmentBlockDropTarget({
  segment,
  segmentIndex,
  layoutId,
  activeDropPlacementRef,
  isGroupCollapsed,
  setActiveDropPlacement,
  setActiveGap,
  setActiveGroupInsert,
  setActiveButtonInsert,
  onDropOnGap,
  onDropGroupSegment,
  onDropButtonToBoundary,
  children,
}) {
  const ref = useRef(null);
  const getHoverPlacement = useCallback(
    (itemType, clientOffset) => {
      if (!ref.current || !clientOffset) {
        return null;
      }

      const rect = ref.current.getBoundingClientRect();
      const hoverY = clientOffset.y - rect.top;

      if (itemType === ITEM_TYPE_GROUP || segment.type !== 'group') {
        return { kind: 'boundary', insertBefore: hoverY <= rect.height / 2 ? segmentIndex : segmentIndex + 1 };
      }

      const headerNode = ref.current.querySelector('.customBtnGroupedGroupHeader');
      const blockNode = ref.current.querySelector('.customBtnGroupedBlock');
      const blockRect = blockNode && blockNode.getBoundingClientRect();
      const headerHeight = headerNode ? headerNode.getBoundingClientRect().height : 44;

      if (blockRect && clientOffset.y > blockRect.bottom) {
        return { kind: 'boundary', insertBefore: segmentIndex + 1 };
      }

      // 空/收起分组没有可见列表体，除顶部小段外都视作拖入组内。
      if (isGroupCollapsed || !segment.ids.length) {
        return hoverY <= Math.min(10, headerHeight / 3)
          ? { kind: 'boundary', insertBefore: segmentIndex }
          : { kind: 'inside', gapIndex: segment.ids.length ? segment.ids.length : 0 };
      }

      if (hoverY <= Math.min(16, headerHeight / 2)) {
        return { kind: 'boundary', insertBefore: segmentIndex };
      }

      return hoverY <= headerHeight
        ? { kind: 'inside', gapIndex: 0 }
        : { kind: 'inside', gapIndex: getGroupGapIndexFromPoint(ref.current, clientOffset.y, segment.ids.length) };
    },
    [segment, segmentIndex, isGroupCollapsed],
  );
  const [{ isOver }, drop] = useDrop({
    accept: [ITEM_TYPE_GROUP, ITEM_TYPE],
    hover: (item, monitor) => {
      if (item.layoutId !== layoutId || !ref.current || !monitor.isOver({ shallow: true })) {
        return;
      }

      const placement = getHoverPlacement(item.type, monitor.getClientOffset());

      if (!placement) {
        return;
      }

      applyActivePlacement({
        placement:
          placement.kind === 'inside'
            ? createInsidePlacement(layoutId, item.type, segmentIndex, placement.gapIndex)
            : createBoundaryPlacement(layoutId, item.type, placement.insertBefore),
        itemType: item.type,
        setActiveDropPlacement,
        setActiveGap,
        setActiveGroupInsert,
        setActiveButtonInsert,
      });
    },
    drop: (item, monitor) => {
      if (monitor.didDrop() || item.layoutId !== layoutId || !monitor.isOver({ shallow: true })) {
        return;
      }

      const activePlacement = getActiveDropPlacement(activeDropPlacementRef, item);
      const placement = activePlacement || getHoverPlacement(item.type, monitor.getClientOffset());

      if (!placement) {
        return;
      }

      if (placement.kind === 'inside') {
        onDropOnGap(
          item.segmentIndex,
          item.idIndex,
          placement.segmentIndex == null ? segmentIndex : placement.segmentIndex,
          placement.gapIndex,
        );
      } else if (item.type === ITEM_TYPE_GROUP) {
        onDropGroupSegment(item.segmentIndex, placement.insertBefore);
      } else {
        onDropButtonToBoundary(item.segmentIndex, item.idIndex, placement.insertBefore);
      }
    },
    collect: monitor => ({ isOver: monitor.isOver({ shallow: true }) }),
  });
  const attachRef = useCallback(
    node => {
      ref.current = node;
      drop(node);
    },
    [drop],
  );

  return (
    <div ref={attachRef} className={cx({ isDragOverBlock: isOver })}>
      {children}
    </div>
  );
}
