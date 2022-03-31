import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Icon, Button, Dialog } from 'ming-ui';
import { checkExAccountVerifyCode, editExAccountBindNewPhone } from 'src/api/externalPortal';
import TelCon from './TelCon';
import cx from 'classnames';
import Config from 'src/pages/account/config';
const { ActionResult } = Config;

const TelDialogWrap = styled.div``;
export default function TelDialog(props) {
  const { setShow, show, classNames, appId, onOk } = props;
  const [hasVerification, setHasVerification] = useState(false);
  const [newTel, setNewTel] = useState('');
  const [code, setCode] = useState('');
  const [isValidNumber, setIsValidNumber] = useState(false);

  //验证老的手机号
  const verificationOld = () => {
    if (!code) {
      alert(_l('请输入验证码'), 3);
    } else {
      checkExAccountVerifyCode({
        handleType: 2, //检查类型 1: 注销  2：绑定手机号
        appId,
        verifyCode: code,
      }).then(data => {
        if (data.actionResult === 1) {
          setHasVerification(true);
          setCode('');
        } else {
          if (data.actionResult == ActionResult.noEfficacyVerifyCode) {
            alert(_l('验证码已经失效，请重新发送'), 3);
          } else if (res.actionResult == ActionResult.accountFrequentLoginError) {
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
    if (!newTel) {
      return alert(_l('请输入手机号'), 3);
    }
    if (!isValidNumber) {
      return alert(_l('请输入正确的手机号'), 3);
    }
    if (!code) {
      return alert(_l('请输入验证码'), 3);
    } else {
      editExAccountBindNewPhone({
        appId,
        verifyCode: code,
        account: newTel,
      }).then(data => {
        if (data.actionResult === 1) {
          onOk();
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
      title={_l('修改手机号')}
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
      <TelDialogWrap>
        <TelCon
          code={code}
          setCode={data => setCode(data)}
          setNewTel={data => setNewTel(data)}
          tel={hasVerification ? '' : props.data}
          appId={appId}
          type={hasVerification ? 3 : 2}
          setIsValidNumber={setIsValidNumber}
        />
      </TelDialogWrap>
    </Dialog>
  );
}
