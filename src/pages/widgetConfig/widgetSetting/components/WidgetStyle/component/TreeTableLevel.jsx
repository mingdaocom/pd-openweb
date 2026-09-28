import React from 'react';
import { Segmented } from 'ming-ui/antd-components';
import { SettingItem } from 'src/pages/widgetConfig/styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';

export default function TreeTableLevel(props) {
  const { data, onChange } = props;
  const { defaultlayer } = getAdvanceSetting(data);
  const LEVEL_SETTING_LIST = Array.from({ length: 5 }).map((item, index) => ({
    label: `${index + 1}`,
    value: `${index + 1}`,
  }));

  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('默认展开层级')}</div>
      <Segmented
        block
        value={defaultlayer}
        options={LEVEL_SETTING_LIST}
        onChange={value => onChange(handleAdvancedSettingChange(data, { defaultlayer: value }))}
      />
    </SettingItem>
  );
}
