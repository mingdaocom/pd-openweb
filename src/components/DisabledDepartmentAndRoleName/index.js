// 部门/组织角色名称显示
import React from 'react';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui/antd-components';
import { browserIsMobile } from 'src/utils/common';

const RoleName = styled.span`
  &.disabled {
    color: #757575 !important;
    text-decoration: line-through !important;
  }
`;

export default function DisabledDepartmentAndRoleName(props) {
  const { className, style = {}, disabled, name, isRole } = props;
  const toolTipText = isRole ? _l('组织角色已停用') : _l('部门已停用');
  const deleteText = isRole ? _l('组织角色已删除') : _l('部门已删除');
  const isMobile = browserIsMobile();

  if (disabled) {
    if (isMobile) {
      return (
        <RoleName className={`disabled ${className ? className : ''}`} style={style}>
          {name}
        </RoleName>
      );
    }

    return (
      <Tooltip popupPlacement="top" title={<span>{toolTipText}</span>}>
        <RoleName className={`disabled ${className ? className : ''}`} style={style}>
          {name}
        </RoleName>
      </Tooltip>
    );
  }

  return (
    <RoleName className={className} style={style}>
      {name ? name : deleteText}
    </RoleName>
  );
}
