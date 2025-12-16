import React from 'react';
import { Button, Popup } from 'antd-mobile';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FunctionWrap } from 'ming-ui';

const PopupWrap = styled(Popup)`
  .wrapperBody {
    overflow: hidden;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    border-radius: 12px 12px 0 0;
    max-height: calc(100% - 40px);
    display: flex;
    flex-direction: column;
  }
  .titleBox {
    display: flex;
    padding: 24px 15px 30px;
    .descIconBox {
      margin-right: 15px;
      .success {
        color: var(--color-success);
        font-size: 20px;
      }
      .error {
        color: var(--color-error);
      }
      .warning {
        color: var(--color-warning);
      }
      .info {
        color: var(--color-info);
      }
    }
    .title {
      font-size: 17px;
      font-weight: 500;
      color: var(--color-text-primary);
    }
    .subDesc {
      margin-top: 10px;
      font-size: 13px;
      color: var(--color-text-secondary);
    }
  }
  .contentBox {
    padding: 0 15px 24px;
    flex: 1;
    overflow-y: auto;
  }
  .footerBox {
    padding: 10px;
    display: flex;
    gap: 10px;
    button {
      flex: 1;
      font-size: 13px;
      font-weight: 500;
    }
    .cancel {
      color: var(--color-text-secondary);
    }
    .primary {
      background-color: var(--color-info);
      color: var(--color-text-inverse);
    }
    .delete {
      background-color: var(--color-error);
      color: var(--color-text-inverse);
    }
  }
`;

const ConfirmPopup = props => {
  const {
    visible,
    descIcon,
    title,
    subDesc,
    cancelText = _l('取消'),
    confirmText = _l('确认'),
    confirmType = 'primary',
    removeCancelBtn = false,
    onCancel,
    onConfirm,
    children,
    className,
  } = props;

  return (
    <PopupWrap
      className={`mobileModal topRadius ${className || ''}`}
      bodyClassName="wrapperBody"
      onClose={onCancel}
      visible={visible}
    >
      {/* 标题 */}
      <div className="titleBox">
        {descIcon && <div className="descIconBox">{descIcon}</div>}
        <div className="descBox">
          <div className="title">{title}</div>
          {subDesc && <div className="subDesc">{subDesc}</div>}
        </div>
      </div>
      {/* 自定义内容 */}
      {children && <div className="contentBox">{children}</div>}

      <div className="footerBox">
        {/* 取消 */}
        {cancelText && onCancel && !removeCancelBtn && (
          <Button className="cancel" onClick={onCancel}>
            {cancelText}
          </Button>
        )}
        {/* 确认 */}
        {confirmText && onConfirm && (
          <Button className={confirmType} onClick={onConfirm} data-id="confirmBtn">
            {confirmText}
          </Button>
        )}
      </div>
    </PopupWrap>
  );
};

ConfirmPopup.propTypes = {
  visible: PropTypes.bool.isRequired,
  descIcon: PropTypes.node,
  title: PropTypes.string.isRequired,
  subDesc: PropTypes.string,
  cancelText: PropTypes.string,
  confirmText: PropTypes.string,
  removeCancelBtn: PropTypes.bool,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
};

export const mobileConfirmPopupFunc = props => FunctionWrap(ConfirmPopup, { ...props });

export default ConfirmPopup;
