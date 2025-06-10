import React from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import styled from 'styled-components';
import { Support } from 'ming-ui';
import { captcha } from 'ming-ui/functions';
import RegisterController from 'src/api/register';
import { mdAppResponse } from 'src/utils/project';

const Wrap = styled.div`
  min-height: 460px;
`;
export default function (props) {
  const { onChange = () => {}, regcode = '' } = props;
  const [{ loading, warnTxt, focusDiv }, setState] = useSetState({
    loading: false,
    warnTxt: '', //验证码的提示文案
    focusDiv: '',
  });

  const doAddProjectCode = res => {
    setState({ loading: true });
    const { regcode = '', onChange = () => {} } = props;
    let params = { projectCode: regcode };

    if (res) {
      params.ticket = res.ticket;
      params.randStr = res.randstr;
      params.captchaType = md.global.getCaptchaType();
    }

    RegisterController.checkProjectCode(params)
      .then(data => {
        setState({ loading: false });
        if (data.joinProjectResult === 1) {
          onChange({
            projectId: data.userCard.user.projectId,
            tokenProjectCode: data.token,
            userCard: data.userCard,
            step: 'editInfo',
          });
        } else if (data.joinProjectResult === 11) {
          //频繁登录错误，需要验证码
          onSubmit(true);
        } else {
          setState({ loading: false });
          let str = _l('操作失败');
          let { dialCode, password = '', emailOrTel = '' } = props;
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
      })
      .catch(() => {
        alert(_l('操作失败'), 3);
        setState({ loading: false });
      });
  };

  const renderCon = () => {
    const { regcode, onChange = () => {} } = props;
    const renderWarn = () => {
      if (!warnTxt) return;
      return <div className={cx('warnTips')} dangerouslySetInnerHTML={{ __html: warnTxt }}></div>;
    };
    const renderClassName = (key, value) => {
      const warn = warnTxt;
      return {
        hasValue: !!value || focusDiv === key,
        errorDiv: warn,
        warnDiv: warn && warn.noErr,
        errorDivCu: !!focusDiv && focusDiv === key,
      };
    };
    return (
      <React.Fragment>
        <div className="messageBox mTop5">
          <div className={cx('mesDiv', renderClassName('regcode', regcode))}>
            <input
              type="text"
              className="regcode"
              autoComplete="off"
              onBlur={() => setState({ focusDiv: '' })}
              onFocus={() => setState({ focusDiv: 'regcode' })}
              onChange={e => {
                onChange({ regcode: e.target.value.trim() });
                setState({ warnTxt: '' });
              }}
              value={regcode}
            />
            <div className="title" onClick={e => setState({ focusDiv: 'regcode' })}>
              {_l('示例：MD1314')}
            </div>
            {renderWarn('regcode')}
          </div>
        </div>
      </React.Fragment>
    );
  };

  const onSubmit = isFrequentLoginError => {
    let callback = (res = {}) => {
      if (isFrequentLoginError && res.ret !== 0) return;
      doAddProjectCode(res);
    };

    if (isFrequentLoginError) {
      new captcha(callback);
    } else {
      callback();
    }
  };

  return (
    <Wrap>
      {loading && <div className="loadingLine"></div>}
      {!location.href.match(/enterpriseRegister(\.htm)?\?type=add/i) && (
        <span className="mTop40 Font15 InlineBlock Hand backspaceT" onClick={() => onChange({ step: 'createOrAdd' })}>
          <span className="backspace"></span>
          {_l('返回')}
        </span>
      )}
      <div className="title mTop16 Font26 Bold">{_l('请填写组织门牌号')}</div>
      <p className="mTop6 Gray Font15">{_l('组织门牌号可以通过管理员获取')}</p>
      {renderCon()}
      <Support
        type={3}
        href="https://help.mingdao.com/org/id"
        text={_l('没有组织门牌号？')}
        className="mTop16 InlineBlock"
      />
      <span
        className="btnForRegister Hand mTop40"
        onClick={() => {
          if (loading) return;
          if (!regcode) {
            setState({ warnTxt: _l('请填写组织门牌号'), focusDiv: '' });
            return;
          }
          onSubmit();
        }}
      >
        {loading ? _l('加入...') : _l('加入')}
      </span>
    </Wrap>
  );
}
