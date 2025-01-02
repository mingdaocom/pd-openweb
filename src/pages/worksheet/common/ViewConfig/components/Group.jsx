import React, { useState, useEffect } from 'react';
import { updateViewAdvancedSetting } from 'src/pages/worksheet/common/ViewConfig/util.js';
import DropDownSet from './DropDownSet';
import _ from 'lodash';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';

export default function Group(props) {
  const { appId, view, updateCurrentView, worksheetControls = [], columns, currentSheetInfo } = props;
  const { viewControl = '' } = view;

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
        controlList={setSysWorkflowTimeControlFormat(
          worksheetControls.filter(
            item =>
              _.includes([9, 11, 26, 27, 28, 48], item.type) ||
              (item.type === 29 && item.enumDefault === 1) ||
              (item.type === 30 &&
                _.includes([9, 11, 26, 27, 28, 48], item.sourceControlType) &&
                (item.strDefault || '').split('')[0] !== '1'),
          ),
          currentSheetInfo.switches || [],
        )}
        key="viewControl"
        title={_l('分组')}
        txt={_l('选择一个字段，记录将以该字段的值作为分组在显示左侧')}
        // notFoundContent={}
      />
    </React.Fragment>
  );
}
