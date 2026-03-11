import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';

const IconWrap = styled.i`
  font-size: 16px;
  color: var(--color-text-tertiary);

  &.action {
    cursor: pointer;
    &:hover {
      color: var(--color-text-title);
    }
  }
  &.delete {
    cursor: pointer;
    &:hover {
      color: var(--color-error);
    }
  }
  &.link {
    cursor: pointer;
    &:hover {
      color: var(--color-primary);
    }
  }
`;

/**
 * 图标
 * type ['delete'] 提供默认样式 删除是红色
 * @param {} param0
 */
export default function Icon({ className, type, icon, ...rest }) {
  return <IconWrap className={cx(`icon-${icon}`, className, { action: rest['onClick'] }, type)} {...rest}></IconWrap>;
}
