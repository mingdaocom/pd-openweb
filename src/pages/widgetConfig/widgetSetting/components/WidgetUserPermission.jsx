import React, { useEffect, useState } from 'react';
import { Tooltip } from 'antd';
import { RadioGroup } from 'ming-ui';
import { SettingItem } from '../../styled';

const TYPE_OPTIONS = {
  26: _l('成员'),
  27: _l('部门'),
  48: _l('组织角色'),
};

const getPermissionOptions = type => {
  const text = TYPE_OPTIONS[type];
  return [
    {
      value: 1,
      children: (
        <span>
          {_l('成员')}
          <Tooltip placement="bottom" title={_l('加入的%0允许查看记录', text)}>
            <i className="icon-help Gray_9e Font16 mLeft5"></i>
          </Tooltip>
        </span>
      ),
    },
    {
      value: 2,
      children: (
        <span>
          {_l('拥有者')}
          <Tooltip placement="bottom" title={_l('加入的%0允许编辑、删除记录', text)}>
            <i className="icon-help Gray_9e Font16 mLeft5"></i>
          </Tooltip>
        </span>
      ),
    },
    {
      value: 0,
      children: (
        <span>
          {_l('仅用于存储数据')}
          <Tooltip placement="bottom" title={_l('加入的%0不授予任何权限', text)}>
            <i className="icon-help Gray_9e Font16 mLeft5"></i>
          </Tooltip>
        </span>
      ),
    },
  ];
};

export default function WidgetUserPermission({ data, onChange }) {
  const { userPermission, type } = data;
  const [options, setOptions] = useState([]);

  useEffect(() => {
    setOptions(getPermissionOptions(type));
  }, [type]);

  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('权限')}</div>
      <RadioGroup
        vertical
        size="middle"
        data={options}
        checkedValue={userPermission}
        onChange={value =>
          onChange({
            userPermission: value,
          })
        }
      />
    </SettingItem>
  );
}
