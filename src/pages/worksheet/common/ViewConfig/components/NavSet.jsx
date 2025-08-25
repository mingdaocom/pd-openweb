import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { NAVSHOW_TYPE } from 'src/pages/worksheet/common/ViewConfig/components/navGroup/util';
import NavShow from './navGroup/NavShow';
import NavSort from './NavSort';

const Wrap = styled.div`
  .Dropdown {
    .Dropdown--input {
      padding: 0 5px 0 12px !important;
    }
  }
`;
export default function NavSet(props) {
  const {
    appId,
    view,
    updateCurrentView,
    worksheetControls = [],
    columns,
    currentSheetInfo,
    viewControlData,
    navGroupId,
    canShowAll,
    canShowNull,
    forBoard,
    hideSort,
  } = props;
  const { advancedSetting = {} } = view;
  const type = viewControlData.type === 30 ? viewControlData.sourceControlType : viewControlData.type;
  const { navshow = [26, 27, 48].includes(type) ? '1' : '0', navfilters = '[]' } = advancedSetting;
  return (
    <Wrap>
      <NavShow
        canShowAll={canShowAll}
        canShowNull={canShowNull}
        params={{
          types: NAVSHOW_TYPE.filter(o =>
            type === 29
              ? forBoard
                ? ['1', '2'].includes(o.value) //看板分组设置异化不显示全部和筛选
                : true //关联记录 4项
              : [9, 10, 11, 28].includes(type) // 排除筛选
                ? o.value !== '3'
                : [26, 27, 48].includes(type) //分组字段为人员时，显示设置只有 显示有数据的项，显示指定项
                  ? ['1', '2'].includes(o.value)
                  : true,
          ),
          txt: _l('显示项'),
        }}
        value={navshow}
        onChange={newValue => {
          let param = newValue;
          if (newValue.navshow === '2') {
            param = { ...param, navsorts: '', customitems: '' };
          }
          updateCurrentView({
            ...view,
            appId,
            advancedSetting: param,
            editAttrs: ['advancedSetting'],
            editAdKeys: Object.keys(param),
          });
        }}
        advancedSetting={advancedSetting}
        navfilters={navfilters}
        filterInfo={{
          allControls: viewControlData.relationControls,
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
          navGroupId,
        }}
      />
      {/*  支持排序的字段：关联记录、人员、选项、等级*/}
      {[29, 26, 9, 10, 11, 28, 27, 48].includes(type) && !['2'].includes(navshow) && (
        <NavSort
          hideSort={hideSort}
          view={view}
          viewControlData={{ ...viewControlData, type }}
          appId={_.get(currentSheetInfo, 'appId')}
          projectId={_.get(currentSheetInfo, 'projectId')}
          controls={worksheetControls}
          advancedSetting={advancedSetting}
          onChange={newValue => {
            updateCurrentView({
              ...view,
              appId,
              advancedSetting: newValue,
              editAttrs: ['advancedSetting'],
              editAdKeys: Object.keys(newValue),
            });
          }}
        />
      )}
    </Wrap>
  );
}
