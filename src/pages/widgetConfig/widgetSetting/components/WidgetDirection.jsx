import React from 'react';
import _ from 'lodash';
import { Dropdown } from 'ming-ui';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';

export default ({ data, onChange }) => (
  <div className="settingItem">
    <div className="settingItemTitle">{_l('排列方式')}</div>
    <Dropdown
      style={{ width: '100%', backgroundColor: '#fff' }}
      data={[
        { value: '0', name: _l('横向排列') },
        { value: '1', name: _l('纵向排列') },
      ]}
      value={_.get(getAdvanceSetting(data), 'direction') || '0'}
      onChange={direction => onChange(handleAdvancedSettingChange(data, { direction }))}
    />
  </div>
);
