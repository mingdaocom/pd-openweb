import React from 'react';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import 'rc-trigger/assets/index.css';

const DelVerify = styled.div`
  box-sizing: border-box;
  width: 240px;
  background-color: var(--color-background-primary);
  padding: 16px;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  p {
    margin: 0;
    font-size: 14px;
    font-weight: bold;
  }
  .delComponent {
    margin-top: 20px;
    text-align: right;
    color: var(--color-error);
    cursor: pointer;
  }
  .btnGroup {
    text-align: right;
    margin-top: 16px;
    cursor: pointer;
    span {
      color: var(--color-text-tertiary);
    }
    .cancel {
    }
    .del {
      margin-left: 12px;
      background-color: var(--color-error);
      color: var(--color-white);
      padding: 6px 12px;
      border-radius: 3px;
      text-align: center;
      line-height: 36px;
      &:hover {
        background-color: var(--color-error-hover);
      }
    }
  }
`;
export default function VerifyDel({
  title,
  visible,
  onVisibleChange,
  onCancel,
  onDel,
  children,
  cancelText = _l('取消'),
  delText = _l('删除'),
  popupAlign,
}) {
  return (
    <Trigger
      popupVisible={visible}
      action={['click']}
      onPopupVisibleChange={onVisibleChange}
      getPopupContainer={() => document.body}
      popupAlign={{ points: ['tc', 'bc'], overflow: { adjustX: true, adjustY: true }, ...popupAlign }}
      popup={
        <DelVerify>
          <p>{title}</p>
          <div className="btnGroup">
            <span className="cancel" onClick={onCancel}>
              {cancelText}
            </span>
            <span className="del" onClick={onDel}>
              {delText}
            </span>
          </div>
        </DelVerify>
      }
    >
      {children}
    </Trigger>
  );
}
