import React from 'react';
import { Button, Popup } from 'antd-mobile';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const PopupWrap = styled(Popup)`
  .contentBox {
    display: flex;
    padding: 24px 15px;
    .descIconBox {
      margin-right: 15px;
      .success {
        color: #4caf50;
        font-size: 20px;
      }
      .error {
        color: #f44336;
      }
      .warning {
        color: #fb0;
      }
      .info {
        color: #1c97f3;
      }
    }
    .title {
      font-size: 17px;
      font-weight: 500;
      color: #151515;
    }
    .subDesc {
      margin-top: 10px;
      font-size: 13px;
      color: #757575;
    }
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
      color: #757575;
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
    onCancel,
    onConfirm,
  } = props;

  return (
    <PopupWrap className="mobileModal topRadius" onClose={onCancel} visible={visible}>
      {/* 内容 */}
      <div className="contentBox">
        {descIcon && <div className="descIconBox">{descIcon}</div>}
        <div className="descBox">
          <div className="title">{title}</div>
          {subDesc && <div className="subDesc">{subDesc}</div>}
        </div>
      </div>
      <div className="footerBox">
        {/* 取消 */}
        {cancelText && onCancel && (
          <Button className="cancel" onClick={onCancel}>
            {cancelText}
          </Button>
        )}
        {/* 确认 */}
        {confirmText && onConfirm && (
          <Button color="primary" onClick={onConfirm}>
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
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
};

export default ConfirmPopup;
