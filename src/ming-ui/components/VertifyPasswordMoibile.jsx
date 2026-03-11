import React, { useState } from 'react';
import { Popup } from 'antd-mobile';
import cx from 'classnames';
import styled from 'styled-components';
import { Button, VerifyPasswordInput } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import verifyPassword from 'src/components/verifyPassword';

const VertifyPasswordDialogWrap = styled(Popup)`
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
  .ant-input-affix-wrapper:focus,
  .ant-input-affix-wrapper-focused,
  .ant-input-affix-wrapper:not(.ant-input-affix-wrapper-disabled):hover {
    border: 1px solid var(--color-border-secondary);
    box-shadow: none !important;
  }
  .ant-input-password-icon,
  .ant-input-password-icon:hover {
    color: var(--color-text-tertiary) !important;
  }
  .actionsWrap {
    margin-bottom: 10px;
    .ming.Button {
      height: 36px;
      line-height: 36px;
      flex: 1;
      border-radius: 18px;
    }
    .ming.Button--link {
      border: 1px solid var(--color-border-primary);
    }
    .ming.Button--primary {
      background: var(--color-primary);
    }
    .ming.Button--primary:hover {
      background: var(--color-primary);
    }
  }
`;

export default function MobileVertifyPassword(props) {
  const { okText, cancelText, onOk, onClose, className, visible, removeNoneVerification } = props;
  const [password, setPassword] = useState('');
  const [isNoneVerification, setIsNoneVerification] = useState(false);

  return (
    <VertifyPasswordDialogWrap className={cx('mobileModal topRadius', className)} onClose={onClose} visible={visible}>
      <VerifyPasswordInput
        className="mBottom25"
        showSubTitle={true}
        autoFocus={true}
        isRequired={true}
        allowNoVerify={!removeNoneVerification}
        onChange={({ password, isNoneVerification }) => {
          setPassword(password);
          setIsNoneVerification(isNoneVerification);
        }}
      />
      <div className="actionsWrap flexRow">
        <Button type="link" onClick={onClose} className="textSecondary Font14 mRight10">
          {cancelText || _l('取消')}
        </Button>
        <Button
          type="primary"
          onClick={() => {
            if (!password || !password.trim()) {
              alert(_l('请输入密码'), 3);
              return;
            }
            verifyPassword({
              password,
              isNoneVerification,
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
    </VertifyPasswordDialogWrap>
  );
}

MobileVertifyPassword.confirm = props => functionWrap(MobileVertifyPassword, props);
