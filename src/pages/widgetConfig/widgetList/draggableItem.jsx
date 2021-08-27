import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd-latest';
import { getEmptyImage } from 'react-dnd-html5-backend-latest';
import { v4 as uuidv4 } from 'uuid';
import { DRAG_ITEMS, DRAG_MODE } from '../config/Drag';
import { DEFAULT_DATA } from '../config/widget';
import { enumWidgetType } from '../util';

export default function DraggableItem({ activeWidget, item, addWidget }) {
  const { widgetName, icon, enumType } = item;

  const handleAdd = para => {
    const data = {
      ...DEFAULT_DATA[enumType],
      type: enumWidgetType[enumType],
      controlId: uuidv4(),
    };
    addWidget(data, para);
  };

  const [collectDrag, drag, preview] = useDrag({
    item: { enumType: enumType, type: DRAG_ITEMS.LIST_ITEM },

    previewOptions: { captureDraggingState: true },

    end(obj, monitor) {
      const dropResult = monitor.getDropResult();
      if (!dropResult) return;
      handleAdd(dropResult);
    },
  });

  useEffect(() => {
    preview(getEmptyImage());
  }, [preview]);

  return (
    <li className="widgetLi" ref={drag} onClick={handleAdd}>
      <div className="widgetItem">
        <i className={`icon-${icon}`}></i>
        <span>{widgetName}</span>
      </div>
    </li>
  );
}
