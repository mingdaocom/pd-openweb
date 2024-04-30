import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Icon, Button, Dialog } from 'ming-ui';
import externalPortalAjax from 'src/api/externalPortal';
import AccountCon from './AccountCon';
import cx from 'classnames';
import { ActionResult } from 'src/pages/accountLogin/config';

const AccountDialogWrap = styled.div``;
export default function TelDialog(props) {
  const { setShow, show, classNames, appId, onOk, type, baseInfo, isBind } = props;
  const [hasVerification, setHasVerification] = useState(false);
  const [newAccount, setNewAccount] = useState('');
  const [code, setCode] = useState('');
  const [isValidNumber, setIsValidNumber] = useState(false);
  const [country, setCountry] = useState('');

  //验证老的号码
  const verificationOld = () => {
    if (!code) {
      alert(_l('请输入验证码'), 3);
    } else {
      externalPortalAjax
        .checkExAccountVerifyCode({
          handleType: 2, //检查类型 1: 注销  2：绑定
          appId,
          verifyCode: code,
          account: props.account,
        })
        .then(data => {
          if (data.actionResult === 1) {
            setHasVerification(true);
            setCode('');
          } else {
            if (data.actionResult == ActionResult.noEfficacyVerifyCode) {
              alert(_l('验证码已经失效，请重新发送'), 3);
            } else if (data.actionResult == ActionResult.accountFrequentLoginError) {
              //15
              alert(_l('操作过于频繁，请稍后再试'), 3);
            } else {
              alert(_l('验证码错误'), 3);
            }
            return;
          }
        });
    }
  };

  const bindNew = () => {
    if (!newAccount) {
      return alert(type === 'phone' ? _l('请输入手机号') : _l('请输入邮箱'), 3);
    }
    if (!isValidNumber) {
      return alert(type === 'phone' ? _l('请输入正确的手机号') : _l('请输入正确的邮箱'), 3);
    }
    if (!code) {
      return alert(_l('请输入验证码'), 3);
    } else {
      let Ajax = null;
      if (isBind) {
        Ajax = externalPortalAjax.bindExAccount({
          appId,
          verifyCode: code,
          account: country + newAccount,
        });
      } else {
        Ajax = externalPortalAjax.editExAccount({
          appId,
          verifyCode: code,
          account: country + newAccount,
        });
      }
      Ajax.then(data => {
        if (data.actionResult === 1) {
          onOk(newAccount);
        } else {
          if (data.actionResult == ActionResult.noEfficacyVerifyCode) {
            alert(_l('验证码已经失效，请重新发送'), 3);
          } else if (data.actionResult == ActionResult.failInvalidVerifyCode) {
            alert(_l('验证码错误'), 3);
          } else {
            alert(_l('绑定失败，请稍后再试'), 3);
          }
          return;
        }
      });
    }
  };

  return (
    <Dialog
      title={
        <span className="Bold">
          {props.isBind
            ? type === 'phone'
              ? _l('绑定手机号')
              : _l('绑定邮箱')
            : type === 'phone'
            ? _l('修改手机号')
            : _l('修改邮箱')}
        </span>
      }
      className={cx('userInfoDialog', classNames)}
      headerClass="userInfoDialogTitle"
      bodyClass="telDialogCon"
      width={560}
      footer={
        <div className="footer">
          <Button
            type={!hasVerification ? 'link' : 'primary'}
            onClick={() => {
              setCode('');
              if (!hasVerification) {
                setShow(false);
              } else {
                setHasVerification(false);
                setCode('');
              }
            }}
          >
            {hasVerification ? _l('上一步') : _l('取消')}
          </Button>
          <Button
            type={'primary'}
            onClick={() => {
              if (hasVerification) {
                bindNew();
              } else {
                verificationOld();
              }
            }}
          >
            {hasVerification ? _l('绑定') : _l('下一步')}
          </Button>
        </div>
      }
      onCancel={() => {
        setShow(false);
      }}
      visible={show}
    >
      <AccountDialogWrap>
        <AccountCon
          isBind={isBind}
          inputType={type}
          code={code}
          newAccount={newAccount}
          setCode={data => setCode(data)}
          setNewAccount={data => setNewAccount(data)}
          account={hasVerification ? '' : props.account}
          appId={appId}
          type={hasVerification ? 3 : 2}
          setIsValidNumber={setIsValidNumber}
          setCountry={setCountry}
        />
      </AccountDialogWrap>
    </Dialog>
  );
}
