import React from 'react';
import cx from 'classnames';
import { Icon, SvgIcon } from 'ming-ui';

export function normalizeGroupIconForStorage(icon, iconUrl) {
  const raw = String(icon || 'adds');
  return !iconUrl || raw.startsWith('sys_') ? raw : `${raw.replace(/_svg$/, '')}_svg`;
}

/** 与自定义动作行一致：带 URL 的自定义(_svg)或系统(sys_)用 SvgIcon；否则 ming Icon */
export function renderCustomBtnStyleIcon(icon, iconUrl, color) {
  const ic = icon || '';
  const useSvg = !!iconUrl && !!ic && (String(ic).endsWith('_svg') || String(ic).startsWith('sys_'));

  if (useSvg) {
    return (
      <SvgIcon
        className="mRight12 Font18 customBtnGroupedStyleIcon"
        addClassName="TxtMiddle"
        url={iconUrl}
        fill={
          !ic
            ? 'var(--color-text-disabled)'
            : !color
              ? 'var(--color-text-disabled)'
              : color === 'transparent'
                ? 'var(--color-text-primary)'
                : color
        }
        size={18}
      />
    );
  }

  return (
    <Icon
      icon={icon || 'custom_actions'}
      style={{ color: color }}
      className={cx(
        'mRight12 Font18 customBtnGroupedStyleIcon',
        !icon ? 'textDisabled' : !color ? 'textDisabled' : color === 'transparent' ? 'textPrimary' : '',
      )}
    />
  );
}
