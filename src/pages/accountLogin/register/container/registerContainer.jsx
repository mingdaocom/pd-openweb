import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../redux/actions';
import MessageCon from 'src/pages/accountLogin/components/message';
import cx from 'classnames';
import { InviteFromType } from 'src/pages/accountLogin/config.js';
import {
  hasCaptcha,
  setWarnningData,
  warnningTipFn,
  getAccountTypes,
  clickErrInput,
} from 'src/pages/accountLogin/util.js';
import { captcha } from 'ming-ui/functions';
import { getRequest, htmlDecodeReg } from 'src/util';
import _ from 'lodash';
import ChangeLang from 'src/components/ChangeLang';
import Checkbox from 'ming-ui/components/Checkbox';
import 'src/pages/accountLogin/components/message.less';
import { navigateTo } from 'src/router/navigateTo';
import appManagementController from 'src/api/appManagement';

const mapStateToProps = ({ accountInfo, warnningData, stateList, nextAction }) => ({
  registerData: accountInfo,
  warnningData,
  nextAction,
  createAccountLoading: stateList.createAccountLoading,
  isFrequentLoginError: stateList.isFrequentLoginError,
});
const mapDispatchToProps = dispatch => bindActionCreators({ ...actions }, dispatch);

@connect(mapStateToProps, mapDispatchToProps)
export default class Container extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      version: Math.random().toString(),
      itiType: getAccountTypes(),
      loadProjectName: !!props.projectId,
      projectNameLang: '', // 组织简称多语言翻译
    };

    !!props.projectId && this.getProjectLang(props.projectId);
  }

  componentDidMount() {
    document.addEventListener('keypress', this.handleEnterKey);
  }

  componentWillReceiveProps(nextProps) {
    if (
      _.get(nextProps, 'warnningData') !== _.get(this.props, 'warnningData') &&
      (_.get(nextProps, 'warnningData') || []).length > 0
    ) {
      clickErrInput(_.get(nextProps, 'warnningData'), _.get(nextProps, 'registerData.focusDiv'), nextProps.setData);
    }
    if (
      _.get(nextProps, 'isFrequentLoginError') !== _.get(this.props, 'isFrequentLoginError') &&
      _.get(nextProps, 'isFrequentLoginError')
    ) {
      this.doCaptchaFn(true);
      this.props.updateIsFrequentLoginError(false);
    }
  }

  componentWillUmount() {
    document.removeEventListener('keypress', this.handleEnterKey);
  }

  getProjectLang = projectId => {
    appManagementController.getProjectLang({ projectId }).then(res => {
      this.setState({
        loadProjectName: false,
        projectNameLang: _.get(
          _.find(res, o => o.langType === getCurrentLangCode()),
          'data[0].value',
        ),
      });
    });
  };

  handleEnterKey = e => {
    if (e.keyCode === 13 && !hasCaptcha()) {
      this.onBtn();
    }
  };

  doCaptchaFn = isFrequentLoginError => {
    const { createAccountLoading, registerAction = () => {} } = this.props;
    let callback = (res = {}) => {
      if (isFrequentLoginError && res.ret !== 0) {
        return;
      }

      this.props.updateCreateLoading(true);
      registerAction(Object.assign({}, res, { captchaType: md.global.getCaptchaType() }));
    };

    if (createAccountLoading && !isFrequentLoginError) {
      return;
    }

    if (isFrequentLoginError) {
      if (md.global.getCaptchaType() === 1) {
        new captcha(callback);
      } else {
        new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), callback).show();
      }
    } else {
      callback();
    }
  };

  useOldAccountFn = () => {
    const { registerData = {}, updateWarn = () => {}, setData = () => {} } = this.props;
    const { isLink, loginForAdd } = registerData;
    let request = getRequest();
    let returnUrl = request.ReturnUrl;

    updateWarn([]);

    if (isLink) {
      setData({ loginForAdd: !loginForAdd, focusDiv: '' });
    } else {
      if (returnUrl) {
        navigateTo('/login?ReturnUrl=' + encodeURIComponent(returnUrl));
      } else {
        navigateTo('/login');
      }
    }
  };

  onBtn = async () => {
    const {
      createAccountLoading,
      registerAction = () => {},
      isValid = () => {},
      registerData = {},
      setStep = () => {},
    } = this.props;
    const { isLink, loginForAdd } = registerData;
    const { itiType } = this.state;

    if (createAccountLoading) {
      return;
    }
    const keys = [
      ...(isLink
        ? loginForAdd || location.pathname.indexOf('join') >= 0 //定向邀请已存在手机号和邮箱不需要验证
          ? [getAccountTypes(true), !loginForAdd ? 'setPassword' : 'password']
          : [getAccountTypes(true), 'code', 'setPassword']
        : [itiType, 'code', 'setPassword']),
      ,
      (isLink && loginForAdd) || !_.get(md, 'global.SysSettings.enableDeclareRegisterConfirm') ? '' : 'privacy',
    ];
    let isV = await isValid(false, keys);

    if (isV) {
      registerAction({
        callback: () => {
          setStep('registerName');
        },
      });
    }
  };

  render() {
    const {
      registerData = {},
      setData = () => {},
      updateWarn = () => {},
      warnningData = [],
      titleStr = '',
      createAccountLoading,
      clearInfoByUrl = () => {},
    } = this.props;
    const { inviteInfo = {}, isLink, loginForAdd, focusDiv, hasCheckPrivacy } = registerData;
    const { createUserName = '' } = inviteInfo;
    const { version, itiType, loadProjectName, projectNameLang } = this.state;

    return (
      <React.Fragment>
        <div className="titleHeader">
          {!isLink ? (
            <div className="title mTop40 Bold">{_l('注册')}</div>
          ) : (
            <div className="title mTop40">
              {inviteInfo.fromType === InviteFromType.project && createUserName ? (
                <React.Fragment>
                  <div className="Font20 Bold">{loadProjectName ? '' : projectNameLang || htmlDecodeReg(titleStr)}</div>
                  <div className="Gray_9e Font14 Bold">{_l('%0邀请您加入组织', createUserName)}</div>
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
        <MessageCon
          type={isLink ? (loginForAdd ? 'login' : 'invite') : 'register'}
          keys={[
            ...(isLink
              ? loginForAdd || location.pathname.indexOf('join') >= 0 //定向邀请已存在手机号和邮箱不需要验证
                ? [getAccountTypes(true), !loginForAdd ? 'setPassword' : 'password']
                : [getAccountTypes(true), 'code', 'setPassword']
              : [itiType, 'code', 'setPassword']),
            (isLink && loginForAdd) || !_.get(md, 'global.SysSettings.enableDeclareRegisterConfirm') ? '' : 'privacy',
          ]}
          key={version}
        />
        {!(isLink && loginForAdd) && _.get(md, 'global.SysSettings.enableDeclareRegisterConfirm') && (
          <div className="messageBox">
            <div
              className={cx('termsText Gray_75 privacyText mesDiv', {
                ...setWarnningData(warnningData, ['.privacyText'], focusDiv, hasCheckPrivacy),
              })}
            >
              <span
                className="flexRow alignItemsCenter Hand privacyTextCon"
                onClick={() => {
                  if (!hasCheckPrivacy) {
                    let data = _.filter(warnningData, it => it.tipDom !== '.privacyText');
                    setData({ focusDiv: '.privacyText', hasCheckPrivacy: !hasCheckPrivacy });
                    updateWarn(data);
                  } else {
                    setData({ hasCheckPrivacy: !hasCheckPrivacy, focusDiv: '.privacyText' });
                  }
                }}
              >
                <Checkbox checked={hasCheckPrivacy} className="InlineBlock" />
                {_l('同意')}
                <a
                  target="_blank"
                  className="terms Hand mLeft3 mRight3"
                  href={`/legalportal/terms`}
                  onClick={e => e.stopPropagation()}
                >
                  {_l('《使用条款》%14000')}
                </a>
                {_l('和')}
                <a
                  target="_blank"
                  className="terms Hand mLeft3 mRight3"
                  href={`/legalportal/privacy`}
                  onClick={e => e.stopPropagation()}
                >
                  {_l('《隐私条款》')}
                </a>
              </span>
              {warnningTipFn(warnningData, ['.privacyText'], focusDiv)}
            </div>
          </div>
        )}

        <React.Fragment>
          {createAccountLoading && <div className="loadingLine"></div>}
          {isLink && loginForAdd && (
            <p className="termsText Gray_75">
              <a
                target="_blank"
                onClick={() => {
                  clearInfoByUrl();
                  navigateTo('/findPassword');
                }}
              >
                {_l('忘记密码？')}
              </a>
            </p>
          )}
          <span
            className={cx('btnForRegister Hand')}
            onClick={() => {
              this.onBtn();
            }}
          >
            {!isLink ? _l('注册') : !loginForAdd ? _l('注册并加入') : _l('登录并加入')}
            {createAccountLoading && '...'}
          </span>
        </React.Fragment>
        {/* 已有账号只能登录并加入 */}
        {!inviteInfo.account ? (
          <React.Fragment>
            <span className={cx('line', { mTopH: loginForAdd })}></span>
            <div className="flexRow alignItemsCenter justifyContentCenter footerCon">
              <span className="changeBtn Hand TxtRight">
                {isLink ? (
                  loginForAdd ? (
                    <span
                      className="Hand textB"
                      onClick={() => {
                        this.useOldAccountFn();
                      }}
                    >
                      {_l('注册并加入')}
                    </span>
                  ) : (
                    <React.Fragment>
                      <span className="textG">{_l('已有账号')} , </span>
                      <span
                        className="textB Hand"
                        onClick={() => {
                          this.useOldAccountFn();
                        }}
                      >
                        {_l('登录')}
                      </span>
                    </React.Fragment>
                  )
                ) : (
                  <span
                    className="Hand textB"
                    onClick={() => {
                      this.useOldAccountFn();
                    }}
                  >
                    {_l('登录已有账号')}
                  </span>
                )}
              </span>
              <span className="lineCenter mLeft24"></span>
              <div className="mLeft16 TxtLeft">
                <ChangeLang className="justifyContentLeft" />
              </div>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <span className={cx('line', { mTopH: loginForAdd })}></span>
            <ChangeLang className="mTop20" />
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}
