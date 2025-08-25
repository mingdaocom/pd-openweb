import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useDragLayer } from 'react-dnd-latest';
import styled from 'styled-components';

const LayerContainer = styled.div`
  position: fixed;
  pointer-events: none;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;

  .dragPreview {
    position: absolute;
    z-index: 9999;
    pointer-events: none;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.16);
    border-radius: 3px;
    display: block;
    box-sizing: border-box;
    overflow: hidden;
  }
`;

const CustomDragLayer = () => {
  const dragPreviewRef = useRef(null);
  const { item, isDragging, currentOffset } = useDragLayer(monitor => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  useEffect(() => {
    const container = dragPreviewRef.current;
    const node = item?.clonedNode;
    const { width = 280, height = 100 } = item || {};

    if (!container) return;

    // 拖拽结束，清空
    if (!isDragging || !node || !currentOffset) {
      container.innerHTML = '';
      return;
    }

    // 设置 container 的宽高与位置
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.transform = `translate(${currentOffset.x}px, ${currentOffset.y}px)`;

    container.innerHTML = '';
    container.appendChild(node);

    return () => {
      if (container.contains(node)) {
        container.removeChild(node);
      }
    };
  }, [isDragging, item, currentOffset]);

  if (!isDragging) return null;

  return ReactDOM.createPortal(
    <LayerContainer>
      <div className="dragPreview" ref={dragPreviewRef} />
    </LayerContainer>,
    document.body, // 渲染到 body
  );
};

export default CustomDragLayer;
