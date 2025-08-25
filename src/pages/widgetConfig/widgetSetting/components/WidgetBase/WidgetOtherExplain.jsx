import React, { useEffect } from 'react';
import { Input } from 'antd';
import _ from 'lodash';
import { SettingItem } from '../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';

export default ({ data, onChange }) => {
  const { otherhint } = getAdvanceSetting(data);

  useEffect(() => {
    if (_.isUndefined(otherhint)) {
      onChange(handleAdvancedSettingChange(data, { otherhint: _l('请输入补充信息') }));
    }
  }, []);

  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('补充信息的引导文字')}</div>
      <Input
        placeholder={_l('请输入补充信息')}
        value={otherhint}
        onChange={e => onChange(handleAdvancedSettingChange(data, { otherhint: e.target.value }))}
      />
    </SettingItem>
  );
};
