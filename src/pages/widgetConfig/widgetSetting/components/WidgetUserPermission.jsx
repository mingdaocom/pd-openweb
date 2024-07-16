import React from 'react';
import { Dropdown } from 'ming-ui';
import { SettingItem } from '../../styled';
import { SheetViewWrap } from '../../styled';
import { Tooltip } from 'antd';

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
    text: _l('仅当前部门成员'),
  },
  {
    value: 1,
    text: _l('当前部门及所有下级部门成员'),
  },
  {
    value: 3,
    text: _l('当前部门负责人'),
  },
  {
    value: 4,
    text: _l('当前部门及所有上级部门负责人'),
  },
];

export default function WidgetUserPermission({ data, onChange }) {
  const { userPermission, type, enumDefault2 = 0 } = data;

  return (
    <SettingItem>
      <div className="settingItemTitle">
        {_l('权限')}
        {type === 27 && (
          <Tooltip
            placement="bottom"
            title="若工作表数据过多，当范围设置[当前部门及所有下级部门成员]或[当前部门及所有上级部门负责人]时，用户打开表单或视图时可能会显示异常。"
          >
            <i className="icon-help Gray_9e Font16 Hand mLeft4"></i>
          </Tooltip>
        )}
      </div>
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
            showItemTitle={true}
            onChange={value => onChange({ enumDefault2: value })}
          />
        </SheetViewWrap>
      )}
    </SettingItem>
  );
}
