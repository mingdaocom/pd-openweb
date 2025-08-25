import React, { Component, createRef, Fragment, useEffect, useState } from 'react';
import ClipboardButton from 'react-clipboard.js';
import { Input } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Dialog, Tooltip, VerifyPasswordInput } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { captcha } from 'ming-ui/functions';
import appManagementAjax from 'src/api/appManagement';
import verifyPassword from 'src/components/verifyPassword';
import { generateRandomPassword } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';

const PasswordInputBox = styled.div`
  line-height: 34px;
  box-sizing: border-box;
  border-radius: 2px;
  .mLeft70 {
    margin-left: 70px;
  }
  .inputBox {
    border: none;
    background: #f5f5f5;
    padding-left: 16px;
    width: 200px;
    height: 36px;
    margin-right: 16px;
    &.editInput {
      background: #fff;
      border: 1px solid #1677ff;
    }
  }
  .icon-edit,
  .icon-content-copy {
    &:hover {
      color: #1677ff !important;
    }
  }
  .error {
    font-size: 12px;
    color: #f44336;
  }
`;

const UnLockFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 25px;
`;

const IconWrap = styled.div`
  height: 18px;
  width: 18px;
  font-size: 14px;
  color: #9e9e9e;
  text-align: center;
  line-height: 18px;
  cursor: pointer;
  margin-right: 12px;
