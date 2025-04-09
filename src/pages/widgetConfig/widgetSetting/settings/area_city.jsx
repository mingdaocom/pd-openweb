import React, { Fragment } from 'react';
import { Dropdown } from 'ming-ui';
import { SettingItem, AnimationWrap } from '../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import cx from 'classnames';

const AREA_DISPLAY_OPTION = [
  {
    value: 19,
    text: _l('省'),
  },
  { value: 23, text: _l('省-市') },
  { value: 24, text: _l('省-市-县') },
];

const INTERNATIONAL_AREA_TYPE = [
  {
    text: _l('指定地区'),
    value: '0',
  },
  {
    text: _l('国际'),
    value: '1',
  },
];

export default function Area({ data, onChange }) {
  const { type, enumDefault } = data;
  const { choosetype = '0', chooserange } = getAdvanceSetting(data);

  if (enumDefault === 1) {
    return (
      <Fragment>
        <SettingItem>
          <div className="settingItemTitle">{_l('选择范围')}</div>
          <AnimationWrap>
            {INTERNATIONAL_AREA_TYPE.map(item => {
              return (
                <div
                  className={cx('animaItem', { active: choosetype === item.value })}
                  onClick={() => onChange(handleAdvancedSettingChange(data, { choosetype: item.value }))}
                >
                  {item.text}
                </div>
              );
            })}
          </AnimationWrap>
        </SettingItem>
        <SettingItem>
          <div className="settingItemTitle">{_l('国家/地区')}</div>
        </SettingItem>
        <SettingItem>
          <div className="settingItemTitle">{_l('选择层级')}</div>
          <Dropdown border data={AREA_DISPLAY_OPTION} value={type} onChange={value => onChange({ type: value })} />
        </SettingItem>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('类型')}</div>
        <Dropdown border data={AREA_DISPLAY_OPTION} value={type} onChange={value => onChange({ type: value })} />
      </SettingItem>
    </Fragment>
  );
}
