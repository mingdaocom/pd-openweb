import React, { Fragment } from 'react';
import _ from 'lodash';
import { Segmented } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { SettingItem } from '../../styled';
import ColorSetting from '../components/SplitLineConfig/ColorSetting';
import IconSetting from '../components/SplitLineConfig/IconSetting';
import { SectionItem } from '../components/SplitLineConfig/style';

const getFoldDisplayOptions = () => [
  { label: _l('展开'), value: 1 },
  { label: _l('收起'), value: 2 },
  { label: _l('不折叠'), value: 0 },
];

export default function SplitLine(props) {
  const { data, globalSheetInfo, styleInfo: { info = {} } = {}, onChange } = props;
  const { enumDefault2 = 1 } = data;
  const { theme = '#1677ff', color = '#151515', icon = '' } = getAdvanceSetting(data);

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('样式')}</div>
        <SectionItem>
          <div className="label">{_l('文字')}</div>
          <ColorSetting
            defaultValue="var(--color-text-title)"
            value={color}
            onChange={value => onChange(handleAdvancedSettingChange(data, { color: value }))}
          />
        </SectionItem>
        {!_.includes(['1', '2'], info.sectionstyle) && (
          <SectionItem>
            <div className="label">{_l('图标')}</div>
            <IconSetting
              icon={icon}
              iconColor={theme}
              projectId={globalSheetInfo.projectId}
              handleClick={value =>
                onChange(handleAdvancedSettingChange(data, { icon: value ? JSON.stringify(value) : '' }))
              }
            />
          </SectionItem>
        )}
        <SectionItem>
          <div className="label">{_l('颜色')}</div>
          <ColorSetting
            defaultValue="#1677ff"
            value={theme}
            onChange={value => {
              onChange(handleAdvancedSettingChange(data, { theme: value }));
            }}
          />
        </SectionItem>
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('默认状态')}</div>
        <SectionItem className="mTop0">
          <Segmented
            block
            className="w100"
            value={enumDefault2}
            options={getFoldDisplayOptions()}
            onChange={value => onChange({ enumDefault2: value })}
          />
        </SectionItem>
      </SettingItem>
    </Fragment>
  );
}
