import React from 'react';
import { RadioGroup } from 'ming-ui';
import { SettingItem } from '../../../styled';
import SortColumns from 'src/pages/worksheet/components/SortColumns/SortColumns';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';
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

  const renderContent = () => {
    const textArr = abstractIds
      .map(i =>
        _.get(
          _.find(filterControls, f => f.controlId === i),
          'controlName',
        ),
      )
      .filter(_.identity)
      .join('、');
    return (
      <div className="Dropdown--input Dropdown--border Hand">
        {_.isEmpty(abstractIds) ? <span className="Gray_9e">{_l('显示前3列')}</span> : <span>{textArr}</span>}
        <div className="ming Icon icon icon-arrow-down-border mLeft8 Gray_9e" />
      </div>
    );
  };

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
          noempty={false}
          showControls={abstractIds}
          columns={filterControls}
          maxSelectedNum={3}
          children={renderContent()}
          showOperate={false}
          dragable={false}
          onChange={({ newShowControls }) => {
            onChange(handleAdvancedSettingChange(data, { h5abstractids: JSON.stringify(newShowControls) }));
          }}
        />
      </SettingItem>
    </MobileSubListWrap>
  );
}
