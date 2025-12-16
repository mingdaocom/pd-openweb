import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { browserIsMobile } from 'src/utils/common';

const isMobile = browserIsMobile();

const Con = styled.div`
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  .btnIcon {
    font-size: 20px;
    color: #757575;
  }
  .btnText {
    font-size: 13px;
    color: #515151;
    margin-left: 4px;
  }
  &.size-small {
    .btnIcon {
      font-size: 16px;
    }
    .btnText {
      font-size: 12px;
    }
  }
  &:not(.isMobile) {
    &:hover {
      background-color: #f5f5f5;
    }
  }
  ${({ disabled }) =>
    disabled &&
    `
      cursor: not-allowed;
      .btnIcon {
        color: #bdbdbd;
      }
      .btnText {
        color: #bdbdbd;
      }
      &:hover {
        background-color: transparent;
      }
    `}
`;

function BgIconButton({
  disabled,
  className,
  iconClassName,
  style = {},
  iconStyle = {},
  size = 'normal',
  icon,
  iconComponent,
  text,
  onClick,
  tooltip,
  popupPlacement = 'bottom',
  shortcut,
}) {
  return (
    <Tooltip
      title={tooltip && !isMobile ? <span>{tooltip}</span> : null}
      placement={popupPlacement}
      align={{ offset: [0, -3] }}
      shortcut={shortcut}
    >
      <Con
        className={cx(className, `size-${size}`, { disabled, isMobile })}
        disabled={disabled}
        style={style}
        onMouseDown={disabled ? null : onClick}
      >
        {iconComponent ? (
          iconComponent
        ) : (
          <i className={cx(`btnIcon icon icon-${icon}`, iconClassName)} style={iconStyle}></i>
        )}
        {text && <span className="btnText">{text}</span>}
      </Con>
    </Tooltip>
  );
}

BgIconButton.propTypes = {
  disabled: PropTypes.bool,
  className: PropTypes.string,
  iconClassName: PropTypes.string,
  icon: PropTypes.node.isRequired,
  text: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  tooltip: PropTypes.string,
  popupPlacement: PropTypes.string,
  style: PropTypes.shape({}),
  iconStyle: PropTypes.shape({}),
};

BgIconButton.Group = styled.div`
  display: flex;
  gap: ${({ gap }) => gap || '10'}px;
`;

export default BgIconButton;
