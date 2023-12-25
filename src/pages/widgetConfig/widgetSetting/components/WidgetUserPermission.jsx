import React from 'react';
import { Dropdown } from 'ming-ui';
import { SettingItem } from '../../styled';
import { SheetViewWrap } from '../../styled';

const TYPE_OPTIONS = [
  {
    text: (
      <span>
        {_l('成员')}
        <span className="subText Gray_9e">（{_l('可查看记录')}）</span>
      </span>
    ),
    value: 1,
  },
  {
    text: (
      <span>
        {_l('拥有者')}
        <span className="subText Gray_9e">（{_l('可编辑、删除记录')}）</span>
      </span>
    ),
    value: 2,
  },
  {
    text: (
      <span>
        {_l('无')}
        <span className="subText Gray_9e">（{_l('仅存储数据')}）</span>
      </span>
    ),
    value: 0,
  },
];

const DISPLAY_OPTIONS = [
  {
    value: 0,
    text: _l('仅当前部门人员'),
  },
  {
    value: 1,
    text: _l('包含所有下级部门人员'),
  },
];

export default function WidgetUserPermission({ data, onChange }) {
  const { userPermission, type, enumDefault2 = 0 } = data;

  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('权限')}</div>
      <Dropdown
        border
        data={TYPE_OPTIONS}
        renderTitle={({ value }) => {
          return _.get(
            _.find(TYPE_OPTIONS, t => t.value === value),
            'text',
          );
        }}
        value={userPermission}
        onChange={value =>
          onChange({
            userPermission: value,
            enumDefault2: _.includes([1, 2], value) ? enumDefault2 : 0,
          })
        }
      />
      {_.includes([1, 2], userPermission) && _.includes([27], type) && (
        <SheetViewWrap>
          <div className="viewCon">{_l('范围')}</div>
          <Dropdown
            border
            className="flex"
            value={enumDefault2}
            data={DISPLAY_OPTIONS}
            onChange={value => onChange({ enumDefault2: value })}
          />
        </SheetViewWrap>
      )}
    </SettingItem>
  );
}
