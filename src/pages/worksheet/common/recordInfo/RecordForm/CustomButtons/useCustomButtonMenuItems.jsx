import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { useCustomButtonActions } from './index';
import './index.less';

export const CUSTOM_BUTTON_MENU_STYLE = {
  position: 'relative',
  width: 240,
  maxHeight: 500,
  overflowX: 'hidden',
  overflowY: 'auto',
};
const COMPACT_CUSTOM_BUTTON_MENU_STYLE = {
  position: 'relative',
  minWidth: 180,
  maxHeight: 500,
  overflowX: 'hidden',
  overflowY: 'auto',
};
const EMPTY_BUTTONS = [];
const EMPTY_BUTTON_DISABLE = {};

const CustomButtonSvgIcon = styled.span`
  display: inline-flex;
  align-items: center;

  > div {
    display: inline-flex;
  }
`;

export function getCustomButtonMenuStyle(type) {
  return type === 'button' ? CUSTOM_BUTTON_MENU_STYLE : COMPACT_CUSTOM_BUTTON_MENU_STYLE;
}

function renderButtonIcon(button, disabled) {
  if (button.icon && button.iconUrl && button.icon.endsWith('_svg')) {
    const fill =
      disabled || !button.color || button.color === 'transparent' ? 'var(--color-text-disabled)' : button.color;

    return (
      <CustomButtonSvgIcon>
        <SvgIcon addClassName="TxtMiddle" url={button.iconUrl} fill={fill} size={16} />
      </CustomButtonSvgIcon>
    );
  }

  if (!button.icon) {
    return <Icon icon="custom_actions" className="Font17 textDisabled" />;
  }

  return (
    <Icon
      style={{
        color: disabled
          ? 'var(--color-text-disabled)'
          : button.color === 'transparent'
            ? 'var(--color-text-primary)'
            : button.color,
      }}
      icon={button.icon}
      className="Font17"
    />
  );
}

export function renderGroupMenuIcon(group) {
  const { icon, iconUrl, iconColor } = group || {};
  const color = iconColor || 'var(--color-text-tertiary)';
  const useSvg = !!iconUrl && !!icon && (String(icon).endsWith('_svg') || String(icon).startsWith('sys_'));

  if (useSvg) {
    return (
      <CustomButtonSvgIcon>
        <SvgIcon addClassName="TxtMiddle" url={iconUrl} fill={color} size={16} />
      </CustomButtonSvgIcon>
    );
  }

  return <Icon style={{ color }} icon={icon || 'custom_actions'} className="Font17" />;
}

function normalizeButtons(buttons, btnDisable, hideDisabled) {
  const visibleButtons = hideDisabled
    ? buttons.filter(button => !(btnDisable[button.btnId] || button.disabled))
    : buttons;

  return md.global.Account.isPortal ? visibleButtons.map(button => ({ ...button, verifyPwd: false })) : visibleButtons;
}

function createButtonMenuItem(button, btnDisable, executeButton) {
  const disabled = !!(btnDisable[button.btnId] || button.disabled);

  return {
    key: `custom-${button.btnId}`,
    className: 'customButtonItem',
    disabled,
    icon: renderButtonIcon(button, disabled),
    label: button.name,
    title: button.name,
    extra: button.desc ? (
      <Tooltip placement="bottom" title={button.desc}>
        <Icon icon="info_outline" className="Font17 textTertiary" />
      </Tooltip>
    ) : undefined,
    onClick: () => executeButton(button),
  };
}

function createMenuItems({ buttons, segments, btnDisable, hideDisabled, executeButton }) {
  if (!segments) {
    return normalizeButtons(buttons, btnDisable, hideDisabled).map(button =>
      createButtonMenuItem(button, btnDisable, executeButton),
    );
  }

  return segments.flatMap(segment => {
    if (segment.kind === 'group') {
      const groupButtons = normalizeButtons(segment.buttons || [], btnDisable, hideDisabled);

      if (!groupButtons.length) {
        return [];
      }

      return [
        {
          key: `custom-group-${segment.group.id || segment.group.name}`,
          label: segment.group.name,
          icon: renderGroupMenuIcon(segment.group),
          popupClassName: 'customButtonSubMenu',
          children: groupButtons.map(button => createButtonMenuItem(button, btnDisable, executeButton)),
        },
      ];
    }

    const segmentButtons = segment.kind === 'btn' ? [segment.button].filter(Boolean) : segment.buttons || [];

    return normalizeButtons(segmentButtons, btnDisable, hideDisabled).map(button =>
      createButtonMenuItem(button, btnDisable, executeButton),
    );
  });
}

export default function useCustomButtonMenuItems(props) {
  const { buttons = EMPTY_BUTTONS, segments, btnDisable = EMPTY_BUTTON_DISABLE, hideDisabled = false } = props;
  const { executeButton, holder } = useCustomButtonActions(props);
  const items = useMemo(
    () => createMenuItems({ buttons, segments, btnDisable, hideDisabled, executeButton }),
    [buttons, segments, btnDisable, hideDisabled, executeButton],
  );

  return { items, holder };
}
