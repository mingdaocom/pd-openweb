import React from 'react';
import _ from 'lodash';
import { DEFAULT_CONFIG } from 'src/pages/widgetConfig/config/widget';
import { enumWidgetType, getIconByType } from 'src/pages/widgetConfig/util';

export const NO_REQUIRED_CONTROL = [33];

export const HAS_RADIO_CONTROL = [2, 3, 4, 6, 7, 8, 9, 10, 11, 15, 16, 19, 23, 24, 26, 27, 28, 36, 46];

export const NO_OTHER_CONFIG = [5, 14, 29, 33];

// 关联记录特殊处理
export const EXCEL_CONTROLS = [2, [11, 9], 10, 6, 8, 5, [15, 16], 46, [3, 4], [24, 19, 23], 26, 27, 14, 36, 28, 33, 7];

const backItem = [
  {
    text: _l('返回'),
    value: 'back',
    iconName: 'arrow-left-border',
  },
];

const relateItem = [
  {
    text: (
      <div className="relateItem">
        <span>{_l('关联到其他工作表')}</span>
        <span className="Font14 Gray_9e icon-arrow-right-border"></span>
      </div>
    ),
    value: 'next',
    iconName: 'link_record',
  },
];

export const getList = (step, worksheetList) => {
  if (step === 2) {
    return backItem.concat(worksheetList.map(i => ({ text: i.workSheetName, value: i.workSheetId })));
  }
  return relateItem.concat(
    EXCEL_CONTROLS.map(item => {
      const type = _.isArray(item) ? item[0] : item;
      const ENUM_TYPE = enumWidgetType[type];
      const info = DEFAULT_CONFIG[ENUM_TYPE] || {};
      return {
        text: info.widgetName,
        value: type,
        iconName: getIconByType(type),
        total: [].concat(item),
      };
    }),
  );
};
