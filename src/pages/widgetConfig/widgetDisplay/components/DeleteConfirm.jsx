import React from 'react';
import styled from 'styled-components';
import { Button, Popover } from 'ming-ui/antd-components';
import WorksheetReference from '../../widgetSetting/components/WorksheetReference';

const POPOVER_ALIGN = {
  offset: [0, 5],
};

const DeleteConfirmWrap = styled.div`
  width: 320px;
  padding: 22px 24px;
  .title {
    font-size: 15px;
    color: var(--color-text-title);
  }
  .hint {
    color: var(--color-text-secondary);
    margin: 6px 0 20px 0;
  }
  .btnList {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .cancel {
      color: var(--color-text-tertiary);
      margin-right: 24px;
      cursor: pointer;
    }
  }
`;

export default function DeleteConfirm({
  visible,
  children,
  onVisibleChange,
  onOk,
  onCancel,
  title = <span className="Bold">{_l('确定要删除此字段？')}</span>,
  hint = _l('删除后对应表单数据也会被删除'),
  cancelText = _l('取消'),
  okText = _l('删除'),
  footer,
  content,
  referenceProps,
  ...rest
}) {
  return (
    <Popover
      open={visible}
      onOpenChange={onVisibleChange}
      trigger="click"
      placement="bottomRight"
      align={POPOVER_ALIGN}
      noPadding
      content={
        content || (
          <DeleteConfirmWrap>
            <div className="title">{title}</div>
            <div className="hint">{hint}</div>
            {footer || (
              <div className="btnList">
                {referenceProps && <WorksheetReference {...referenceProps} className="TxtLeft flex" />}
                <div
                  className="cancel"
                  onClick={e => {
                    e.stopPropagation();
                    onCancel();
                  }}
                >
                  {cancelText}
                </div>
                <Button
                  color="danger"
                  variant="solid"
                  size="small"
                  onClick={e => {
                    e.stopPropagation();
                    onOk();
                  }}
                >
                  {okText}
                </Button>
              </div>
            )}
          </DeleteConfirmWrap>
        )
      }
      {...rest}
    >
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </Popover>
  );
}
