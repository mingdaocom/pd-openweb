import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useDrag } from 'react-dnd-latest';
import { getEmptyImage } from 'react-dnd-html5-backend-latest';
import { v4 as uuidv4 } from 'uuid';
import { DRAG_ITEMS } from '../config/Drag';
import { DEFAULT_DATA, WIDGETS_TO_API_TYPE_ENUM } from '../config/widget';
import { enumWidgetType, getDefaultarea } from '../util';
import { buriedUpgradeVersionDialog } from 'src/util';
import { Dialog, Checkbox, Button } from 'ming-ui';
import imgUrl from 'staticfiles/images/tab_img.png';
import _ from 'lodash';

export default function DraggableItem(props) {
  const { item, addWidget, allControls, setStyleInfo, styleInfo: { info = {} } = {}, globalSheetInfo } = props;
  const { widgetName, icon, enumType, featureType } = item;

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
    if (enumType === 'MOBILE_PHONE') {
      data = {
        ...data,
        advancedSetting: {
          ...data.advancedSetting,
          defaultarea: getDefaultarea(),
        },
      };
    }

    const needGuide = !_.find(allControls, i => i.type === 52) && _.get(data, 'type') === 52;

    if (needGuide) {
      const tabPosition = info.tabposition || '2';
      const handleClose = () => $('.sectionConfirmDialog.mui-dialog-container').parent().remove();
      Dialog.confirm({
        width: 640,
        title: _l('添加标签页'),
        noFooter: true,
        closable: true,
        dialogClasses: 'sectionConfirmDialog',
        onCancel: () => handleClose(),
        children: (
          <Fragment>
            <div className="Gray_75">{_l('使用标签页归类字段，保持页面简洁')}</div>
            <img src={imgUrl} height={305} width="100%" />
            <div className="flexCenter mTop20" style={{ justifyContent: 'space-between' }}>
              <Checkbox
                size="small"
                className="tabPositionCheck"
                defaultChecked={tabPosition === '2'}
                text={_l('同时把标签页显示在顶部')}
              />
              <div className="flexCenter">
                <Button type="link" onClick={handleClose} className="mRight16">
                  {_l('取消')}
                </Button>
                <Button
                  onClick={() => {
                    const callback = () => {
                      const tempPosition = $('.tabPositionCheck').prop('checked') ? '2' : '1';
                      setStyleInfo({
                        activeStatus: false,
                        info: Object.assign({}, info, { tabposition: tempPosition }),
                      });
                    };
                    addWidget(data, para, callback);
                    handleClose();
                  }}
                >
                  {_l('添加')}
                </Button>
              </div>
            </div>
          </Fragment>
        ),
      });
      return;
    }

    addWidget(data, para);
  };

  const [collectDrag, drag, preview] = useDrag({
    item: {
      enumType: enumType,
      type: _.includes(['SECTION'], enumType) ? DRAG_ITEMS.LIST_TAB : DRAG_ITEMS.LIST_ITEM,
      widgetType: WIDGETS_TO_API_TYPE_ENUM[enumType],
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
    <li className="widgetLi" ref={drag} onClick={handleAdd}>
      <div className="widgetItem">
        <i className={`icon-${icon}`}></i>
        <span>{widgetName}</span>
      </div>
    </li>
  );
}
