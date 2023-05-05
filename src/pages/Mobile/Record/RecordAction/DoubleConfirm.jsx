import React, { useState } from 'react';
import { Modal } from 'antd-mobile';
import { Input } from 'antd';
import { Button, Textarea, Icon } from 'ming-ui';

import functionWrap from 'ming-ui/components/FunctionWrap';
import { verifyPassword } from 'src/util';
import styled from 'styled-components';
import cx from 'classnames';

const ConfirmDialogWrap = styled(Modal)`
  .am-modal-content {
    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
    padding: 0;
    padding-top: 10px;
  }
  .am-modal-body {
    text-align: left;
    overflow: auto;
    max-height: calc(100vh - 30px);
    padding: 10px 20px 10px;
  }
  .ming.Textarea {
    border: 1px solid #e6e6e6;
  }
  .ming.Textarea:hover:not(:disabled),
  .ming.Textarea:focus,
  .ant-input-affix-wrapper:focus,
  .ant-input-affix-wrapper-focused,
  .ant-input-affix-wrapper:not(.ant-input-affix-wrapper-disabled):hover {
    border: 1px solid #e6e6e6;
    box-shadow: none !important;
  }
  .ant-input-password-icon,
  .ant-input-password-icon:hover {
    color: #9e9e9e !important;
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
      border: 1px solid #ddd;
    }
    .ming.Button--primary {
      background: #2196f3;
    }
    .ming.Button--primary:hover {
      background: #2196f3;
    }
  }
`;
const SectionName = styled.div`
  font-size: 13px;
  color: #333;
  font-weight: 500;
  margin: 0px 0 10px;
  position: relative;
  &.required {
    &:before {
      position: absolute;
      left: -10px;
      top: 3px;
      color: red;
      content: '*';
    }
  }
`;
function DoubleConfirm(props) {
  const {
    title,
    description,
    okText,
    cancelText,
    enableRemark,
    remarkName,
    remarkHint,
    remarkRequired,
    verifyPwd,
    enableConfirm,
    onOk,
    onClose,
    className,
    visible,
  } = props;

  const [remarkValue, setRemarkValue] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ConfirmDialogWrap popup animationType="slide-up" className={className} onClose={onClose} visible={visible}>
      <div className={cx('Gray Font17 mBottom12 bold', { mBottom24: !description && !enableRemark && !verifyPwd })}>
        {enableConfirm ? title : _l('安全认证')}
      </div>
      {description && <div className="Gray_9e Font14 mBottom12">{description}</div>}
      {enableRemark && (
        <div className="remarkWrap">
          <SectionName className={cx({ required: remarkRequired })}>{remarkName || _l('备注')}</SectionName>
          <Textarea placeholder={remarkHint || ''} className="mBottom24" onChange={val => setRemarkValue(val)} />
        </div>
      )}
      {verifyPwd && (
        <div className="passwordWrap mBottom25">
          <SectionName className={cx({ required: true })}>{_l('登录密码验证')}</SectionName>
          <Input.Password
            placeholder={_l('输入当前用户（%0）的登录密码', md.global.Account.fullname)}
            iconRender={visible =>
              visible ? (
                <Icon icon="visibility" className="Gray_9e" />
              ) : (
                <Icon icon="public-folder-hidden" className="Gray_9e" />
              )
            }
            className="w100"
            autocomplete="new-password"
            onChange={val => setPassword(val)}
          />
        </div>
      )}
      <div className="actionsWrap flexRow">
        <Button type="link" onClick={onClose} className="Gray_75 Font14 mRight10">
          {cancelText || _l('取消')}
        </Button>
        <Button
          type="primary"
          onClick={() => {
            if (remarkRequired && !remarkValue.trim()) {
              alert(_l('%0不能为空', remarkName), 3);
              return;
            }
            if (verifyPwd) {
              verifyPassword(password, () => {
                onOk(enableRemark ? { remark: remarkValue } : {});
                onClose();
              });
            } else {
              onOk(enableRemark ? { remark: remarkValue } : {});
              onClose();
            }
          }}
          className="Font14"
        >
          {okText || _l('确认')}
        </Button>
      </div>
    </ConfirmDialogWrap>
  );
}

export const doubleConfirmFunc = props => functionWrap(DoubleConfirm, props);
