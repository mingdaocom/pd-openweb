import React, { Fragment } from 'react';
import WidgetName from '../WidgetName';
import {
  HAS_WARNING_CONTROL,
  NO_CUSTOM_SETTING_CONTROL,
  HAS_DYNAMIC_DEFAULT_VALUE_CONTROL,
  NO_VERIFY_WIDGET,
} from '../../../config';
import { enumWidgetType, isCustomWidget } from '../../../util';
import { canAdjustWidth } from '../../../util/setting';
import { changeWidgetSize } from '../../../util/widgets';
import Settings from '../../settings';
import WidgetWarning from './WidgetWarning';
import DynamicDefaultValue from '../DynamicDefaultValue';
import WidgetVerify from '../WidgetVerify';
import WidgetOtherExplain from './WidgetOtherExplain';
import WidgetWidth from './WidgetWidth';
import WidgetCustom from '../CustomWidget/WidgetCustom';

// 高级设置
export default function WidgetBase(props) {
  const { data = {}, widgets = [], setWidgets, setActiveWidget, ...rest } = props;
  const { type, options = [], controlId } = data;
  const ENUM_TYPE = enumWidgetType[type];
  const Components = Settings[ENUM_TYPE];

  const handleAdjustWidthClick = value => {
    setWidgets(changeWidgetSize(widgets, { controlId, size: value }));
    setActiveWidget({ ...data, size: value });
  };

  if (_.isEmpty(data)) return null;

  return (
    <Fragment>
      {/**提示文案 */}
      {HAS_WARNING_CONTROL.includes(type) && <WidgetWarning type={type} />}
      {/**字段名称 */}
      <WidgetName {...props} />
      {/**自定义字段通用设置 */}
      {isCustomWidget(data) && <WidgetCustom {...props} />}
      {/* rest.type 已指定类型的情况下不可更改 */}
      {!NO_CUSTOM_SETTING_CONTROL.includes(type) && !rest.type && Components && <Components {...props} />}
      {/* 快速创建字段暂时隐藏更多内容 */}
      {!rest.quickAddControl && (
        <Fragment>
          {HAS_DYNAMIC_DEFAULT_VALUE_CONTROL.includes(type) && <DynamicDefaultValue {...props} />}
          {!NO_VERIFY_WIDGET.includes(type) && <WidgetVerify {...props} />}
          {/* 选项其他项必填提示文案 */}
          {_.includes([9, 10, 11], type) && _.find(options, i => i.key === 'other' && !i.isDeleted) && (
            <WidgetOtherExplain {...props} />
          )}
          {/**宽度设置 */}
          {canAdjustWidth(widgets, data) && <WidgetWidth {...props} handleClick={handleAdjustWidthClick} />}
        </Fragment>
      )}
    </Fragment>
  );
}
