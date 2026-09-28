import React, { Fragment, lazy, Suspense } from 'react';
import _ from 'lodash';
import { LoadDiv } from 'ming-ui';
import {
  HAS_DYNAMIC_DEFAULT_VALUE_CONTROL,
  HAS_WARNING_CONTROL,
  NO_CUSTOM_SETTING_CONTROL,
  NO_VERIFY_WIDGET,
} from 'src/utils/domain/control/config';
import { canAdjustWidth } from 'src/utils/domain/control/editorSetting';
import { changeWidgetSize } from 'src/utils/domain/control/layout';
import { isCustomWidget } from 'src/utils/domain/control/metadata';
import { enumWidgetType } from 'src/utils/domain/control/widgetTypes';
import WidgetCustom from '../CustomWidget/WidgetCustom';
import DynamicDefaultValue from '../DynamicDefaultValue';
import WidgetName from '../WidgetName';
import WidgetVerify from '../WidgetVerify';
import WidgetOtherExplain from './WidgetOtherExplain';
import WidgetWarning from './WidgetWarning';
import WidgetWidth from './WidgetWidth';

const settingContext = require.context('../../settings', false, /\.jsx$/, 'lazy');
const settingKeys = settingContext.keys();
const settingComponentCache = {};

const getSettingComponent = typeName => {
  if (!typeName) return null;

  const settingPath = `./${typeName.toLowerCase()}.jsx`;
  if (!settingKeys.includes(settingPath)) return null;

  if (!settingComponentCache[typeName]) {
    settingComponentCache[typeName] = lazy(() => settingContext(settingPath));
  }

  return settingComponentCache[typeName];
};

// 高级设置
export default function WidgetBase(props) {
  const { data = {}, widgets = [], setWidgets, setActiveWidget, ...rest } = props;
  const { type, options = [], controlId } = data;
  const ENUM_TYPE = enumWidgetType[type];
  const SettingComponent = getSettingComponent(ENUM_TYPE);

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
      {!NO_CUSTOM_SETTING_CONTROL.includes(type) && !rest.type && SettingComponent && (
        <Suspense fallback={<LoadDiv className="mTop10" />}>{React.createElement(SettingComponent, props)}</Suspense>
      )}
      {/* 快速创建字段暂时隐藏更多内容 */}
      {!rest.quickAddControl && (
        <Fragment>
          {HAS_DYNAMIC_DEFAULT_VALUE_CONTROL.includes(type) && <DynamicDefaultValue {...props} from={0} />}
          {!NO_VERIFY_WIDGET.includes(type) && <WidgetVerify {...props} />}
          {/* 选项其他项必填提示文案 */}
          {_.includes([9, 10, 11], type) && _.find(options, (i = {}) => i.key === 'other' && !i.isDeleted) && (
            <WidgetOtherExplain {...props} />
          )}
          {/**宽度设置 */}
          {canAdjustWidth(widgets, data) && <WidgetWidth {...props} handleClick={handleAdjustWidthClick} />}
        </Fragment>
      )}
    </Fragment>
  );
}
