import React, { Fragment } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import { ScrollView } from 'ming-ui';
import { isEmpty, includes } from 'lodash';
import { DEFAULT_CONFIG } from '../config/widget';
import Settings from './settings';
import {
  NO_CUSTOM_SETTING_CONTROL,
  NO_DES_WIDGET,
  NO_PERMISSION_WIDGET,
  NO_VERIFY_WIDGET,
  HAS_DYNAMIC_DEFAULT_VALUE_CONTROL,
  HAS_EXPLAIN_CONTROL,
  HAVE_CONFIG_CONTROL,
  HAS_WARNING_CONTROL,
  HAVE_MASK_WIDGET,
} from '../config';
import DynamicDefaultValue from './components/DynamicDefaultValue';
import { enumWidgetType } from '../util';
import { changeWidgetSize } from '../util/widgets';
import { canAdjustWidth } from '../util/setting';
import WidgetVerify from './components/WidgetVerify';
import ControlSetting from './components/ControlSetting';
import ControlMask from './components/ControlMask';
import components from './components';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
const {
  WidgetIntro,
  WidgetExplain,
  WidgetOtherExplain,
  WidgetDes,
  WidgetPermission,
  WidgetName,
  WidgetWidth,
  WidgetMobileInput,
  WidgetWarning,
} = components;

const SettingWrap = styled.div`
  position: relative;
  width: 350px;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
  background-color: #fff;
  .emptyStatus {
    margin-top: 240px;
    text-align: center;
  }
  .settingContentWrap {
    width: 350px;
    padding: 24px 20px;
  }
`;

function WidgetSetting(props) {
  const {
    widgets = [],
    activeWidget: data = {},
    handleDataChange,
    queryConfigs = [],
    setActiveWidget,
    setWidgets,
    ...rest
  } = props;
  const { type, controlId, advancedSetting = {}, options = [], enumDefault } = data;
  const ENUM_TYPE = enumWidgetType[type];
  const info = DEFAULT_CONFIG[ENUM_TYPE] || {};
  const queryConfig = _.find(queryConfigs, item => item.controlId === controlId) || {};

  const onChange = (obj, callback) => {
    handleDataChange(controlId, { ...data, ...obj }, callback);
  };

  const handleAdjustWidthClick = value => {
    setWidgets(changeWidgetSize(widgets, { controlId, size: value }));
    setActiveWidget({ ...data, size: value });
  };

  const allProps = { ...rest, data, info, widgets, queryConfig, onChange: onChange };
  const Components = Settings[ENUM_TYPE];

  const renderSetting = () => {
    if (isEmpty(data)) return <div className="emptyStatus">{'没有选中的字段'}</div>;
    if ([17, 18].includes(type)) return <div className="emptyStatus">{_l('日期段控件已下架，不支持配置')}</div>;
    return (
      <ScrollView>
        <div className="settingContentWrap">
          {/* 子表走单独逻辑 */}
          {!includes([34], type) && (
            <Fragment>
              {!rest.withoutIntro && <WidgetIntro {...allProps} />}
              {HAS_WARNING_CONTROL.includes(type) && <WidgetWarning {...allProps} />}
              <WidgetName {...allProps} />
            </Fragment>
          )}
          {/* rest.type 已指定类型的情况下不可更改 */}
          {!NO_CUSTOM_SETTING_CONTROL.includes(type) && !rest.type && <Components {...allProps} />}
          {/* 快速创建字段暂时隐藏更多内容 */}
          {!rest.quickAddControl && (
            <Fragment>
              {HAS_DYNAMIC_DEFAULT_VALUE_CONTROL.includes(type) && <DynamicDefaultValue {...allProps} />}
              {!NO_VERIFY_WIDGET.includes(type) && <WidgetVerify {...allProps} />}
              {HAVE_CONFIG_CONTROL.includes(type) && <ControlSetting {...allProps} />}
              {/**掩码设置 */}
              {(HAVE_MASK_WIDGET.includes(type) ||
                (type === 2 && enumDefault === 2) ||
                (type === 6 && advancedSetting.showtype !== '2')) && <ControlMask {...allProps} />}
              {!NO_PERMISSION_WIDGET.includes(type) && <WidgetPermission {...allProps} />}
              {/* // 文本控件移动端输入 */}
              {includes([2], type) && <WidgetMobileInput {...allProps} />}
              {canAdjustWidth(widgets, data) && <WidgetWidth {...allProps} handleClick={handleAdjustWidthClick} />}
              {(HAS_EXPLAIN_CONTROL.includes(type) ||
                (type === 11 && advancedSetting.showtype !== '2') ||
                (type === 10 && advancedSetting.checktype === '1')) && <WidgetExplain {...allProps} />}
              {includes([9, 10, 11], type) && _.find(options, i => i.key === 'other' && !i.isDeleted) && (
                <WidgetOtherExplain {...allProps} />
              )}
              {!NO_DES_WIDGET.includes(type) && <WidgetDes {...allProps} />}
            </Fragment>
          )}
        </div>
      </ScrollView>
    );
  };

  return <SettingWrap id="widgetConfigSettingWrap">{renderSetting()}</SettingWrap>;
}

export default errorBoundary(WidgetSetting);
