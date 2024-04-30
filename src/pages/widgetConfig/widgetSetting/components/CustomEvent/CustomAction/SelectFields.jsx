import React from 'react';
import _ from 'lodash';
import { SettingItem } from '../../../../styled';
import { SYS_CONTROLS, SYS } from 'src/pages/widgetConfig/config/widget';
import ActionDropDown from 'src/pages/FormSet/components/columnRules/actionDropdown/ActionDropDown.jsx';

export default function SelectFields(props) {
  const { allControls, actionType, actionItems = [], onSelectField = () => {} } = props;
  const filterSysControls = allControls.filter(i => !_.includes(SYS_CONTROLS.concat(SYS), i.controlId));
  return (
    <SettingItem className={props.className}>
      <div className="settingItemTitle">{_l('字段')}</div>
      <ActionDropDown
        actionType={Number(actionType)}
        values={actionItems}
        dropDownData={filterSysControls}
        // popupContainer={document.body}
        onChange={(key, value) => {
          onSelectField(value);
        }}
      />
    </SettingItem>
  );
}
