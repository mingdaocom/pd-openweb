import React, { useState, useEffect } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { useDragLayer } from 'react-dnd-latest';
import { DRAG_ITEMS } from '../config/Drag';
import { DEFAULT_CONFIG } from '../config/widget';
import { useRef } from 'react';
import { isEmpty } from 'lodash';

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

export default function ListItemLayer() {
  const $init = useRef(null);
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
    // 放置成功 layer直接消失
    if (isDragging && !currentOffset) return { display: 'none' };

    if (!currentOffset) {
      // 未放置成功， layer归位
      if (!$init.current) return { display: 'none' };
      const { x = 0, y = 0 } = $init.current.initialClientOffset || {};
      return {
        transform: `translate(${x}px, ${y}px)`,
        transition: 'all 0.75s',
        width: '120px',
      };
    }

    if (!item) return { display: 'none' };

    const { x, y } = currentOffset;
    // 为了使鼠标在元素中间
    const transform = `translate(${x - 80 >= 0 ? x - 80 : x}px, ${y - 20 >= 0 ? y - 20 : y}px) `;
    return {
      transform: transform,
      WebkitTransform: transform,
    };
  };
  return (
    <ItemLayer>
      <div className={cx('itemLayer', { isDragging })} style={getItemStyle()}>
        {renderContent()}
      </div>
    </ItemLayer>
  );
}
