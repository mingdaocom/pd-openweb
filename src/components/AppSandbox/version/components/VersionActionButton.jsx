import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { VERSION_ACTION } from '../constants';

const VIEW_ACTION = 'view';

export const VERSION_ACTION_BUTTON_VARIANT = {
  TEXT: 'text',
  PILL: 'pill',
  RECT: 'rect',
};

const PRIMARY_ACTION_STYLE = {
  color: 'var(--color-primary)',
  textColor: 'var(--color-primary)',
  backgroundColor: 'var(--color-primary-transparent)',
  hoverColor: 'var(--color-white)',
  hoverBackgroundColor: 'var(--color-primary)',
  textHoverColor: 'var(--color-primary-dark)',
};

const NEUTRAL_ACTION_STYLE = {
  ...PRIMARY_ACTION_STYLE,
  color: 'var(--color-text-secondary)',
  borderColor: 'var(--color-border-tertiary)',
  backgroundColor: 'var(--color-background-primary)',
  hoverBorderColor: 'var(--color-primary)',
  hoverColor: 'var(--color-primary)',
  hoverBackgroundColor: 'var(--color-background-primary)',
};

const ACTION_STYLE = {
  [VIEW_ACTION]: PRIMARY_ACTION_STYLE,
  [VERSION_ACTION.UPGRADE]: PRIMARY_ACTION_STYLE,
  [VERSION_ACTION.WITHDRAW]: NEUTRAL_ACTION_STYLE,
  [VERSION_ACTION.RESTORE]: NEUTRAL_ACTION_STYLE,
  [VERSION_ACTION.APPROVE]: {
    color: 'var(--color-success)',
    textColor: 'var(--color-success)',
    backgroundColor: 'var(--color-success-bg)',
    hoverColor: 'var(--color-white)',
    hoverBackgroundColor: 'var(--color-success)',
    textHoverColor: 'var(--color-success-hover, var(--color-success))',
  },
  [VERSION_ACTION.REJECT]: {
    color: 'var(--color-error)',
    textColor: 'var(--color-error)',
    backgroundColor: 'var(--color-error-bg)',
    hoverColor: 'var(--color-white)',
    hoverBackgroundColor: 'var(--color-error)',
    textHoverColor: 'var(--color-error-hover, var(--color-error))',
  },
};

const getActionStyle = action => ACTION_STYLE[action] || PRIMARY_ACTION_STYLE;

const textStyle = css`
  padding: 0;
  border: 0;
  background: transparent;
  color: ${({ $action }) => getActionStyle($action).textColor};

  &:not(:disabled):hover,
  &:not(:disabled):active {
    color: ${({ $action }) => getActionStyle($action).textHoverColor};
  }

  &:disabled {
    background: transparent;
  }
`;

const outlinedStyle = css`
  min-width: 64px;
  height: 32px;
  padding: 0 ${({ $variant }) => ($variant === VERSION_ACTION_BUTTON_VARIANT.RECT ? '24px' : '18px')};
  border: 1px solid ${({ $action }) => getActionStyle($action).borderColor || getActionStyle($action).color};
  border-radius: ${({ $variant }) => ($variant === VERSION_ACTION_BUTTON_VARIANT.RECT ? '3px' : '16px')};
  background-color: ${({ $action }) => getActionStyle($action).backgroundColor};
  color: ${({ $action }) => getActionStyle($action).color};

  &:not(:disabled):hover,
  &:not(:disabled):focus,
  &:not(:disabled):active {
    border-color: ${({ $action }) => getActionStyle($action).hoverBorderColor || getActionStyle($action).color};
    background-color: ${({ $action }) => getActionStyle($action).hoverBackgroundColor};
    color: ${({ $action }) => getActionStyle($action).hoverColor};
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  cursor: pointer;
  font: inherit;
  line-height: inherit;
  white-space: nowrap;

  ${({ $variant }) => ($variant === VERSION_ACTION_BUTTON_VARIANT.TEXT ? textStyle : outlinedStyle)}

  &:disabled {
    border-color: ${({ $variant }) =>
      $variant === VERSION_ACTION_BUTTON_VARIANT.TEXT ? 'transparent' : 'var(--color-border-tertiary)'};
    background-color: ${({ $variant }) =>
      $variant === VERSION_ACTION_BUTTON_VARIANT.TEXT ? 'transparent' : 'var(--color-background-disabled)'};
    color: var(--color-text-disabled);
    cursor: not-allowed;
  }
`;

export default function VersionActionButton({
  action = VIEW_ACTION,
  variant = VERSION_ACTION_BUTTON_VARIANT.TEXT,
  children,
  disabled = false,
  onClick,
}) {
  return (
    <ActionButton type="button" $action={action} $variant={variant} disabled={disabled} onClick={onClick}>
      {children}
    </ActionButton>
  );
}

VersionActionButton.propTypes = {
  action: PropTypes.oneOf([VIEW_ACTION, ...Object.values(VERSION_ACTION)]),
  variant: PropTypes.oneOf(Object.values(VERSION_ACTION_BUTTON_VARIANT)),
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};
