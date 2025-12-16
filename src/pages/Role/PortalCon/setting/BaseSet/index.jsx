import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { Checkbox, PriceTip, Radio } from 'ming-ui';
import AppManagement from 'src/api/appManagement';
import { LOGIN_WAY, REJISTER_WAY } from 'src/pages/Role/config.js';
import BasicSet from './BasicSet';
import CardSet from './CardSet';
import { ALLOW_TYPE } from './config';
import LoginSet from './LoginSet';
import NoticeSet from './NoticeSet';
import { Wrap } from './style';

export default function BaseSet(props) {
  let { portalSet = {}, onChangePortalSet, projectId, portal = {} } = props;
  const [portalSetModel, setPortalSetModel] = useState({});
  const { noticeScope = {}, isFrontDomain } = portalSetModel; //isFrontDomain是否为前置域名
  const [epDiscussWorkFlow, setEpDiscussWorkFlow] = useState(portalSet.epDiscussWorkFlow || {});
  const [isWXExist, setIsWXExist] = useState(portalSet.isWXExist);
  const [allowUserType, setAllowType] = useState(portalSetModel.allowUserType || 3); //允许的用户
  const [admin, setNotify] = useState(noticeScope.admin || false); //允许的用户
  const [exAccountSmsNotice, setExAccountSmsNotice] = useState(noticeScope.exAccountSmsNotice || false); //审核结果短信通知外部用户
  const [authorizerInfo, setAuthorizerInfo] = useState(portalSet.authorizerInfo || {});
  const [customizeName, setcustomizeName] = useState(portalSetModel.customizeName);
  const [{ loading }, setCommonState] = useSetState({ loading: true });
  const [businessCardOption, setBusinessCardOption] = useState([]);
  const [externalControls, setExternalControls] = useState([]);
  const [internalControls, setInternalControls] = useState([]);

  useEffect(() => {
    let { portalSet = {} } = props;
    let { portalSetModel = {}, epDiscussWorkFlow = {} } = portalSet;
    setPortalSetModel(portalSetModel);
    setEpDiscussWorkFlow(epDiscussWorkFlow);
  }, [props]);

  useEffect(() => {
    let { portalSetModel = {} } = portalSet;
    const { noticeScope = {} } = portalSetModel;
    setAllowType(portalSetModel.allowUserType || 3);
    setNotify(noticeScope.admin || false);
    setExAccountSmsNotice(noticeScope.exAccountSmsNotice || false);
    setcustomizeName(portalSetModel.customizeName);
    let _controls = (portal.controls || [])
      .filter(
        l =>
          (!l.controlId.includes('_') || ['portal_mobile', 'portal_email', 'portal_role'].includes(l.controlId)) &&
          ![29].includes(l.type),
      )
      .map(l => ({
        label: l.controlName,
        value: l.controlId,
      }));
    setBusinessCardOption(_controls);
    setExternalControls((portalSetModel.externalControls || []).filter(l => _controls.find(m => m.value === l)));
    setInternalControls((portalSetModel.internalControls || []).filter(l => _controls.find(m => m.value === l)));
  }, [_.get(props, ['portalSet', 'portalSetModel'])]);

  useEffect(() => {
    if (_.get(props, ['portalSet', 'portalSetModel', 'loginMode', 'weChat']) && !isWXExist && !authorizerInfo.appId) {
      AppManagement.getWeiXinBindingInfo({ appId: props.appId }).then(res => {
        setIsWXExist(res && res.length > 0);
        setAuthorizerInfo(res && res.length > 0 ? res[0] : {});
        setCommonState({ loading: false });
        onChangePortalSet(
          {
            authorizerInfo: {
              ...authorizerInfo,
              ...(res && res.length > 0 ? res[0] : {}),
            },
          },
          false,
        );
      });
    } else {
      setCommonState({ loading: false });
    }
  }, [_.get(props, ['portalSet', 'portalSetModel', 'loginMode', 'weChat'])]);

  const changeMode = (checked, oKey, key, WAY, cb) => {
    const { portalSet = {} } = props;
    const { portalSetModel = {} } = portalSet;
    let num = 0;
    WAY.map(it => {
      if (it.key === oKey) {
        if ((portalSetModel[key] || {})[it.key]) {
          num = num + 1;
        }
      } else {
        if (!(portalSetModel[key] || {})[it.key]) {
          num = num + 1;
        }
      }
    });
    onChangePortalSet({
      portalSetModel: {
        ...portalSetModel,
        [key]: {
          ...(portalSetModel[key] || {}),
          [oKey]: num >= WAY.length ? !checked : checked,
        },
      },
    });
    if (num >= WAY.length) {
      cb();
    }
  };
  //微信登录方式受开关hideWeixin控制
  const LOGIN_WAY_LIST = LOGIN_WAY.filter(o => o.key !== 'weChat' || !md.global.SysSettings.hideWeixin);

  return (
    <Wrap>
      <div className="content">
        <h6 className="Font16 Gray Bold mBottom0">{_l('门户名称')}</h6>
        <input
          type="text"
          className="pageTitle mTop6"
          placeholder={_l('请输入')}
          value={customizeName}
          onFocus={() => {}}
          onBlur={e => {
            const { portalSet = {} } = props;
            const { portalSetModel = {} } = portalSet;
            onChangePortalSet({
              portalSetModel: {
                ...portalSetModel,
                customizeName: e.target.value, //允许输入空格
              },
            });
            if (!e.target.value) {
              return alert(_l('请输入门户名称'), 3);
            }
          }}
          onChange={e => {
            setcustomizeName(e.target.value);
          }}
        />
        <h6 className={cx('Font16 Gray Bold mBottom0 mTop24', { mTop24: isFrontDomain })}>{_l('注册方式')}</h6>
        <div className="">
          {REJISTER_WAY.map(o => {
            const { portalSet = {} } = props;
            const { portalSetModel = {} } = portalSet;
            const { registerMode = {} } = portalSetModel;
            return (
              <Checkbox
                className="mTop16 InlineBlock mRight60 setCheckbox"
                text={o.txt}
                checked={registerMode[o.key]}
                onClick={() => {
                  if (registerMode[o.key]) {
                    alert(_l('取消手机号/邮箱注册后，外部用户将不能使用原账号登录，请您谨慎配置'), 3);
                  }
                  changeMode(!registerMode[o.key], o.key, 'registerMode', REJISTER_WAY, () => {
                    alert(_l('至少选择一种注册方式'), 3);
                  });
                }}
              />
            );
          })}
        </div>
        <h6 className={cx('Font16 Gray Bold mBottom0 mTop24', { mTop24: isFrontDomain })}>{_l('登录方式')}</h6>
        <div className="">
          {LOGIN_WAY_LIST.map(o => {
            const { portalSet = {} } = props;
            const { portalSetModel = {} } = portalSet;
            const { loginMode = {} } = portalSetModel;
            return (
              <Checkbox
                className="mTop16 InlineBlock mRight60 setCheckbox"
                text={o.txt}
                checked={loginMode[o.key]}
                onClick={() => {
                  changeMode(!loginMode[o.key], o.key, 'loginMode', LOGIN_WAY_LIST, () => {
                    alert(_l('至少选择一种登录方式'), 3);
                  });
                }}
              />
            );
          })}
          {!md.global.SysSettings.hideWeixin && (
            <>
              <br />
              {_.get(props, ['portalSet', 'portalSetModel', 'loginMode', 'weChat']) && !loading && (
                <div className={cx('Gray_9e mTop4 InlineBlock', { noWX: !isWXExist, WX: !!isWXExist })}>
                  {!isWXExist ? (
                    <React.Fragment>
                      {_l('暂未绑定服务号，请前往')}
                      <a
                        className="Hand mLeft5 mRight5 InlineBlock"
                        href={`/admin/weixin/${projectId}`}
                        target="_blank"
                      >
                        {_l('组织管理')}
                      </a>
                      {_l('添加微信服务号')}
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      {_l('官方认证服务号')}
                      <a className="mLeft5">{authorizerInfo.nickName}</a>
                    </React.Fragment>
                  )}
                </div>
              )}
              <p className="Font12 Gray_9e mTop4 LineHeight18">
                <PriceTip
                  text={_l(
                    '只勾选微信登录时首次扫码后需要输入手机号与微信绑定，后续可单独微信扫码快速登录。发送验证码的短信或邮件费用将自动从组织信用点中扣除。',
                  )}
                />
              </p>
            </>
          )}
        </div>
        <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('允许访问的用户')}</h6>
        <div className="mTop16">
          {ALLOW_TYPE.map((o, i) => {
            return (
              <Radio
                className=""
                text={o}
                checked={allowUserType === (i + 1) * 3}
                onClick={() => {
                  const { portalSet = {} } = props;
                  const { portalSetModel = {} } = portalSet;
                  onChangePortalSet({
                    portalSetModel: {
                      ...portalSetModel,
                      allowUserType: (i + 1) * 3,
                    },
                  });
                }}
              />
            );
          })}
        </div>
        <LoginSet {...props} portalSetModel={portalSetModel} />
        <BasicSet {...props} portalSetModel={portalSetModel} />
        <NoticeSet
          {...props}
          portalSetModel={portalSetModel}
          admin={admin}
          exAccountSmsNotice={exAccountSmsNotice}
          epDiscussWorkFlow={epDiscussWorkFlow}
        />
        <CardSet
          {...props}
          portalSetModel={portalSetModel}
          businessCardOption={businessCardOption}
          externalControls={externalControls}
          internalControls={internalControls}
        />
      </div>
    </Wrap>
  );
}
