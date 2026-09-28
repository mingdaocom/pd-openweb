import React, { useState } from 'react';
import { Popup } from 'antd-mobile';
import cx from 'classnames';
import styled from 'styled-components';
import { VerifyPasswordInput } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import functionWrap from 'ming-ui/components/FunctionWrap';
import verifyPassword from 'ming-ui/functions/verifyPassword';
import { getVerifyValueError } from 'src/utils/domain/security/verification';

const MobileVerifyPasswordDialogWrap = styled(Popup)`
  .adm-popup-body {
    overflow: auto;
    max-height: calc(100vh - 30px);
    padding: 20px 20px 0px;
  }
  .ming.Textarea {
    border: 1px solid var(--color-border-secondary);
  }
  .ming.Textarea:hover:not(:disabled),
  .ming.Textarea:focus,
  .hap-input-affix-wrapper:focus,
  .hap-input-affix-wrapper-focused,
  .hap-input-affix-wrapper:not(.hap-input-affix-wrapper-disabled):hover {
    border: 1px solid var(--color-primary);
    box-shadow: none !important;
  }
  .hap-input-password-icon,
  .hap-input-password-icon:hover {
    color: var(--color-text-tertiary) !important;
  }
  .actionsWrap {
    margin-bottom: 10px;
    button {
      flex: 1;
    }
  }
`;

export default function MobileVerifyPassword(props) {
  const {
    okText,
    cancelText,
    onOk,
    onClose,
    className,
    visible,
    showSubTitle,
    autoFocus,
    isRequired,
    showVerifyType = false,
    allowNoVerify,
    projectId,
  } = props;
  const [verifyInfo, setVerifyInfo] = useState({});

  return (
    <MobileVerifyPasswordDialogWrap
      className={cx('mobileModal topRadius', className)}
      onClose={onClose}
      visible={visible}
    >
      <VerifyPasswordInput
        className="mBottom25"
        showSubTitle={showSubTitle}
        autoFocus={autoFocus}
        isRequired={isRequired}
        showVerifyType={showVerifyType}
        allowNoVerify={allowNoVerify}
        onChange={setVerifyInfo}
      />
      <div className="actionsWrap flexRow">
        <Button
          color="primary"
          variant="link"
          shape="round"
          onClick={onClose}
          className="textSecondary Font14 mRight10"
        >
          {cancelText || _l('取消')}
        </Button>
        <Button
          type="primary"
          shape="round"
          onClick={() => {
            const error = getVerifyValueError(verifyInfo);

            if (error) {
              alert(error, 3);
              return;
            }

            verifyPassword({
              projectId,
              ...verifyInfo,
              showVerifyType,
              success: () => {
                onOk();
                onClose();
              },
            });
          }}
          className="Font14"
        >
          {okText || _l('确认')}
        </Button>
      </div>
    </MobileVerifyPasswordDialogWrap>
  );
}

MobileVerifyPassword.confirm = props => functionWrap(MobileVerifyPassword, props);
