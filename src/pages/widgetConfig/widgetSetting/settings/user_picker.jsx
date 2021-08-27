import React, { useState, useEffect, Fragment } from 'react';
import { RadioGroup, Checkbox } from 'ming-ui';
import { Tooltip } from 'antd';
import { string } from 'prop-types';
import { SettingItem } from '../../styled';
import { WHOLE_SIZE } from '../../config/Drag';

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
    text: _l('作为成员'),
    children: (
      <Tooltip placement="bottom" title={_l('加入的人员允许查看记录')}>
        <i className="icon-help Gray_9e Font16 mLeft5"></i>
      </Tooltip>
    ),
  },
  {
    value: 2,
    text: _l('作为记录拥有者'),
    children: (
      <Tooltip placement="bottom" title={_l('加入的人员可以管理记录')}>
        <i className="icon-help Gray_9e Font16 mLeft5"></i>
      </Tooltip>
    ),
  },
  {
    value: 0,
    text: _l('仅用于记录人员数据'),
    children: (
      <Tooltip placement="bottom" title={_l('加入的人员将仅作为数据记录，不会授予任何权限')}>
        <i className="icon-help Gray_9e Font16 mLeft5"></i>
      </Tooltip>
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
          onChange={value => onChange({ enumDefault: value, size: value ? WHOLE_SIZE : WHOLE_SIZE / 2 })}
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
