import React, { useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Select } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { DISPLAY_ICON } from 'src/utils/domain/control/score';
import { SettingItem } from '../../styled';

const ICON_OPTIONS = DISPLAY_ICON.map(item => ({ value: item.name, label: item.name }));
const SELECT_STYLES = {
  root: { width: '100%', height: 36 },
  popup: { root: { padding: 0 } },
};
const renderIconLabel = ({ value }) => <Icon icon={value} className="Font22 textTertiary" />;

const WidgetIconStyle = styled.div`
  width: 310px;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  padding: 12px;
  .icon_item {
    width: 34px;
    height: 34px;
    margin-right: 2px;
    cursor: pointer;
    font-size: 22px;
    text-align: center;
    line-height: 34px;
    border-radius: 3px;
    color: var(--color-text-tertiary);
    &:nth-child(8) {
      margin-right: 0px;
    }
    &:nth-child(16) {
      margin-right: 0px;
    }
    &:hover {
      background: var(--color-background-hover);
    }
    &.active {
      background: var(--color-text-tertiary);
      color: var(--color-white);
    }
  }
`;

export default function WidgetIcon({ data, onChange }) {
  const { itemicon } = getAdvanceSetting(data);
  const [open, setOpen] = useState(false);

  const handleSelect = icon => {
    onChange(handleAdvancedSettingChange(data, { itemicon: icon }));
    setOpen(false);
  };

  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('样式')}</div>
      <Select
        value={itemicon}
        open={open}
        onOpenChange={setOpen}
        placement="bottomLeft"
        options={ICON_OPTIONS}
        labelRender={renderIconLabel}
        showSearch={false}
        popupMatchSelectWidth={false}
        styles={SELECT_STYLES}
        popupRender={() => (
          <WidgetIconStyle>
            {DISPLAY_ICON.map(item => (
              <div
                key={item.name}
                className={cx('icon_item', { active: itemicon === item.name })}
                onClick={() => handleSelect(item.name)}
              >
                <Icon icon={item.name} />
              </div>
            ))}
          </WidgetIconStyle>
        )}
      />
    </SettingItem>
  );
}
