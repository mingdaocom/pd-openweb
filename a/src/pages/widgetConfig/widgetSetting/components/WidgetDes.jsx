import React from 'react';
import { Input } from 'antd';
import { SettingItem } from '../../styled';

export default function WidgetDes({ data, onChange }) {
  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('字段说明')}</div>
      <Input.TextArea autoSize={false} rows={3} value={data.desc} onChange={e => onChange({ desc: e.target.value })} />
    </SettingItem>
  );
}
