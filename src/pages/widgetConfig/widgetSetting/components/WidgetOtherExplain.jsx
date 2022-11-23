import React from 'react';
import { Input } from 'antd';
import { SettingItem } from '../../styled';
import { getAdvanceSetting } from '../../util/setting';

export default ({ data, onChange }) => {
  const { otherhint } = getAdvanceSetting(data);
  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('补充信息的引导文字')}</div>
      <Input
        placeholder={_l('请输入补充信息')}
        value={otherhint}
        onChange={e => onChange({ otherhint: e.target.value })}
      />
    </SettingItem>
  );
};
