import React, { Fragment } from 'react';
import cx from 'classnames';
import { SettingItem } from '../../styled';
import { SectionItem } from '../components/SplitLineConfig/style';
import ColorSetting from '../components/SplitLineConfig/ColorSetting';
import IconSetting from '../components/SplitLineConfig/IconSetting';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';

const FOLD_DISPLAY = [
  { text: _l('展开'), value: 1 },
  { text: _l('收起'), value: 2 },
  { text: _l('不折叠'), value: 0 },
];

export default function SplitLine(props) {
  const { data, globalSheetInfo, styleInfo: { info = {} } = {}, onChange } = props;
  const { enumDefault2 = 1 } = data;
  const { theme = '#2196f3', color = '#333', icon = '' } = getAdvanceSetting(data);

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('样式')}</div>
        <SectionItem>
          <div className="label">{_l('文字')}</div>
          <ColorSetting
            defaultValue="#333333"
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
            defaultValue="#2196f3"
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
          <div className="selectWrap">
            {FOLD_DISPLAY.map(item => (
              <div
                className={cx('animaItem', { active: item.value === enumDefault2 })}
                onClick={() => onChange({ enumDefault2: item.value })}
              >
                {item.text}
              </div>
            ))}
          </div>
        </SectionItem>
      </SettingItem>
    </Fragment>
  );
}
