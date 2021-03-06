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
} from '../config';
import DynamicDefaultValue from './components/DynamicDefaultValue';
import { enumWidgetType } from '../util';
import { changeWidgetSize } from '../util/widgets';
import { canAdjustWidth } from '../util/setting';
import WidgetVerify from './components/WidgetVerify';
import ControlSetting from './components/ControlSetting';
import components from './components';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
const { WidgetIntro, WidgetExplain, WidgetDes, WidgetPermission, WidgetName, WidgetWidth, WidgetMobileInput } =
  components;

const SettingWrap = styled.div`
  position: relative;
  width: 350px;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
  background-color: #fff;
  border-left: 1px solid #ddd;
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
  const { type, controlId, advancedSetting = {} } = data;
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
    if (isEmpty(data)) return <div className="emptyStatus">{'?????????????????????'}</div>;
    if ([17, 18].includes(type)) return <div className="emptyStatus">{_l('??????????????????????????????????????????')}</div>;
    return (
      <ScrollView>
        <div className="settingContentWrap">
          {/* ????????????????????? */}
          {!includes([34], type) && (
            <Fragment>
              {!rest.withoutIntro && <WidgetIntro {...allProps} />}
              {/* // ????????????????????? */}
              {type !== 10010 && <WidgetName {...allProps} />}
            </Fragment>
          )}
          {/* rest.type ??????????????????????????????????????? */}
          {!NO_CUSTOM_SETTING_CONTROL.includes(type) && !rest.type && <Components {...allProps} />}
          {/* ?????????????????????????????????????????? */}
          {!rest.quickAddControl && (
            <Fragment>
              {HAS_DYNAMIC_DEFAULT_VALUE_CONTROL.includes(type) && <DynamicDefaultValue {...allProps} />}
              {!NO_VERIFY_WIDGET.includes(type) && <WidgetVerify {...allProps} />}
              {(HAVE_CONFIG_CONTROL.includes(type) ||
                (type === 10 && advancedSetting.checktype === '1') ||
                (type === 11 && advancedSetting.showtype !== '2')) && <ControlSetting {...allProps} />}
              {!NO_PERMISSION_WIDGET.includes(type) && <WidgetPermission {...allProps} />}
              {/* // ??????????????????????????? */}
              {includes([2], type) && <WidgetMobileInput {...allProps} />}
              {canAdjustWidth(widgets, data) && <WidgetWidth {...allProps} handleClick={handleAdjustWidthClick} />}
              {HAS_EXPLAIN_CONTROL.includes(type) && <WidgetExplain {...allProps} />}
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
