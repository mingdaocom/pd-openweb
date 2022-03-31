import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';
import { removePssId } from 'src/util/pssId';
import TelCon from './TelCon';
import cx from 'classnames';
import { editExAccountCancel, checkExAccountVerifyCode } from 'src/api/externalPortal';
import Config from 'src/pages/account/config';
const { ActionResult } = Config;
const DelDialogWrap = styled.div``;
export default function DelDialog(props) {
  const { setShow, show, appId, classNames } = props;
  const [code, setCode] = useState('');
  const verificationOld = () => {
    if (!code) {
      alert(_l('请输入验证码'), 3);
    } else {
      checkExAccountVerifyCode({
        handleType: 1, //检查类型 1: 注销  2：绑定手机号
        appId,
        verifyCode: code,
      }).then(data => {
        if (data.actionResult === 1) {
          Dialog.confirm({
            title: <span className="Font17 Bold">{_l('您是否确认注销账号？')}</span>,
            description: _l(
              '账号一旦注销将无法登录平台，且会解除与第三方账号的绑定关系、身份、账号信息等将被清空且无法找回',
            ),
            okText: _l('注销'),
            buttonType: 'danger',
            className: cx('userInfoDialog', classNames),
            onOk: () => {
              editExAccountCancel({
                appId,
              }).then(res => {
                if (res.actionResult === 1) {
                  window.currentLeave = true;
                  removePssId();
                  window.localStorage.removeItem('LoginCheckList'); // accountId 和 encryptPassword 清理掉
                  const url = `${location.origin}${window.subPath || ''}/app/${appId}`;
                  location.href = url; // 跳转到登录
                } else {
                  if (res.actionResult == ActionResult.noEfficacyVerifyCode) {
                    alert(_l('验证码已经失效，请重新发送'), 3);
                  } else if (res.actionResult == ActionResult.accountFrequentLoginError) {
                    alert(_l('操作过于频繁，请稍后再试'), 3);
                  } else {
                    alert(_l('注销失败，请稍后再试'), 3);
                  }
                }
              });
            },
          });
        } else {
          if (data.actionResult == ActionResult.noEfficacyVerifyCode) {
            alert(_l('验证码已经失效，请重新发送'), 3);
          } else if (data.actionResult == ActionResult.accountFrequentLoginError) {
            alert(_l('操作过于频繁，请稍后再试'), 3);
          } else {
            alert(_l('验证码错误'), 3);
          }
          return;
        }
      });
    }
  };
  return (
    <Dialog
      title={_l('注销账户')}
      okText={_l('下一步')}
      cancelText={_l('取消')}
      className={cx('userInfoDialog', classNames)}
      headerClass="userInfoDialogTitle"
      bodyClass="delDialogCon"
      width={560}
      onCancel={() => {
        setShow(false);
      }}
      onOk={() => {
        if (!!code) {
          verificationOld();
        } else {
          alert(_l('请输入验证码'), 3);
        }
      }}
      visible={show}
    >
      <DelDialogWrap>
        <TelCon setCode={data => setCode(data)} code={code} tel={props.data} type={1} appId={appId} />
      </DelDialogWrap>
    </Dialog>
  );
}
