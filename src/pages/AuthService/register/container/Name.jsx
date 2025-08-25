import React, { useRef } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import styled from 'styled-components';
import fixedDataAjax from 'src/api/fixedData.js';
import RegisterController from 'src/api/register';
import { AccountNextActions } from 'src/pages/AuthService/config.js';
import { registerSuc } from 'src/pages/AuthService/util.js';
import { getRequest } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';

let request = getRequest();
const Wrap = styled.div`
  min-height: 460px;
`;
export default function (props) {
  let { onChange, fullName = '', onlyReadName, email, emailOrTel } = props;
  const [{ createAccountLoading, warnList, focusDiv }, setState] = useSetState({
    createAccountLoading: false,
    warnList: [],
    focusDiv: '',
  });

  const InputRef = useRef(null);
  const InputEmail = useRef(null);

  const doSetAccountInfo = callback => {
    validateCompanyInfoRequiredField().then(res => {
      if (!res) {
        return;
      }

      let { nextAction, isLink, loginForAdd, fullName = '', email = '', emailOrTel = '' } = props;
      email = emailOrTel && RegExpValidator.isEmail(emailOrTel) ? emailOrTel : email;

      if (location.href.indexOf('join') >= 0 && nextAction == AccountNextActions.userCardInfo && !loginForAdd) {
        onChange({ email, step: 'editInfo' });
      } else {
        setState({ createAccountLoading: true });

        RegisterController.setAccountInfo({ fullname: fullName, email: email })
          .then(data => {
            if (data) {
              if (request.from === 'hdp' && request.ReturnUrl) {
                location.href = request.ReturnUrl;
                return;
              }
              if (isLink) {
                if (nextAction == AccountNextActions.createProject) {
                  onChange({ step: 'create' });
                } else if (nextAction == AccountNextActions.userCardInfo) {
                  onChange({ step: 'editInfo' });
                } else if (nextAction == AccountNextActions.login) {
                  registerSuc(props);
                } else {
                  callback && callback();
                }
              } else {
                if ((request.ReturnUrl || '').indexOf('type=privatekey') > -1) {
                  registerSuc(props);
                } else {
                  callback && callback();
                }
              }
            } else {
              setState({ createAccountLoading: false });
              alert(_l('操作失败'), 3);
            }
          })
          .catch(() => {
            setState({ createAccountLoading: false });
            alert(_l('操作失败'), 3);
          });
      }
    });
  };

  // 企业网络基本信息 字段验证
  const validateCompanyInfoRequiredField = async () => {
    setState({ warnList: [], focusDiv: null });
    const { fullName, email, emailOrTel } = props;
    // 企业网络名称
    let isRight = true;
    let warnList = [];
    if (!fullName.trim()) {
      warnList.push({ tipDom: 'fullName', warnTxt: _l('请填写姓名') });
      isRight = false;
    } else {
      await fixedDataAjax.checkSensitive({ content: fullName }).then(res => {
        if (res) {
          warnList.push({ tipDom: 'fullName', warnTxt: _l('输入内容包含敏感词，请重新填写') });
          isRight = false;
        }
      });
    }
    if (!(emailOrTel && RegExpValidator.isEmail(emailOrTel))) {
      if (!RegExpValidator.isEmail(email) && !!email) {
        warnList.push({ tipDom: 'email', warnTxt: _l('邮箱格式错误') });
        isRight = false;
      }
    }
    setState({ warnList });
    return isRight;
  };

  email = emailOrTel && RegExpValidator.isEmail(emailOrTel) ? emailOrTel : email;
  const renderWarn = key => {
    const warn = warnList.find(o => o.tipDom === key);
    if (!warn) return;
    return <div className={cx('warnTips')}>{warn.warnTxt}</div>;
  };
  const renderClassName = (key, value) => {
    const warn = warnList.find(o => o.tipDom === key);
    return {
      hasValue: !!value || focusDiv === key,
      errorDiv: warn,
      warnDiv: warn && warn.noErr,
      errorDivCu: !!focusDiv && focusDiv === key,
    };
  };
  return (
    <Wrap>
      {createAccountLoading && <div className="loadingLine"></div>}
      <div className="title mTop40 Font26 Gray Bold">{_l('完善个人信息')}</div>
      <p className="Gray Font14 mTop16">{_l('请填写真实信息，方便大家与您联系')}</p>
      <div className="messageBox mTop5">
        <div className={cx('mesDiv', renderClassName('fullName', fullName))}>
          <input
            type="text"
            maxLength={'60'}
            autoComplete="off"
            className={cx('fullName', { onlyRead: !!onlyReadName })}
            disabled={onlyReadName ? 'disabled' : ''}
            ref={InputRef}
            onBlur={() => setState({ focusDiv: '', fullName: fullName.trim() })}
            onFocus={() => setState({ focusDiv: 'fullName' })}
            onChange={e => onChange({ fullName: e.target.value })}
            autoFocus
            value={fullName}
          />
          <div className="title" onClick={() => setState({ focusDiv: 'fullName' })}>
            {_l('姓名')}
          </div>
          {renderWarn('fullName')}
        </div>

        {!(emailOrTel && RegExpValidator.isEmail(emailOrTel)) && (
          <div className={cx('mesDiv', renderClassName('email', email))}>
            <input
              type="text"
              className={cx('email', { onlyRead: emailOrTel && RegExpValidator.isEmail(emailOrTel) })}
              maxLength={'60'}
              autoComplete="off"
              ref={InputEmail}
              readOnly={emailOrTel && RegExpValidator.isEmail(emailOrTel)}
              onBlur={() => setState({ focusDiv: '' })}
              onFocus={() => setState({ focusDiv: 'email' })}
              onChange={e => onChange({ email: e.target.value })}
              value={email}
            />
            <div className="title" onClick={() => setState({ focusDiv: 'email' })}>
              {_l('邮箱(选填)')}
            </div>
            {renderWarn('email')}
          </div>
        )}
      </div>
      <span
        className="btnForRegister Hand"
        onClick={() => {
          if (createAccountLoading) return;
          doSetAccountInfo(() => {
            onChange({ step: 'createOrAdd' });
          });
        }}
      >
        {createAccountLoading ? _l('提交中...') : _l('下一步')}
      </span>
    </Wrap>
  );
}
