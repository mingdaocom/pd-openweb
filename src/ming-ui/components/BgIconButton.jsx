import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui/antd-components';
import { browserIsMobile } from 'src/utils/platform/browser/device';

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
    color: var(--color-text-secondary);
  }
  .btnText {
    font-size: 13px;
    color: var(--color-text-title);
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
      background-color: var(--color-background-hover);
    }
  }
  ${({ $disabled }) =>
    $disabled &&
    `
      cursor: not-allowed;
      .btnIcon {
        color: var(--color-text-disabled);
      }
      .btnText {
        color: var(--color-text-disabled);
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
  nativeOnClick,
  tooltip,
  popupPlacement = 'bottom',
  shortcut,
}) {
  // 不要自定义 align.offset：trigger 内部是 { ...builtinPlacements[placement], ...align } 浅合并，
  // 自定义 offset 会整个覆盖掉 antd 按箭头尺寸算出的让位距离（top 为负、bottom 为正），
  // 浮层就会压到按钮上，箭头落在按钮中间而不是从按钮边缘指出来
  return (
    <Tooltip
      title={tooltip && !isMobile ? <span>{tooltip}</span> : null}
      placement={popupPlacement}
      shortcut={shortcut}
    >
      <Con
        className={cx(className, `size-${size}`, { disabled, isMobile })}
        $disabled={disabled}
        style={style}
        onMouseDown={disabled || nativeOnClick ? null : onClick}
        onClick={disabled ? null : nativeOnClick}
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
  text: PropTypes.node,
  onClick: PropTypes.func.isRequired,
  tooltip: PropTypes.node,
  popupPlacement: PropTypes.string,
  style: PropTypes.shape({}),
  iconStyle: PropTypes.shape({}),
};

const GroupWrap = styled.div`
  display: flex;
  gap: ${({ $gap }) => $gap || '10'}px;
`;

BgIconButton.Group = function BgIconButtonGroup({ gap, ...props }) {
  return <GroupWrap $gap={gap} {...props} />;
};

export default BgIconButton;
