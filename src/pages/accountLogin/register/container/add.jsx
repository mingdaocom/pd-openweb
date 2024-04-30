import React from 'react';
import 'src/pages/accountLogin/components/message.less';
import cx from 'classnames';
import RegisterController from 'src/api/register';
import { captcha } from 'ming-ui/functions';
import { setWarnningData, warnningTipFn } from '../../util';
import { Support } from 'ming-ui';
import { mdAppResponse } from 'src/util';
import styled from 'styled-components';

const Wrap = styled.div`
  min-height: 460px;
`;
export default class Add extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      warnningText: '', //验证码的提示文案
      focusDiv: '',
    };
  }

  doAddProjectCode = res => {
    this.setState({
      loading: true,
    });
    const { registerData = {}, updateUseCard = () => {}, setStep = () => {}, setData = () => {} } = this.props;
    const { regcode = '' } = registerData;
    let params = { projectCode: regcode };

    if (res) {
      params.ticket = res.ticket;
      params.randStr = res.randstr;
      params.captchaType = md.global.getCaptchaType();
    }

    RegisterController.checkProjectCode(params).then(data => {
      this.setState({ loading: false });

      if (data.joinProjectResult === 1) {
        setData({
          projectId: data.userCard.user.projectId,
          tokenProjectCode: data.token,
        });
        updateUseCard(data.userCard);
        setStep('editInfo');
      } else if (data.joinProjectResult === 11) {
        //频繁登录错误，需要验证码
        this.onSubmit(true);
      } else {
        this.setState({ loading: false });
        let str = _l('操作失败');
        let { dialCode, password = '', emailOrTel = '' } = registerData;

        if (data.joinProjectResult === 2) {
          str = _l('您已提交申请，请耐心等待管理员审批！');
          if (window.isMingDaoApp) {
            mdAppResponse({
              sessionId: 'register',
              type: 'native',
              settings: { action: 'enterpriseRegister.addPending', account: dialCode + emailOrTel, password },
            });
          }
        } else if (data.joinProjectResult === 3) {
          str = _l('您已是该组织成员');
        } else if (data.joinProjectResult === 4) {
          str = _l('该组织门牌号不存在');
        } else if (data.joinProjectResult === 5) {
          str = _l('你加入的组织用户额度不足，请联系该组织管理员');
        } else if (data.joinProjectResult === 6) {
          str = _l('验证码错误');
        } else if (data.joinProjectResult === 7) {
          str = _l('该组织未开启搜索加入，请联系组织管理员');
        } else if (data.joinProjectResult === 12) {
          str = _l('您提交的加入申请未被通过');
        } else if (data.joinProjectResult === 13) {
          str = _l('申请加入失败，您在该企业已离职，请联系管理员恢复权限');
        }

        if (data.joinProjectResult === 3) {
          alert(str, 1, 2000, function () {
            if (window.isMingDaoApp) {
              mdAppResponse({
                sessionId: 'register',
                type: 'native',
                settings: { action: 'enterpriseRegister.addSuccess', account: dialCode + emailOrTel, password },
              });
            }
            location.href = '/personal?type=enterprise';
          });
        } else {
          alert(str, 3);
        }
      }
    });
  };

  setWarnningText = warnningText => {
    this.setState({ warnningText }, () => {
      $(this.regcode).focus();
    });
  };

  renderCon = () => {
    const { registerData = {}, setData = () => {} } = this.props;
    const { regcode } = registerData;
    const { warnningText, focusDiv } = this.state;
    const warnningData = warnningText
      ? [
          {
            tipDom: '.regcode',
            warnningText,
          },
        ]
      : [];

    return (
      <React.Fragment>
        <div className="messageBox mTop5">
          <div
            className={cx('mesDiv', {
              ...setWarnningData(warnningData, ['.regcode'], focusDiv, regcode),
            })}
          >
            <input
              type="text"
              className="regcode"
              autoComplete="off"
              ref={regcode => (this.regcode = regcode)}
              onBlur={() => this.setState({ focusDiv: '' })}
              onFocus={() => this.setState({ focusDiv: '.regcode' })}
              onChange={e => {
                setData({
                  regcode: e.target.value.trim(),
                });
              }}
              value={regcode}
            />
            <div
              className="title"
              onClick={e => {
                $(this.regcode).focus();
              }}
            >
              {_l('示例：MD1314')}
            </div>
            {warnningTipFn(warnningData, ['.regcode'], focusDiv)}
          </div>
        </div>
      </React.Fragment>
    );
  };

  onSubmit = isFrequentLoginError => {
    let callback = (res = {}) => {
      if (isFrequentLoginError && res.ret !== 0) {
        return;
      }

      this.doAddProjectCode(res);
    };

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

  render() {
    const { registerData = {}, setStep = () => {} } = this.props;
    const { regcode = '' } = registerData;

    return (
      <Wrap>
        {this.state.loading && <div className="loadingLine"></div>}
        {!location.href.match(/enterpriseRegister(\.htm)?\?type=add/i) && (
          <span
            className="mTop40 Font15 InlineBlock Hand backspaceT"
            onClick={() => {
              setStep('createOrAdd');
            }}
          >
            <span className="backspace"></span>
            {_l('返回')}
          </span>
        )}
        <div className="title mTop24 Font20">{_l('请填写组织门牌号')}</div>
        <p className="mTop10 Gray_9e Font15">{_l('组织门牌号可以通过管理员获取')}</p>
        {this.renderCon()}
        <Support
          type={3}
          href="https://help.mingdao.com/org/id"
          text={_l('没有组织门牌号？')}
          className="mTop16 InlineBlock"
        />
        <span
          className="btnForRegister Hand mTop40"
          onClick={() => {
            if (this.state.loading) {
              return;
            }

            if (!regcode) {
              this.setWarnningText(_l('请填写组织门牌号'));
              return;
            }

            this.onSubmit();
          }}
        >
          {this.state.loading ? _l('加入...') : _l('加入')}
        </span>
      </Wrap>
    );
  }
}
