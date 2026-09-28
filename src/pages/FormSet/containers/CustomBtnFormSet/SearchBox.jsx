import React from 'react';
import { Icon } from 'ming-ui';
import { Input } from 'ming-ui/antd-components';

export default function SearchBox({ value, onChange }) {
  return (
    <Input
      allowClear
      radius
      className="mTop16 mBottom12"
      prefix={<Icon icon="search" className="textTertiary Font20" />}
      value={value}
      placeholder={_l('动作名称')}
      style={{ width: 320 }}
      onChange={e => onChange(e.target.value)}
    />
  );
}
