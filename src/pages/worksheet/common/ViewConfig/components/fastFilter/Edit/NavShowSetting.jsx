import React from 'react';
import _ from 'lodash';
import NavShow from 'src/pages/worksheet/common/ViewConfig/components/navGroup/NavShow';
import { NAVSHOW_TYPE } from 'src/pages/worksheet/common/ViewConfig/components/navGroup/util';
import { NAV_SHOW_TYPE } from '../util';

// 选项、人员等字段的快速筛选显示项配置。
export default function NavShowSetting(props) {
  const { dataType, control, worksheetControls, currentSheetInfo, view, activeFastFilterId, updateViewSet } = props;

  if (!NAV_SHOW_TYPE.keys.includes(dataType)) {
    return null;
  }

  const { advancedSetting = {}, controlId } = control;
  const info = worksheetControls.find(it => it.controlId === controlId) || {};
  const { navshow, navfilters = [] } = advancedSetting;

  return (
    <NavShow
      canShowNull
      fromCondition="fastFilter"
      params={{
        types: NAVSHOW_TYPE.filter(o => o.value !== '1').filter(o => {
          // 选项作为分组时，分组没有筛选。
          const type = info.type === 30 ? info.sourceControlType : info.type;

          if ([9, 10, 11, 26].includes(type)) {
            return o.value !== '3';
          }

          return true;
        }),
        txt: _l('显示项'),
      }}
      value={navshow}
      onChange={newValue => {
        // 隐藏空值项时，如果当前默认值就是“为空”，需要同步清空默认值。
        if (
          newValue.shownullitem !== '1' &&
          newValue.shownullitem !== advancedSetting.shownullitem &&
          control.values[0]
        ) {
          const data = safeParse(control.values);

          if (data.id === 'isEmpty') {
            newValue.values = JSON.stringify([]);
            return updateViewSet({
              advancedSetting: { ...advancedSetting, ...newValue },
            });
          }
        }

        updateViewSet({
          advancedSetting: { ...advancedSetting, ...newValue },
        });
      }}
      advancedSetting={advancedSetting}
      navfilters={navfilters}
      filterInfo={{
        allControls: info.relationControls,
        globalSheetInfo: _.pick(currentSheetInfo, [
          'appId',
          'groupId',
          'name',
          'projectId',
          'roleType',
          'worksheetId',
          'switches',
        ]),
        globalSheetControls: [
          ...view.fastFilters.map(o => worksheetControls.find(it => it.controlId === o.controlId)),
          view.navGroup && view.navGroup.length > 0
            ? {
                ...worksheetControls.find(it => it.controlId === view.navGroup[0].controlId),
                isNavGroup: true,
              }
            : null,
        ].filter(it => !!it && _.get(it, 'controlId') !== activeFastFilterId),
        columns: worksheetControls,
        navGroupId: controlId,
      }}
    />
  );
}
