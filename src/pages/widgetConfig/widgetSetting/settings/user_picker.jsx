import React, { Fragment } from 'react';
import { RadioGroup } from 'ming-ui';
import { Tooltip } from 'antd';
import { SettingItem } from '../../styled';

const DISPLAY_OPTIONS = [
  {
    text: _l('单选'),
    value: 0,
  },
  {
    text: _l('多选'),
    value: 1,
  },
];
const ADVANCE_SETTING = [
  {
    value: 1,
    children: (
      <span>
        {_l('作为成员')}
        <Tooltip placement="bottom" title={_l('加入的人员允许查看记录')}>
          <i className="icon-help Gray_9e Font16 mLeft5"></i>
        </Tooltip>
      </span>
    ),
  },
  {
    value: 2,
    children: (
      <span>
        {_l('作为记录拥有者')}
        <Tooltip placement="bottom" title={_l('加入的人员可以管理记录')}>
          <i className="icon-help Gray_9e Font16 mLeft5"></i>
        </Tooltip>
      </span>
    ),
  },
  {
    value: 0,
    children: (
      <span>
        {_l('仅用于记录人员数据')}
        <Tooltip placement="bottom" title={_l('加入的人员将仅作为数据记录，不会授予任何权限')}>
          <i className="icon-help Gray_9e Font16 mLeft5"></i>
        </Tooltip>
      </span>
    ),
  },
];
export default function UserPicker({ from, data, onChange }) {
  const { enumDefault, userPermission } = data;
  return (
    <Fragment>
      <SettingItem>
        <RadioGroup
          size="middle"
          checkedValue={enumDefault}
          data={DISPLAY_OPTIONS}
          onChange={value => onChange({ enumDefault: value })}
        />
      </SettingItem>
      {from !== 'subList' && (
        <SettingItem>
          <div className="settingItemTitle">{_l('权限')}</div>
          <RadioGroup
            vertical
            size="middle"
            data={ADVANCE_SETTING}
            checkedValue={userPermission}
            onChange={value =>
              onChange({
                userPermission: value,
                noticeItem: Number(_.includes([1, 2], value)),
              })
            }
          />
        </SettingItem>
      )}
    </Fragment>
  );
}
