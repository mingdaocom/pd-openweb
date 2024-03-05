import React, { useState, useEffect } from 'react';
import { updateViewAdvancedSetting } from 'src/pages/worksheet/common/ViewConfig/util.js';
import DropDownSet from './DropDownSet';
import NavShow from 'src/pages/worksheet/common/ViewConfig/components/navGroup/NavShow';
import { NAVSHOW_TYPE } from 'src/pages/worksheet/common/ViewConfig/components/navGroup/util';
import _ from 'lodash';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';

export default function Group(props) {
  const { appId, view, updateCurrentView, worksheetControls = [], columns, currentSheetInfo } = props;
  const { advancedSetting = {}, viewControl = '' } = view;
  const { navshow = '0', navfilters = '[]' } = advancedSetting;

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
      {!!viewControl && (
        <NavShow
          params={{
            types: NAVSHOW_TYPE.filter(o => {
              //选项作为分组，分组没有筛选
              if ([9, 10, 11].includes((worksheetControls.find(it => it.controlId === viewControl) || {}).type)) {
                return o.value !== '3';
              } else {
                return true;
              }
            }),
            txt: _l('显示项'),
          }}
          value={navshow}
          onChange={newValue => {
            updateCurrentView({
              ...view,
              appId,
              advancedSetting: newValue,
              editAttrs: ['advancedSetting'],
              editAdKeys: Object.keys(newValue),
            });
          }}
          advancedSetting={view.advancedSetting}
          navfilters={navfilters}
          filterInfo={{
            allControls: worksheetControls,
            globalSheetInfo: _.pick(currentSheetInfo, [
              'appId',
              'groupId',
              'name',
              'projectId',
              'roleType',
              'worksheetId',
              'switches',
            ]),
            columns,
            viewControl,
          }}
        />
      )}
    </React.Fragment>
  );
}
