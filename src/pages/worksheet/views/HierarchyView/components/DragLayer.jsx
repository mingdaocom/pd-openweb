import React from 'react';
import ReactDOM from 'react-dom';
import { useDragLayer } from 'react-dnd-latest';
import BaseCard from '../../components/BaseCard';
import { ITEM_TYPE } from '../config';
import { dealHierarchyData } from '../util';

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

export default function CustomDragLayer(props) {
  const { treeData, currentView, controls, hierarchyRelateSheetControls, sheetSwitchPermit } = props;
  const { item, isDragging, currentOffset, itemType } = useDragLayer(monitor => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));
  function getItemStyles() {
    if (!currentOffset) {
      return {
        display: 'none',
      };
    }

    const { x, y } = currentOffset;
    const transform = `translate(${x}px, ${y}px) scale(${props.scale / 100})`;
    return {
      transform: transform,
      WebkitTransform: transform,
      background: '#fff',
      width: '280px',
    };
  }
  function renderItem() {
    if (itemType !== ITEM_TYPE.ITEM) return null;
    const data = dealHierarchyData(treeData[item.rowId], {
      currentView,
      stateData: item,
      hierarchyRelateSheetControls,
      worksheetControls: controls,
    });
    return <BaseCard data={data} currentView={currentView} sheetSwitchPermit={sheetSwitchPermit} />;
  }

  if (!isDragging) {
    return null;
  }
  // 自定义页面中固定定位受父级样式影响失效，将预览层挂载到body上
  return ReactDOM.createPortal(
    <div style={layerStyles}>
      <div style={getItemStyles()}>{renderItem()}</div>
    </div>,
    document.body, // 渲染到 body
  );
}
