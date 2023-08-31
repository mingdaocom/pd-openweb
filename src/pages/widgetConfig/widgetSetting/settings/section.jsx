import React, { Fragment, useState } from 'react';
import cx from 'classnames';
import { SettingItem } from '../../styled';
import { SectionItem } from '../components/SectionConfig/style';
import SectionConfig from '../components/SectionConfig';
import { THEME_COLOR_OPTIONS, TEXT_COLOR_OPTIONS, getBgData } from '../components/SectionConfig/config';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';

const { ColorSetting, IconSetting, StyleSetting } = SectionConfig;

const ALIGN_DISPLAY = [
  { text: _l('左'), value: '1' },
  { text: _l('局中'), value: '2' },
];

const FOLD_DISPLAY = [
  { text: _l('不折叠'), value: 0 },
  { text: _l('默认展开'), value: 1 },
  { text: _l('默认收起'), value: 2 },
];

export default function Section(props) {
  const { data, globalSheetInfo, onChange } = props;
  const { enumDefault2 } = data;
  const { theme, title, titlealign, background, icon = '' } = getAdvanceSetting(data);

  const [bgData, setBgData] = useState(getBgData(theme));

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('样式')}</div>
        <StyleSetting
          data={data}
          handleChange={(options, value) =>
            onChange({ ...handleAdvancedSettingChange(data, options), enumDefault: value })
          }
        />
      </SettingItem>

      <SettingItem>
        <SectionItem>
          <div className="label">{_l('主题')}</div>
          <ColorSetting
            value={theme}
            isCustom={true}
            data={THEME_COLOR_OPTIONS}
            onChange={value => {
              const newBgData = getBgData(value);
              onChange(handleAdvancedSettingChange(data, { theme: value, background: newBgData[2] }));
              setBgData(newBgData);
            }}
          />
        </SectionItem>
        <SectionItem>
          <div className="label">{_l('标题')}</div>
          <ColorSetting
            data={TEXT_COLOR_OPTIONS}
            value={title}
            onChange={value => onChange(handleAdvancedSettingChange(data, { title: value }))}
          />
          <div className="selectWrap mLeft10">
            {ALIGN_DISPLAY.map(item => (
              <div
                className={cx('animaItem', { active: item.value === titlealign })}
                onClick={() => onChange(handleAdvancedSettingChange(data, { titlealign: item.value }))}
              >
                {item.text}
              </div>
            ))}
          </div>
        </SectionItem>
        {/* <SectionItem>
          <div className="label">{_l('背景')}</div>
          <ColorSetting
            data={bgData}
            isCustom={true}
            value={background}
            onChange={value => onChange(handleAdvancedSettingChange(data, { background: value }))}
          />
        </SectionItem> */}
        <SectionItem>
          <div className="label">{_l('图标')}</div>
          <IconSetting
            icon={icon}
            iconColor={theme}
            projectId={globalSheetInfo.projectId}
            handleClick={value => onChange(handleAdvancedSettingChange(data, { icon: JSON.stringify(value) }))}
          />
          {icon && (
            <div
              className="ThemeColor3 ThemeHoverColor2 pointer mLeft10"
              onClick={() => onChange(handleAdvancedSettingChange(data, { icon: '' }))}
            >
              {_l('清除')}
            </div>
          )}
        </SectionItem>
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('分组折叠')}</div>
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
