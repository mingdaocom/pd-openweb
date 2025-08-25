import React from 'react';
import _ from 'lodash';
import ActionDropDown from 'src/pages/FormSet/components/columnRules/actionDropdown/ActionDropDown.jsx';
import { SYS, SYS_CONTROLS } from 'src/pages/widgetConfig/config/widget';
import { SettingItem } from '../../../../styled';
import { ACTION_VALUE_ENUM } from '../config';

export default function SelectFields(props) {
  const { allControls, actionType, actionItems = [], onSelectField = () => {}, disabled } = props;
  const filterSysControls = allControls.filter(i => !_.includes(SYS_CONTROLS.concat(SYS), i.controlId));
  return (
    <SettingItem className={props.className}>
      <div className="settingItemTitle">{_l('字段')}</div>
      <ActionDropDown
        disabled={disabled}
        actionType={Number(actionType)}
        showSelectAll={actionType !== ACTION_VALUE_ENUM.ACTIVATE_TAB}
        values={actionItems}
        dropDownData={filterSysControls}
        onChange={(key, value) => {
          onSelectField(value);
        }}
      />
    </SettingItem>
  );
}
