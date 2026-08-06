import React from 'react';
import { updateViewAdvancedSetting } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';
import DropDownSet from './DropDownSet';

const GUNTER_GROUP_CONTROL_TYPES = [9, 11, 26, 27, 28, 48];

export function isGunterGroupControl(item = {}) {
  return (
    GUNTER_GROUP_CONTROL_TYPES.includes(item.type) ||
    (item.type === 29 && item.enumDefault === 1) ||
    (item.type === 30 &&
      GUNTER_GROUP_CONTROL_TYPES.includes(item.sourceControlType) &&
      (item.strDefault || '').split('')[0] !== '1')
  );
}

export function getGunterGroupControlInvalidText(viewControl = '', worksheetControls = [], controlList = []) {
  if (!viewControl || controlList.find(item => item.controlId === viewControl)) {
    return '';
  }

  return worksheetControls.find(item => item.controlId === viewControl) ? _l('该字段不支持') : _l('该字段已删除');
}

export default function Group(props) {
  const { appId, view, updateCurrentView, worksheetControls = [], currentSheetInfo } = props;
  const { viewControl = '' } = view;
  const controlList = setSysWorkflowTimeControlFormat(
    worksheetControls.filter(isGunterGroupControl),
    currentSheetInfo.switches || [],
  );
  const invalidValueText = getGunterGroupControlInvalidText(viewControl, worksheetControls, controlList);

  const getViewControlType = value => {
    const data = worksheetControls.find(o => o.controlId === value) || {};
    return data.type === 30 ? data.sourceControlType : data.type;
  };

  return (
    <React.Fragment>
      <DropDownSet
        {...props}
        handleChange={value => {
          updateCurrentView({
            ...view,
            appId,
            viewControl: value,
            advancedSetting: updateViewAdvancedSetting(view, {
              navshow: [26, 27, 48].includes(getViewControlType(value)) ? '1' : '0',
              navfilters: JSON.stringify([]),
              navsorts: '',
              customitems: '',
            }),
            editAttrs: ['viewControl', 'advancedSetting'],
          });
        }}
        className="mTop32"
        setDataId={viewControl}
        controlList={controlList}
        invalidValueText={invalidValueText}
        key="viewControl"
        title={_l('分组')}
        txt={_l('选择一个字段，记录将以该字段的值作为分组在显示左侧')}
        // notFoundContent={}
      />
    </React.Fragment>
  );
}
