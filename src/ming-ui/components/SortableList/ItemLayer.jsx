import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDragLayer } from 'react-dnd-latest';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';

const ItemLayer = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 99999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  .itemLayer {
    cursor: grabbing;
    opacity: 1;
    z-index: 999;
    position: relative;
    > * {
      background: #fff;
    }
  }
`;

function ListItemLayer(props) {
  const { dragging, helperClass, itemClassName, useDragHandle = false, renderBody, renderItem } = props;
  const $init = useRef(null);

  const { isDragging, item, itemType, initialClientOffset, currentOffset, initialSourceClientOffset } = useDragLayer(
    monitor => {
      const data = {
        isDragging: monitor.isDragging(),
        // 拖动开始时鼠标位置
        initialClientOffset: monitor.getInitialClientOffset(),
        // 拖动进行时鼠标位置
        currentOffset: monitor.getClientOffset(),
        itemType: monitor.getItemType(),
        item: monitor.getItem(),
        // 拖到开始时组件位置
        initialSourceClientOffset: monitor.getInitialSourceClientOffset(),
      };

      return data;
    },
  );

  if (item) {
    $init.current = { initialClientOffset, item };
  }

  const DragHandle = ({ children }) => <span style={{ cursor: 'move' }}>{children}</span>;

  const renderContent = () => {
    if (!item && !$init.current) return null;

    return renderItem({ ...$init.current.item, DragHandle, isLayer: true });
  };

  const getItemStyle = () => {
    if (!initialClientOffset || !currentOffset || !item) {
      return {
        display: 'none !important',
      };
    }

    const { x, y } = currentOffset;
    const offsetX = initialClientOffset.x - initialSourceClientOffset.x;
    const offsetY = useDragHandle
      ? (_.get(window.MD_DRAG_ITEM, 'height') || 0) / 2
      : initialClientOffset.y - initialSourceClientOffset.y;

    const transform = `translate(${x - offsetX}px, ${y - offsetY}px) `;

    return {
      transform: transform,
      WebkitTransform: transform,
      width: _.get(window.MD_DRAG_ITEM, 'width') || '100%',
    };
  };

  if (!itemType || !isDragging || !dragging) return null;

  const content = (
    <ItemLayer key={`item-layer-${item ? item.type : null}`}>
      <div className={cx('itemLayer', itemClassName, helperClass)} style={getItemStyle()}>
        {renderContent()}
      </div>
    </ItemLayer>
  );

  return renderBody ? createPortal(content, document.body) : content;
}

export default ListItemLayer;
