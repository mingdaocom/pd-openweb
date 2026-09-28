import React from 'react';
import styled from 'styled-components';
import { Button, Drawer } from 'ming-ui/antd-components';

const RoleDrawerWrap = styled(({ className, rootClassName, width, height, size, ...props }) => (
  <Drawer
    rootClassName={[className, rootClassName].filter(Boolean).join(' ') || undefined}
    size={size ?? width ?? height}
    {...props}
  />
))`
  .hap-drawer-header {
    .hap-drawer-close {
      display: none;
    }
  }
  .hap-drawer-body {
    padding: 8px 24px 16px 24px;
  }
  .hap-drawer-footer {
    padding: 12px 24px;
    border: none;
  }
  .roleDrawerFooter {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .permissionsHeader {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--color-border-secondary);
    margin-bottom: 16px;
    padding-bottom: 16px;
    padding-top: 24px;
  }
`;

export default function RoleDrawer(props) {
  const {
    okText = _l('确定'),
    cancelText = _l('取消'),
    okLoading = false,
    okDisabled = false,
    cancelDisabled = false,
    onOk,
    onClose,
    footer,
    ...rest
  } = props;
  const defaultFooter = onOk ? (
    <div className="roleDrawerFooter">
      <Button type="primary" loading={okLoading} disabled={okDisabled} onClick={onOk}>
        {okText}
      </Button>
      <Button type="text" disabled={cancelDisabled || okLoading} onClick={onClose}>
        {cancelText}
      </Button>
    </div>
  ) : null;

  return <RoleDrawerWrap {...rest} footer={footer === undefined ? defaultFooter : footer} onClose={onClose} />;
}
