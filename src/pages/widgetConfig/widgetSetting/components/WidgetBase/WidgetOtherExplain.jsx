import React, { useEffect } from 'react';
import _ from 'lodash';
import { Input } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { SettingItem } from '../../../styled';

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
