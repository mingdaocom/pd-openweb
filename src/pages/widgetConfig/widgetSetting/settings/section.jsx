import React from 'react';
import { SettingItem } from '../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';
import IconSetting from '../components/SplitLineConfig/IconSetting';
import { SectionItem } from '../components/SplitLineConfig/style';

export default function Section(props) {
  const { data, globalSheetInfo, onChange } = props;
  const { icon = '' } = getAdvanceSetting(data);

  return (
    <SettingItem>
      <SectionItem>
        <div className="label">{_l('图标')}</div>
        <IconSetting
          type={data.type}
          icon={icon}
          iconColor="#9e9e9e"
          projectId={globalSheetInfo.projectId}
          handleClick={value =>
            onChange(handleAdvancedSettingChange(data, { icon: value ? JSON.stringify(value) : '' }))
          }
        />
      </SectionItem>
    </SettingItem>
  );
}
