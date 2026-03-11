import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import DropdownWrapper from 'worksheet/components/DropdownWrapper';
import { DISPLAY_ICON } from '../../config/score';
import { SettingItem } from '../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';

const WidgetIconStyle = styled.div`
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

const DropdownInput = styled.div`
  border-width: 1px;
  border-style: solid;
  border-color: var(--color-border-tertiary);
  height: 36px;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

export default function WidgetIcon({ data, onChange }) {
  const { itemicon } = getAdvanceSetting(data);

  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('样式')}</div>
      <DropdownWrapper
        downElement={
          <WidgetIconStyle>
            {DISPLAY_ICON.map(item => {
              return (
                <div
                  className={cx('icon_item', { active: itemicon === item.name })}
                  onClick={() => {
                    onChange(handleAdvancedSettingChange(data, { itemicon: item.name }));
                  }}
                >
                  <Icon icon={item.name} />
                </div>
              );
            })}
          </WidgetIconStyle>
        }
      >
        <DropdownInput>
          <Icon icon={itemicon} className="Font22 textTertiary" />
          <span className="icon-arrow-down-border mLeft8 textTertiary" />
        </DropdownInput>
      </DropdownWrapper>
    </SettingItem>
  );
}
