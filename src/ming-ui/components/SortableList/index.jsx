import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd-latest';
import { HTML5Backend, getEmptyImage } from 'react-dnd-html5-backend-latest';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { array, func, string, bool } from 'prop-types';
import ListItemLayer from './ItemLayer';

let dragging = false;

const DragItem = props => {
  const {
    items,
    useDragHandle,
    canDrag = true,
    itemClassName = '',
    item,
    dragType,
    index,
    dragPreviewImage,
    moveItem,
    onDragEnd,
    setDragging,
    renderItem,
  } = props;
  const ref = useRef(null);

  useEffect(() => {
    setDragging(dragging);
  }, [dragging]);

  useEffect(() => {
    if (ref.current) {
      ref.current.setAttribute('draggable', canDrag.toString());
    }
  }, [canDrag]);

  const [, drop] = useDrop({
    accept: dragType,
    hover: draggedItem => {
      if (draggedItem.index === index) {
        return;
      }

      moveItem(draggedItem.index, index);
      draggedItem.index = index;
    },
  });

  const [{ isDragging }, drag, dragPreview] = useDrag({
    item: { type: dragType, index, item: item },
    canDrag,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    begin: () => {
      dragging = true;
      window.MD_DRAG_ITEM = {
        width: ref.current.offsetWidth,
        height: ref.current.offsetHeight,
      };
    },
    end: () => {
      window.MD_DRAG_ITEM = undefined;
      dragging = false;
      onDragEnd(index);
    },
  });

  // 使用拖拽手柄
  const DragHandle = useDragHandle
    ? ({ children }) => (
        <span ref={drag} style={{ cursor: 'move' }}>
          {children}
        </span>
      )
    : null;

  if (dragPreviewImage) {
    dragPreview(useDragHandle ? drop(ref) : drag(drop(ref)));
  } else {
    useDragHandle ? drop(ref) : drag(drop(ref));
    dragPreview(getEmptyImage());
  }

  return (
    <div ref={ref} className={itemClassName} style={{ opacity: isDragging ? 0 : 1 }}>
      {renderItem({ item, index, DragHandle, items, dragging })}
    </div>
  );
};

function SortableComponent(props) {
  const { items, flag, onSortEnd = () => {}, itemKey, setDragging } = props;
  const [listItems, setListItems] = useState([]);
  const dragType = useMemo(() => `dragType_${uuidv4()}`, []);

  useEffect(() => {
    if (!_.isEqual(items, listItems)) {
      setListItems(items);
    }
  }, [flag, items]);

  const moveItem = useCallback((dragIndex, hoverIndex) => {
    if (props.moveItem && _.isFunction(props.moveItem)) {
      props.moveItem();
    }
    setListItems(listItems => {
      const newItems = [...listItems];
      const dragItem = newItems[dragIndex]; //需要移动的元素

      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, dragItem);

      return newItems;
    });
  }, []);

  const renderDraggableItem = ({ item, index }) => {
    return (
      <DragItem
        {...props}
        key={typeof item === 'string' ? item : _.get(item, itemKey)}
        index={index}
        item={item}
        dragType={dragType}
        moveItem={moveItem}
        onDragEnd={newIndex => {
          if (!_.isEqual(items, listItems)) {
            onSortEnd(listItems, newIndex);
          }
          dragging = false;
          setDragging(false);
        }}
      />
    );
  };

  return listItems.map((item, index) => renderDraggableItem({ item, index }));
}

export default function SortableList(props) {
  const { helperClass, itemClassName, useDragHandle, dragPreviewImage = false, renderBody = false, renderItem } = props;
  const [dragging, setDragging] = useState(false);

  return (
    <DndProvider backend={HTML5Backend} context={window}>
      {!dragPreviewImage && (
        <ListItemLayer
          renderBody={renderBody}
          dragging={dragging}
          itemClassName={itemClassName}
          helperClass={helperClass}
          useDragHandle={useDragHandle}
          renderItem={renderItem}
        />
      )}
      <SortableComponent {...props} setDragging={setDragging} />
    </DndProvider>
  );
}

SortableList.prototypes = {
  items: array, // 列表数据
  renderItem: func, // 列表item渲染
  itemKey: string, // item的唯一标识key, 必传 特殊：items里面是字符串可不传
  itemClassName: string, // item元素类名
  onSortEnd: func, // 拖拽完成回调
  useDragHandle: bool, // 是否使用拖拽手柄拖拽
  canDrag: bool, // 是否允许拖拽
  flag: string, // 强制刷新
  helperClass: string, // 拖动时样式
  dragPreviewImage: bool, // 拖图片
  renderBody: bool, //是否render到body上
};
