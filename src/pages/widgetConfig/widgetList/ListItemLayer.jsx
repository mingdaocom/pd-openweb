import React, { useEffect } from 'react';
import { useRef } from 'react';
import { useDragLayer } from 'react-dnd-latest';
import cx from 'classnames';
import { isEmpty } from 'lodash';
import styled from 'styled-components';
import { DRAG_ITEMS } from '../config/Drag';
import { DEFAULT_CONFIG } from '../config/widget';

const ItemLayer = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 100;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  .itemLayer {
    width: 160px;
    line-height: 40px;
    padding-left: 10px;
    padding-right: 4px;
    background: #f8f8f8;
    border-radius: 3px;
    border: 1px solid #d5d5d5;
    box-shadow: 0 4px 16px 0px rgba(0, 0, 0, 0.24);
    opacity: 0;
    &.isDragging {
      opacity: 1;
    }
    .content {
      display: flex;
      align-items: center;
      i {
        color: #9e9e9e;
      }
      span {
        color: #757575;
        font-weight: bold;
        margin-left: 6px;
      }
    }
  }
`;

export default function ListItemLayer(props) {
  const { listPanelVisible, setPanelVisible = () => {}, containerRef } = props;
  const $init = useRef(null);
  const $layerItem = useRef(null);
  const { isDragging, item, itemType, initialClientOffset, currentOffset } = useDragLayer(monitor => {
    const data = {
      isDragging: monitor.isDragging(),
      initialClientOffset: monitor.getInitialClientOffset(),
      currentOffset: monitor.getClientOffset(),
      itemType: monitor.getItemType(),
      item: monitor.getItem(),
    };
    return data;
  });

  useEffect(() => {
    if (listPanelVisible) {
      containerRef.current = isDragging;
    }
  }, [isDragging]);

  if ([DRAG_ITEMS.DISPLAY_ITEM, DRAG_ITEMS.DISPLAY_TAB].includes(itemType)) return null;
  if ((itemType || '').includes('dragType')) return null;

  if (item) {
    $init.current = { initialClientOffset, item };
  }
  const renderContent = () => {
    if (!item && !$init.current) return null;
    const { enumType } = item || $init.current.item;
    if (isEmpty(DEFAULT_CONFIG[enumType])) return;
    const { icon, widgetName } = DEFAULT_CONFIG[enumType];
    return (
      <div className="content">
        <i className={`Font18 icon-${icon}`}></i> <span>{widgetName}</span>
      </div>
    );
  };

  const getItemStyle = () => {
    const currentX = (currentOffset || {}).x;
    const $dom = document.querySelector('.WidgetListPanelDraw');

    const resetPanelStatus = () => {
      if ($dom && $dom.isPanelSet && listPanelVisible) {
        containerRef.current = false;
        setPanelVisible({ widgetVisible: false });
        $dom.isPanelSet = false;

        setTimeout(() => {
          $dom.style.visibility = 'unset';
          $dom.style.pointerEvents = 'unset';
        }, 200);
      }
    };

    if (currentX >= 380 && $dom && listPanelVisible && !$dom.isPanelSet) {
      $dom.style.visibility = 'hidden';
      $dom.style.pointerEvents = 'none';
      if ($layerItem.current) $layerItem.current.style.visibility = 'visible';
      $dom.isPanelSet = true;
    }
    // 放置成功 layer直接消失
    if (isDragging && !currentOffset) {
      resetPanelStatus();
      return { display: 'none' };
    }

    if (!currentOffset) {
      // 未放置成功， layer归位
      if (!$init.current) {
        resetPanelStatus();
        return { display: 'none' };
      }
      const { x = 0, y = 0 } = $init.current.initialClientOffset || {};
      resetPanelStatus();
      return {
        transform: `translate(${x}px, ${y}px)`,
        transition: 'all 0.5s',
        width: '120px',
      };
    }

    if (!item) {
      resetPanelStatus();
      return { display: 'none' };
    }

    const { x, y } = currentOffset;
    // 为了使鼠标在元素中间
    const transform = `translate(${x - 80 >= 0 ? x - 80 : x}px, ${y - 20 >= 0 ? y - 20 : y}px) `;
    return {
      transform: transform,
      WebkitTransform: transform,
    };
  };
  return (
    <ItemLayer ref={$layerItem}>
      <div className={cx('itemLayer', { isDragging })} style={getItemStyle()}>
        {renderContent()}
      </div>
    </ItemLayer>
  );
}
