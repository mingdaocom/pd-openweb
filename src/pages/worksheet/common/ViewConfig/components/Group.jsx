import React, { useState, useEffect } from 'react';
import { updateViewAdvancedSetting } from 'src/pages/worksheet/common/ViewConfig/util.js';
import DropDownSet from './DropDownSet';
import _ from 'lodash';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';

export default function Group(props) {
  const { appId, view, updateCurrentView, worksheetControls = [], columns, currentSheetInfo } = props;
  const { viewControl = '' } = view;

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
              navshow: '0',
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
            item => _.includes([9, 11], item.type) || (item.type === 29 && item.enumDefault === 1),
          ),
          currentSheetInfo.switches || [],
        )}
        key="viewControl"
        title={_l('分组')}
        txt={_l('选择一个单选项或关联记录单条字段，记录将以选中项作为分组在显示左侧')}
        // notFoundContent={}
      />
    </React.Fragment>
  );
}
