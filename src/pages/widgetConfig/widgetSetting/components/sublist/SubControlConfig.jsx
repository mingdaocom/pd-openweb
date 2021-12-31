import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Setting from '../../settings';
import DynamicDefaultValue from '../DynamicDefaultValue';
import {
  HAVE_CONFIG_SUB_LIST,
  NO_VERIFY_WIDGET,
  HAS_DYNAMIC_DEFAULT_VALUE_CONTROL,
  NO_PERMISSION_WIDGET,
} from '../../../config';
import { enumWidgetType } from '../../../util';
import WidgetVerify from '../WidgetVerify';
import components from '../';
import ControlSetting from '../ControlSetting';
const { WidgetIntro, WidgetName, WidgetPermission } = components;

const SubControlConfigWrap = styled.div`
  position: absolute;
  background: #fff;
  top: 0;
  left: 0;
  width: 100%;
  padding: 0 24px;
  bottom: 0;
  z-index: 9;
  overflow: auto;
  overflow-x: hidden;
  padding-bottom: 36px;
  .backToSupConfig {
    line-height: 36px;
    padding: 12px 0;
    font-size: 15px;
    color: #333;
    span {
      margin-left: 6px;
    }
  }
  .introSwitch .introSwitchMenu {
    width: 160px;
  }
`;

const widgetEnum = {
  11: { type: 10, name: _l('多选') },
  9: { type: 10, name: _l('多选') },
  10: { type: 9, name: _l('单选') },
  41: { type: 2, name: _l('文本') },
  2: { type: 41, name: _l('富文本') },
};
export default function SubControlConfig({
  subListData,
  controls,
  control,
  backTop,
  changeWidgetData,
  globalSheetInfo,
  allControls,
  ...rest
}) {
  const { controlId, type, hint, desc } = control || {};
  const { controlName, dataSource: subListSheetId } = subListData;
  const SettingModel = Setting[enumWidgetType[type]];
  const handleChange = obj => {
    changeWidgetData(controlId, obj);
  };
  const subListProps = {
    data: control,
    onChange: handleChange,
    from: 'subList',
    globalSheetInfo,
    allControls: controls.filter(c => c.controlId !== controlId),
    globalSheetControls: allControls,
    hideSearchAndFun: true,
  };
  return (
    <SubControlConfigWrap>
      <div className="backToSupConfig pointer" onClick={backTop}>
        <i className="icon-arrow-left-border Font18 Gray_75"></i>
        <span className="Bold">{controlName}</span>
      </div>
      <WidgetIntro from="subList" data={control} onChange={handleChange} />
      <WidgetName {...subListProps} />
      {SettingModel && (
        <SettingModel
          {...rest}
          {...subListProps}
          subListSheetId={subListSheetId}
          subListData={subListData}
          data={control}
        />
      )}
      {HAS_DYNAMIC_DEFAULT_VALUE_CONTROL.includes(type) && (
        <DynamicDefaultValue {..._.omit(rest, 'onChange')} {...subListProps} />
      )}
      {!NO_VERIFY_WIDGET.includes(type) && <WidgetVerify {...subListProps} />}
      {HAVE_CONFIG_SUB_LIST.includes(type) && <ControlSetting {...subListProps} />}
      {!NO_PERMISSION_WIDGET.includes(type) && <WidgetPermission {...subListProps} />}
      {/* {!_.includes(NO_CONTENT_CONTROL, type) && (
        <div className="widgetCommonConfig">
          {!_.includes(NO_GUIDE_TEXT_CONTROL, type) && <WidgetExplain value={hint} onChange={changeWidgetData} />}
          <WidgetDes value={desc} onWidgetChange={changeWidgetData} />
        </div>
      )} */}
    </SubControlConfigWrap>
  );
}
