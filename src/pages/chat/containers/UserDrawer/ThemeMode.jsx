import React, { useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { emitter, setBodyThemeMode } from 'src/utils/common';

const Wrap = styled.div`
  background: var(--color-background-secondary);
  padding: 0px 5px;
  border-radius: 4px;
  height: 36px;
  position: absolute;
  right: 10px;
  .item {
    color: var(--color-text-disabled);
    padding: 4px 12px;
    border-radius: 4px;
  }
  .active {
    color: var(--color-text-secondary);
    background: var(--color-background-card);
  }
`;

const themeModes = [
  {
    value: 'light',
    name: _l('浅色'),
    icon: 'light_mode',
  },
  {
    value: 'dark',
    name: _l('深色'),
    icon: 'dark_mode',
  },
  {
    value: 'system',
    name: _l('跟随设备'),
    icon: 'computer',
  },
];

export default () => {
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'light');

  const onChange = value => {
    setThemeMode(value);
    setBodyThemeMode(value);
    window.themeMode = value;
    localStorage.setItem('themeMode', value);
    if (['dark', 'light'].includes(value)) {
      emitter.emit('CHANGE_THEME_MODE', value);
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      emitter.emit('CHANGE_THEME_MODE', isDark ? 'dark' : 'light');
    }
  };

  return (
    <Wrap className="flexRow alignItemsCenter">
      {themeModes.map(item => (
        <Tooltip title={item.name} placement="bottom" key={item.value}>
          <div
            className={cx('item flexRow alignItemsCenter justifyContentCenter pointer', {
              active: item.value === themeMode,
            })}
            onClick={() => onChange(item.value)}
          >
            <Icon icon={item.icon} className="Font18" />
          </div>
        </Tooltip>
      ))}
    </Wrap>
  );
};
