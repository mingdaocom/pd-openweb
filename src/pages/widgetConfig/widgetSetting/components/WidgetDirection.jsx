import React from 'react';
import _ from 'lodash';
import { Select } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';

const DIRECTION_OPTIONS = [
  { value: '0', label: _l('横向排列') },
  { value: '1', label: _l('纵向排列') },
];

export default ({ data, onChange }) => (
  <div className="settingItem">
    <div className="settingItemTitle">{_l('排列方式')}</div>
    <Select
      style={{ width: '100%', backgroundColor: 'var(--color-background-primary)' }}
      options={DIRECTION_OPTIONS}
      value={_.get(getAdvanceSetting(data), 'direction') || '0'}
      onChange={direction => onChange(handleAdvancedSettingChange(data, { direction }))}
    />
  </div>
);
