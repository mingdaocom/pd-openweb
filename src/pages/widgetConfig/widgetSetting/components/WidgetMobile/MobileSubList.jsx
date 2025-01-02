import React from 'react';
import { RadioGroup } from 'ming-ui';
import { SettingItem } from '../../../styled';
import SortColumns from 'src/pages/worksheet/components/SortColumns/SortColumns';
import { getAdvanceSetting, handleAdvancedSettingChange, getControlsSorts } from '../../../util/setting';
import styled from 'styled-components';

const MobileSubListWrap = styled.div`
  .targetEle .Dropdown--input {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #ccc;
    line-height: 34px;
    padding: 0 12px;
    border-radius: 3px;
  }
`;

const DISPLAY_OPTIONS = [
  {
    text: _l('列表'),
    value: '1',
  },
  {
    text: _l('平铺'),
    value: '2',
  },
];

// 移动端设置
export default function MobileSubList({ data, onChange }) {
  const { showControls = [], relationControls = [] } = data;
  let { h5showtype = '1', h5abstractids } = getAdvanceSetting(data);
  const abstractIds = safeParse(h5abstractids || '[]').filter(i => _.find(relationControls, r => r.controlId === i));

  const filterControls = relationControls.filter(i => _.includes(showControls, i.controlId));

  return (
    <MobileSubListWrap>
      <SettingItem className="mTop0">
        <div className="settingItemTitle">{_l('显示样式')}</div>
        <RadioGroup
          size="middle"
          checkedValue={h5showtype}
          data={DISPLAY_OPTIONS}
          onChange={value => {
            onChange(handleAdvancedSettingChange(data, { h5showtype: value }));
          }}
        />
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('摘要字段（最多3个）')}</div>
        <SortColumns
          sortAutoChange
          isShowColumns
          empty={_l('显示前3列')}
          noempty={false}
          showControls={abstractIds}
          columns={filterControls}
          maxSelectedNum={3}
          controlsSorts={getControlsSorts(data, filterControls, 'h5abstractids')}
          showOperate={false}
          dragable={true}
          onChange={({ newShowControls, newControlSorts }) => {
            const nextSortControls = newControlSorts.filter(item => _.includes(newShowControls, item));
            onChange(handleAdvancedSettingChange(data, { h5abstractids: JSON.stringify(nextSortControls) }));
          }}
        />
      </SettingItem>
    </MobileSubListWrap>
  );
}
