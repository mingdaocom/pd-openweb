import React, { Fragment } from 'react';
import { RadioGroup } from 'ming-ui';
import SortColumns from 'src/pages/worksheet/components/SortColumns/SortColumns';
import { SettingItem } from '../../../../styled';
import { getFilterRelateControls } from '../../../../util';
import { getAdvanceSetting, getControlsSorts, handleAdvancedSettingChange } from '../../../../util/setting';

const DISPLAY_OPTIONS = [
  { text: _l('与关联记录的显示字段保持一致'), value: '0' },
  { text: _l('自定义（显示50个）'), value: '1' },
];

export default function ShowControls(props) {
  const { data, controls = [], handleChange } = props;
  const { showControls = [] } = data;
  const { chooseshow = '0' } = getAdvanceSetting(data);
  const chooseshowids = getAdvanceSetting(data, 'chooseshowids') || [];
  const filterControls = getFilterRelateControls(controls, data.showControls);

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('显示规则')}</div>
        <RadioGroup
          size="middle"
          className="fixedWidth"
          checkedValue={chooseshow}
          data={DISPLAY_OPTIONS}
          onChange={value => {
            handleChange(
              handleAdvancedSettingChange(data, {
                chooseshow: value,
                ...(value === '0' ? { chooseshowids: '', choosecontrolssorts: '' } : {}),
              }),
            );
          }}
        />
      </SettingItem>
      {chooseshow === '1' ? (
        <SortColumns
          layout={2}
          sortAutoChange
          isShowColumns
          noShowCount={true}
          maxSelectedNum={50}
          noempty={false} //不需要至少显示一列
          showControls={chooseshowids}
          columns={filterControls}
          controlsSorts={getControlsSorts(data, filterControls, 'choosecontrolssorts')}
          onChange={({ newShowControls, newControlSorts }) => {
            handleChange(
              handleAdvancedSettingChange(data, {
                chooseshowids: JSON.stringify(newShowControls),
                choosecontrolssorts: JSON.stringify(newControlSorts),
              }),
            );
          }}
          showTabs={true}
        />
      ) : (
        <div className="Gray_9e mTop10">{_l('显示%0个', showControls.length)}</div>
      )}
    </Fragment>
  );
}