`;

const checkErrorPassword = password => {
  const { passwordRegexTip } = md.global.SysSettings;
  if (!password) {
    alert(_l('请输入密码'), 3);
    return true;
  }

  if (!RegExpValidator.isPasswordValid(password)) {
    alert(passwordRegexTip || _l('密码，至少8-20位，且含字母+数字'), 3);
    return true;
  }
};

const RESULT_OBJ = {
  0: _l('设置失败'),
  1: _l('设置成功'),
  2: _l('密码错误'),
  3: _l('非应用拥有者'),
  4: _l('应用已锁定'),
  5: _l('当前应用无需解锁'),
  6: _l('应用类型不正确'),
  7: _l('您输入的新密码与旧密码一样'),
};

const ACTION_TEXT = {
  editLockPassword: _l('密码修改成功，需重新解锁'),
  resetLock: _l('您在应用下的操作权限已恢复锁定'),
  unlock: _l('您在应用下的操作权限已解锁'),
  addLock: _l('应用已开启锁定'),
  closeLock: _l('应用已关闭锁定'),
};

let timeout = null;

const actionFeedback = (msg, { onCancel, refreshPage }) => {
  onCancel();

  alert({
    msg,
    timeout: 1000,
    callback: refreshPage,
  });
};

const handleRequest = (requestName, requestParams, props) => {
  appManagementAjax[requestName](requestParams).then(res => {
    if (res === 1) {
      actionFeedback(ACTION_TEXT[requestName], props);
    } else {
      alert(RESULT_OBJ[res], _.includes([2, 3, 4, 5, 6, 7, 8], res) ? 3 : 2);
    }
  });
};

// 图形验证
const graphicVertify = (callback = () => {}) => {
  let cb = function (res) {
    if (res.ret !== 0) {
      return;
    }
    callback();
  };

  new captcha(cb);
};

// 锁定应用（开启应用锁）
function LockApp(props) {
  const { visible, onCancel = () => {}, appId } = props;
  const passwordInputRef = createRef();
  const [canEdit, setCanEdit] = useState(true);
  const [password, setPassword] = useState();
  const inputExtra = canEdit ? {} : { readonly: 'readonly' };

  useEffect(() => {
    passwordInputRef.current.focus();
  }, []);

  return (
    <Dialog
      width={670}
      visible={visible}
      title={<div className="Black Font17">{_l('锁定应用')}</div>}
      okText={_l('确定')}
      // okDisabled={!isAddLock}
      onCancel={onCancel}
      onOk={() => {
        if (checkErrorPassword(password)) {
          passwordInputRef.current.focus();
          setCanEdit(true);
          return;
        }
        handleRequest('addLock', { appId, password }, props);
      }}
    >
      <PasswordInputBox>
        <div className="flexRow">
          <span>{_l('设置锁定密码')}</span>
          {canEdit && (
            <span
              className="ThemeColor Hand mLeft70"
              onClick={() => {
                setPassword(generateRandomPassword(16));
                setCanEdit(false);
              }}
            >
              {_l('随机生成')}
            </span>
          )}
        </div>
        <div className="flexRow alignItemsCenter">
          <input
            type="text"
            className={cx('inputBox', { editInput: canEdit })}
            value={password}
            ref={passwordInputRef}
            onChange={e => setPassword(e.target.value)}
            onBlur={e => {
              if (!e || !e.target.value || !canEdit) return;
              if (checkErrorPassword(password)) return;
              clearTimeout(timeout);
              timeout = setTimeout(() => {
                setCanEdit(false);
              }, 500);
            }}
            {...inputExtra}
          />

          <IconWrap
            onClick={() => {
              setCanEdit(true);
              passwordInputRef.current.focus();
            }}
          >
            <Tooltip text={<span>{_l('编辑')}</span>} popupPlacement="bottom">
              <i className="icon-edit Gray_9e Font14" />
            </Tooltip>
          </IconWrap>
          <IconWrap>
            <Tooltip offset={[5, 0]} text={<span>{_l('复制')}</span>} popupPlacement="bottom">
              <ClipboardButton component="span" data-clipboard-text={password} onSuccess={() => alert(_l('复制成功'))}>
                <i className="icon-content-copy Font14" />
              </ClipboardButton>
            </Tooltip>
          </IconWrap>
        </div>
        <div className="Gray_9e">
          {_l('不推荐设置私人的常用密码。请妥善保管密码，如果忘记密码只能关闭锁定后重新设置')}
        </div>
      </PasswordInputBox>
    </Dialog>
  );
}
// 解锁应用
class UnLockDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}

  // 解锁应用
  handleUnlock = () => {
    const { appId, isLock } = this.props;
    const { lockPassword } = this.state;
    // 恢复锁定
    if (!isLock) {
      handleRequest('resetLock', { appId }, this.props);
      return;
    }

    graphicVertify(() => handleRequest('unlock', { appId, password: lockPassword }, this.props));
  };

  render() {
    const { visible, onCancel = () => {}, sourceType, isOwner, appId, isLock } = this.props;
    const { lockPassword } = this.state;
    const isNormalApp = sourceType === 1;

    return (
      <Fragment>
        <Dialog
          width={640}
          visible={visible}
          anim={false}
          title={<div className="Black Font17">{isLock ? _l('解锁应用') : _l('恢复锁定')}</div>}
          okText={!isLock ? _l('恢复锁定') : _l('确定')}
          onCancel={onCancel}
          footer={
            <UnLockFooter>
              <div className="ThemeColor Font14">
                {isOwner && isLock && (
                  <span
                    className="Hand"
                    onClick={() => {
                      modifyAppLockPassword({ appId, refreshPage: this.props.refreshPage });
                      onCancel();
                    }}
                  >
                    {_l('修改应用锁密码')}
                  </span>
                )}
                {isNormalApp && isOwner && isLock && (
                  <span
                    className="Hand mLeft24"
                    onClick={() => {
                      closeLockFunc({ appId, refreshPage: this.props.refreshPage });
                      onCancel();
                    }}
                  >
                    {_l('关闭应用锁定')}
                  </span>
                )}
              </div>
              <div className="btns">
                <Button type="link" onClick={onCancel}>
                  {_l('取消')}
                </Button>
                <Button type="primary" onClick={this.handleUnlock}>
                  {_l('确定')}
                </Button>
              </div>
            </UnLockFooter>
          }
        >
          {isLock ? (
            <Fragment>
              <div className="Gray_9e Font14 mBottom25">
                {_l('当前应用为不可配置状态，验证应用锁密码后将会解锁您在该应用下的相关操作权限')}
              </div>
              <Input.Password
                ref={input => (this.passwordInput = input)}
                className="mBottom16"
                placeholder={_l('请输入应用锁密码')}
                autoComplete="new-password"
                value={lockPassword}
                onChange={e => this.setState({ lockPassword: e.target.value.trim() })}
              />
            </Fragment>
          ) : (
            <div className="Gray_9e Font14">
              {_l('您在当前应用下的相关权限已解锁。操作恢复锁定，将重新锁定您在当前应用下的权限。')}
            </div>
          )}
        </Dialog>
      </Fragment>
    );
  }
}
// 修改应用锁密码
function AppLockPasswordDialog(props) {
  const { visible, appId, onCancel = () => {} } = props;
  const [originPassword, setOriginPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const passwordInput = createRef();

  useEffect(() => {
    if (passwordInput) {
      passwordInput.current.focus();
    }
  }, []);

  // 修改密码
  const confirmModifyPassword = (originPassword, newPassword) => {
    if (!originPassword) return alert(_l('请输入旧密码'), 3);
    if (checkErrorPassword(newPassword)) return;
    if (_.trim(originPassword) === _.trim(newPassword)) {
      return alert(_l('您输入的新密码与旧密码一样'), 3);
    }

    graphicVertify(() => handleRequest('editLockPassword', { newPassword, password: originPassword, appId }, props));
  };

  return (
    <Dialog
      width={480}
      visible={visible}
      title={<div className="Black Font17">{_l('修改应用锁密码')}</div>}
      okText={_l('确定')}
      onCancel={onCancel}
      onOk={() => confirmModifyPassword(originPassword, newPassword)}
    >
      <div className="Gray Font14 mBottom15">{_l('旧密码')}</div>
      <Input.Password
        ref={passwordInput}
        placeholder={_l('旧密码')}
        autoComplete="new-password"
        value={originPassword}
        onChange={e => setOriginPassword(e.target.value.trim())}
      />
      <div className="Gray Font14 mBottom15 mTop50">{_l('新密码')}</div>
      <Input.Password
        placeholder={_l('新密码')}
        autoComplete="new-password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value.trim())}
      />
    </Dialog>
  );
}
// 关闭应用锁定
function CloseLock(props) {
  const { visible, onCancel = () => {}, appId } = props;
  const [userPassword, setUserPassword] = useState('');

  return (
    <Dialog
      width={640}
      visible={visible}
      title={<div className="Black Font17">{_l('关闭应用锁定')}</div>}
      okText={_l('确定')}
      onCancel={onCancel}
      onOk={() => {
        verifyPassword({
          password: userPassword,
          success: () => {
            handleRequest('closeLock', { appId }, props);
          },
        });
      }}
    >
      <div className="Gray_9e Font14 mBottom16">{_l('关闭后将不再对应用进行锁定。关闭应用锁定，需验证您的身份。')}</div>
      <VerifyPasswordInput
        className="mBottom25"
        autoFocus={true}
        onChange={({ password }) => setUserPassword(password)}
      />
    </Dialog>
  );
}
export const closeLockFunc = props => functionWrap(CloseLock, { ...props });
export const modifyAppLockPassword = props => functionWrap(AppLockPasswordDialog, { ...props });
export const lockAppFunc = props => functionWrap(LockApp, { ...props });
export const unlockAppLockPassword = props => functionWrap(UnLockDialog, { ...props });
