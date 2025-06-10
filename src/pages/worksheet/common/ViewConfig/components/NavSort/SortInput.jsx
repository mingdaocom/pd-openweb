import React, { Fragment, useState } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { SYSTEM_CONTROLS } from 'worksheet/constants/enum';
import { EditInfo, SettingItem } from 'src/pages/widgetConfig/styled/index.js';
import { getAdvanceSetting } from 'src/pages/widgetConfig/util/index.js';
import Sort from 'src/pages/widgetConfig/widgetSetting/components/sublist/Sort';
import { getSortData } from 'src/utils/control';

export default function (props) {
  const { view, onChange, relationControls, advancedSettingKey, viewControlData, canClear } = props;
  const [{ sortVisible }, setConfig] = useSetState({
    sortVisible: false,
  });

  return (
    <SettingItem className={props.className}>
      <EditInfo className="pointer subListSortInput flexRow" onClick={() => setConfig({ sortVisible: true })}>
        <div className="overflow_ellipsis Gray flex">
          {getAdvanceSetting(view, advancedSettingKey).length > 0 ? (
            getAdvanceSetting(view, advancedSettingKey).reduce((p, item) => {
              const sortsRelationControls = relationControls
                .filter(column => !_.find(SYSTEM_CONTROLS, c => c.controlId === column.controlId))
                .concat(SYSTEM_CONTROLS);
              const control = sortsRelationControls.find(({ controlId }) => item.controlId === controlId) || {};
              const flag = item.isAsc === true ? 2 : 1;
              const { text } = getSortData(control.type, control).find(item => item.value === flag);
              const value = control.controlId ? `${control.controlName}：${text}` : '';
              return p ? `${p}；${value}` : value;
            }, '')
          ) : (
            <span className="Gray_75">
              {!!viewControlData.viewId ? _l('按关联视图的配置') : _l('未设置（按添加时间顺序）')}
            </span>
          )}
        </div>
        {canClear && getAdvanceSetting(view, advancedSettingKey).length > 0 && (
          <div
            className="clearBtn mRight10"
            onClick={e => {
              onChange();
              e.stopPropagation();
            }}
          >
            <i className="icon-cancel1 Hand"></i>
          </div>
        )}
        <div className="edit">
          <i className="icon-edit"></i>
        </div>
      </EditInfo>
      {sortVisible && (
        <Sort
          {...props}
          data={view}
          advancedSettingKey={advancedSettingKey}
          fromRelate
          controls={relationControls}
          onChange={data => {
            onChange(data);
          }}
          onClose={() => setConfig({ sortVisible: false })}
        />
      )}
    </SettingItem>
  );
}
