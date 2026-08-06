import React, { useEffect, useRef, useState } from 'react';
import { useKey, useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import Checkbox from 'ming-ui/components/Checkbox';
import { captcha } from 'ming-ui/functions';
import appManagementController from 'src/api/appManagement';
import AccountInfo from 'src/pages/AuthService/components/AccountInfo.jsx';
import { InviteFromType } from 'src/pages/AuthService/config.js';
import { registerAction } from 'src/pages/AuthService/register/util.js';
import { getAccountTypes, hasCaptcha, isTel, validation } from 'src/pages/AuthService/util.js';
import { navigateTo } from 'src/router/navigateTo';
import { getRequest, htmlDecodeReg } from 'src/utils/common';
import Form from './Form.jsx';

// 'privacyText'  注册 需要勾选 使用条款 与 隐私条款
export default function (props) {
  const {
    onChange = () => {},
    warnList = [],
    titleStr = '',
    createAccountLoading,
    inviteInfo = {},
    isLink,
    loginForAdd,
    focusDiv,
    hasCheckPrivacy,
    canSendCodeByTel = false,
    dialCode,
    emailOrTel,
    loading,
  } = props;

  const cache = useRef({});

  const [keys, setKeys] = useState([]);
  const type = isLink ? (loginForAdd ? 'login' : 'invite') : 'register';

  const [{ itiType, loadProjectName, projectNameLang }, setState] = useSetState({
    itiType: getAccountTypes(),
    loadProjectName: !!props.projectId,
    projectNameLang: '', // 组织简称多语言翻译
  });

  useEffect(() => {
    setKeys([
      ...(isLink
        ? loginForAdd || location.pathname.indexOf('join') >= 0 //定向邀请已存在手机号和邮箱不需要验证
          ? [getAccountTypes(true), !loginForAdd ? 'setPassword' : 'password']
          : [getAccountTypes(location.href.indexOf('linkInvite') < 0), 'code', 'setPassword']
        : [itiType, 'code', 'setPassword']),
      isLink && loginForAdd ? '' : 'privacy',
    ]);
  }, [isLink, loginForAdd, itiType]);

  useKey('Enter', () => {
    if (!hasCaptcha()) {
      cache.current.onRegister();
    }
  });

  useEffect(() => {
    !!props.projectId && getProjectLang(props.projectId);
  }, []);

  useEffect(() => {
    if (props.isFrequentLoginError) {
      doCaptchaFn(true);
      onChange({ isFrequentLoginError: false });
    }
  }, [props.isFrequentLoginError]);

  const getProjectLang = projectId => {
    appManagementController
      .getProjectLang({ projectId })
      .then(res => {
        setState({
          loadProjectName: false,
          projectNameLang: _.get(
            _.find(res, o => o.langType === getCurrentLangCode()),
            'data[0].value',
          ),
        });
      })
      .catch(error => {
        console.log(error);
        setState({ loadProjectName: false });
      });
  };

  const doCaptchaFn = isFrequentLoginError => {
    if (createAccountLoading && !isFrequentLoginError) return;
    const callback = (res = {}) => {
      if (isFrequentLoginError && res.ret !== 0) return;

      onChange({ createAccountLoading: true });
      registerAction({
        res: Object.assign({}, res, { captchaType: md.global.getCaptchaType() }),
        info: props,
        onChange: onChange,
        callback: callback,
      });
    };

    if (isFrequentLoginError) {
      new captcha(callback);
    } else {
      callback();
    }
  };

  const toLoginContain = () => {
    const { ReturnUrl, from } = getRequest();
    onChange({ warnList: [] });
    if (isLink) {
      onChange({ loginForAdd: !loginForAdd, focusDiv: '' });
    } else {
      if (ReturnUrl && from) {
        navigateTo('/login?ReturnUrl=' + encodeURIComponent(ReturnUrl) + '&from=' + from);
      } else if (ReturnUrl) {
        navigateTo('/login?ReturnUrl=' + encodeURIComponent(ReturnUrl));
      } else {
        navigateTo('/login');
      }
    }
  };

  const onRegister = async () => {
    if (createAccountLoading) return;
    const validationData = validation({ isForSendCode: false, keys, type, info: props });
    onChange({ warnList: validationData.warnList });
    let isV = await validationData.isRight;

    if (isV) {
      registerAction({
        info: _.pick(props, [
          'emailOrTel',
          'verifyCode',
          'password',
          'dialCode',
          'hasCheckPrivacy',
          'canSendCodeByTel',
          'confirmation',
          'isLink',
          'loginForAdd',
          'nextAction',
        ]),
        onChange: onChange,
        callback: () => onChange({ step: 'registerName' }),
      });
    }
  };

  cache.current.onRegister = onRegister;

  const { createUserName = '' } = inviteInfo;

  const warn = _.find(warnList, it => it.tipDom === 'canSendCodeByTel');
  const warnPrivate = _.find(warnList, it => it.tipDom === 'privacyText');
  const { unionId, state, tpType } = getRequest();
  const isPrivateDeployment = window.platformENV.isOverseas || window.platformENV.isLocal;
  const termsUrl = isPrivateDeployment ? `${md.global.Config.PlatformUrl}legalportal/terms` : '/terms';
  const privacyUrl = isPrivateDeployment ? `${md.global.Config.PlatformUrl}legalportal/privacy` : '/privacy';

  if (loading) return <LoadDiv />;
  return (
    <React.Fragment>
      <div className="titleHeader">
        {!isLink ? (
          <div className="title mTop40 Bold TxtMiddle">
            {unionId && state && tpType && (
              <div
                className="Font22 Hand back textSecondary hoverColorPrimary InlineBlock"
                onClick={() => {
                  navigateTo('/login');
                }}
              >
                <Tooltip title={_l('返回登录')} placement="bottom">
                  <Icon icon="backspace mRight8" />
                </Tooltip>
              </div>
            )}
            {_l('注册')}
          </div>
        ) : (
          <div className="title mTop40">
            {inviteInfo.fromType === InviteFromType.project && createUserName ? (
              <React.Fragment>
                <div className="Font20 Bold">{loadProjectName ? '' : projectNameLang || htmlDecodeReg(titleStr)}</div>
                <div className="textSecondary Font14 Bold">{_l('%0邀请您加入组织', createUserName)}</div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                {!createUserName ? _l('您正在加入') : _l('%0邀请您加入', createUserName)}
                <div>{loadProjectName ? '' : projectNameLang || htmlDecodeReg(titleStr)}</div>
              </React.Fragment>
            )}
          </div>
        )}
      </div>
      {!inviteInfo.account && (
        <div className="authSwitchEntry">
          {isLink ? (
            loginForAdd ? (
              <span className="authSwitchLink Hand" onClick={() => toLoginContain()}>
                {_l('注册并加入')}
              </span>
            ) : (
              <React.Fragment>
                <span className="textSecondary">{_l('已有账号')} , </span>
                <span className="authSwitchLink Hand" onClick={() => toLoginContain()}>
                  {_l('登录')}
                </span>
              </React.Fragment>
            )
          ) : (
            <React.Fragment>
              <span className="textSecondary">{_l('已有账号')}?</span>
              <span
                className="authSwitchLink Hand mLeft8"
                onClick={() => {
                  if (unionId && state && tpType) {
                    navigateTo(`/login?state=${state}&tpType=${tpType}&unionId=${unionId}`);
                  } else {
                    toLoginContain();
                  }
                }}
              >
                {_l('登录')}
              </span>
            </React.Fragment>
          )}
        </div>
      )}
      {unionId && state && tpType && <AccountInfo />}
      <div className="mBottom20">
        <Form {...props} type={type} keys={keys} />
      </div>
      {isTel(emailOrTel) && dialCode !== '+86' && keys.includes('code') && (
        <div className="messageBox">
          <div
            className={cx('termsText textPrimary canSendCodeByTel mesDiv', {
              hasValue: canSendCodeByTel || focusDiv === 'canSendCodeByTel',
              errorDiv: warn,
              warnDiv: warn && warn.noErr,
              errorDivCu: !!focusDiv && focusDiv === 'canSendCodeByTel',
            })}
          >
            <span
              className="flexRow alignItemsCenter Hand privacyTextCon Bold"
              onClick={() => {
                if (!canSendCodeByTel) {
                  let data = _.filter(warnList, it => it.tipDom !== 'canSendCodeByTel');
                  onChange({ focusDiv: 'canSendCodeByTel', canSendCodeByTel: !canSendCodeByTel, warnList: data });
                } else {
                  onChange({ canSendCodeByTel: !canSendCodeByTel, focusDiv: 'canSendCodeByTel' });
                }
              }}
            >
              <Checkbox checked={canSendCodeByTel} className="InlineBlock" />
              {_l('我同意接收短信')}
            </span>
          </div>
        </div>
      )}
      {!(isLink && loginForAdd) && (
        <div className="messageBox">
          <div
            className={cx('termsText textPrimary privacyText mesDiv', {
              hasValue: hasCheckPrivacy || focusDiv === 'privacyText',
              errorDiv: warnPrivate,
              warnDiv: warnPrivate,
              errorDivCu: !!focusDiv && focusDiv === 'privacyText',
            })}
          >
            <span
              className="flexRow alignItemsCenter Hand privacyTextCon"
              onClick={() => {
                if (!hasCheckPrivacy) {
                  let data = _.filter(warnList, it => it.tipDom !== 'privacyText');
                  onChange({ focusDiv: 'privacyText', hasCheckPrivacy: !hasCheckPrivacy, warnList: data });
                } else {
                  onChange({ hasCheckPrivacy: !hasCheckPrivacy, focusDiv: 'privacyText' });
                }
              }}
            >
              <Checkbox checked={hasCheckPrivacy} className="InlineBlock" />
              {_l('同意')}
              <span
                className="terms Hand mLeft3 mRight3"
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (window.isMingDaoApp) {
                    location.href = termsUrl;
                  } else {
                    window.open(termsUrl);
                  }
                }}
              >
                {_l('《使用条款》%14000')}
              </span>
              {_l('和')}
              <span
                className="terms Hand mLeft3 mRight3"
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (window.isMingDaoApp) {
                    location.href = privacyUrl;
                  } else {
                    window.open(privacyUrl);
                  }
                }}
              >
                {_l('《隐私条款》')}
              </span>
            </span>
          </div>
        </div>
      )}

      <React.Fragment>
        {createAccountLoading && <div className="loadingLine"></div>}
        {isLink && loginForAdd && (
          <p className="termsText textSecondary">
            <a target="_blank" onClick={() => navigateTo('/findPassword')}>
              {_l('忘记密码？')}
            </a>
          </p>
        )}
        <span className={cx('btnForRegister Hand')} onClick={() => onRegister()}>
          {!isLink ? _l('注册') : !loginForAdd ? _l('注册并加入') : _l('登录并加入')}
          {createAccountLoading && '...'}
        </span>
      </React.Fragment>
    </React.Fragment>
  );
}
