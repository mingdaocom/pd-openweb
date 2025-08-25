import React, { useEffect } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend-latest';
import { useDrag } from 'react-dnd-latest';
import cx from 'classnames';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { DRAG_ITEMS } from '../config/Drag';
import { DEFAULT_DATA, WIDGETS_TO_API_TYPE_ENUM } from '../config/widget';
import { checkWidgetMaxNumErr, enumWidgetType } from '../util';
import addTabWidget from './addTabWidget';

export default function DraggableItem(props) {
  const { item, addWidget, allControls, setStyleInfo, styleInfo: { info = {} } = {}, globalSheetInfo } = props;
  const { widgetName, icon, enumType, featureType } = item;
  const isCustomWidget = enumType === 'CUSTOM';

  const handleAdd = para => {
    if (featureType === '2') {
      buriedUpgradeVersionDialog(globalSheetInfo.projectId, item.featureId);
      return;
    }
    let data = {
      ...DEFAULT_DATA[enumType],
      type: enumWidgetType[enumType],
      controlId: uuidv4(),
    };

    const needGuide = !_.find(allControls, i => i.type === 52) && _.get(data, 'type') === 52;

    if (needGuide) {
      addTabWidget({
        tabposition: info.tabposition,
        handleOk: (tempPosition, onClose) => {
          const callback = () => {
            setStyleInfo({
              activeStatus: false,
              info: Object.assign({}, info, { tabposition: tempPosition }),
            });
          };
          addWidget(data, para, callback);
          onClose();
        },
      });
      return;
    }

    const err = checkWidgetMaxNumErr(data, allControls);
    if (err) {
      alert(err, 3);
      return;
    }

    addWidget(data, para);
  };

  const [, drag, preview] = useDrag({
    item: {
      enumType: enumType,
      type: _.includes(['SECTION'], enumType) ? DRAG_ITEMS.LIST_TAB : DRAG_ITEMS.LIST_ITEM,
      widgetType: WIDGETS_TO_API_TYPE_ENUM[enumType],
    },
    canDrag: () => {
      return !_.includes(['SECTION'], enumType);
    },

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
    <li className={cx('widgetLi', { widgetCustom: isCustomWidget })} ref={drag} onClick={handleAdd}>
      <div className="widgetItem">
        <i className={`icon-${icon}`}></i>
        <span>{widgetName}</span>
        {isCustomWidget && <span className="icon-ai-l betaIcon" />}
      </div>
    </li>
  );
}
