import React from 'react';
import cx from 'classnames';
import { AnimationWrap, SettingItem } from 'src/pages/widgetConfig/styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../util/setting';

export default function TreeTableLevel(props) {
  const { data, onChange } = props;
  const { defaultlayer } = getAdvanceSetting(data);
  const LEVEL_SETTING_LIST = Array.from({ length: 5 }).map((item, index) => ({
    text: `${index + 1}`,
    value: `${index + 1}`,
  }));

  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('默认展开层级')}</div>
      <AnimationWrap>
        {LEVEL_SETTING_LIST.map(({ text, value }) => {
          return (
            <div
              className={cx('animaItem overflow_ellipsis', { active: defaultlayer === value })}
              onClick={() => onChange(handleAdvancedSettingChange(data, { defaultlayer: value }))}
            >
              {text}
            </div>
          );
        })}
      </AnimationWrap>
    </SettingItem>
  );
}
