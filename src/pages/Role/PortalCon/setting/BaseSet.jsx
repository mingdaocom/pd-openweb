import React, { useState, useEffect } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Icon, Radio, Checkbox, Tooltip, Dialog } from 'ming-ui';
import cx from 'classnames';
import externalPortalAjax from 'src/api/externalPortal';
import AppManagement from 'src/api/appManagement';
import EditAgreementOrPrivacy from 'src/pages/Role/PortalCon/components/EditAgreementOrPrivacy';
import WorkflowDialog from 'src/pages/workflow/components/WorkflowDialog';
import { LOGIN_WAY, REJISTER_WAY } from 'src/pages/Role/config.js';
import _ from 'lodash';
import locale from 'antd/es/date-picker/locale/zh_CN';
import { DatePicker, Select } from 'antd';
import moment from 'moment';

const Wrap = styled.div`
  position: relative;
  height: calc(100% - 100px);
  overflow: hidden;
  .setCheckbox {
    width: 130px;
  }
  .content {
    padding: 24px;
    height: calc(100% - 68px);
    overflow: auto;
  }
  .LineHeight18 {
    line-height: 18px;
  }
  .pageTitle {
    width: 592px;
    height: 36px;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 3px;
    padding: 0 14px;
    &:hover {
      border: 1px solid #bdbdbd;
    }
    &:focus {
      border: 1px solid #2196f3;
    }
  }
  .urlH,
  .urlEnd {
    padding: 0 20px;
    height: 36px;
    background: #f5f5f5;
    border-radius: 3px 0px 0px 3px;
    line-height: 36px;
    box-sizing: border-box;
    vertical-align: middle;
    &.url {
      border-radius: 3px;
    }
  }
  .urlEnd {
    border-radius: 0px 3px 3px 0px;
  }
  input.domainName {
    width: 200px;
    height: 36px;
    padding: 0 12px;
    line-height: 36px;
    background: #ffffff;
    border-top: 1px solid #f5f5f5;
    border-bottom: 1px solid #f5f5f5;
    box-sizing: border-box;
    vertical-align: middle;
    border-left: 0;
    border-right: 0;
  }
  .noWX,
  .WX {
    min-width: 299px;
    padding: 10px 16px;
    background: #f8f8f8;
    border-radius: 6px;
    a {
      color: #2196f3;
    }
    &.WX {
      a {
        color: green;
      }
    }
  }
  .exAccountSendCon {
    width: 100%;
    height: 36px;
    background: #f5f5f5;
    border-radius: 3px;
    border: 1px solid #dddddd;
    padding: 0 16px;
    line-height: 36px;
    .editFlow {
      color: #2196f3;
    }
  }
  .rangePicker {
    width: 420px;
    margin-left: 44px;
    border: 1px solid #ddd;
    border-radius: 3px;
  }
  .cardSelect {
    font-size: 12px !important;
    .ant-select-selection-item-remove:hover {
      color: #2196f3 !important;
    }
  }
`;
export const SwitchStyle = styled.div`
  display: inline-block;
  .switchText {
    line-height: 24px;
  }
  .icon {
    vertical-align: middle;
    &-ic_toggle_on {
      color: #00c345;
    }
    &-ic_toggle_off {
      color: #bdbdbd;
    }
  }
`;

const DIS_SET = [_l('可见全部讨论'), _l('不可见内部讨论')];
const ALLOW_TYPE = [_l('任何人'), _l('通过审核的用户'), _l('仅定向邀请的用户')]; //3,6,9
let ajaxRequest = null;
export default function BaseSet(props) {
  let { portalSet = {}, onChangePortalSet, projectId, appId, portal = {} } = props;
  const [portalSetModel, setPortalSetModel] = useState({});
  const { noticeScope = {}, isFrontDomain } = portalSetModel; //isFrontDomain是否为前置域名
  const [epDiscussWorkFlow, setEpDiscussWorkFlow] = useState(portalSet.epDiscussWorkFlow || {});
  const [isWXExist, setIsWXExist] = useState(portalSet.isWXExist);
  const [allowUserType, setAllowType] = useState(portalSetModel.allowUserType || 3); //允许的用户
  const [admin, setNotify] = useState(noticeScope.admin || false); //允许的用户
  const [exAccountSmsNotice, setExAccountSmsNotice] = useState(noticeScope.exAccountSmsNotice || false); //审核结果短信通知外部用户
  const [authorizerInfo, setAuthorizerInfo] = useState(portalSet.authorizerInfo || {});
  const [customizeName, setcustomizeName] = useState(portalSetModel.customizeName);
  const [{ type, show, showWorkflowDialog, loading }, setCommonState] = useSetState({
    loading: true,
    type: null,
    show: false,
    showWorkflowDialog: false,
  });
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
      .filter(l => !l.controlId.includes('_') || ['portal_mobile', 'portal_email', 'portal_role'].includes(l.controlId))
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

  const createWorkFlow = callback => {
    if (ajaxRequest) {
      ajaxRequest.abort();
    }
    ajaxRequest = externalPortalAjax.createEPDiscussWorkFlow({
      appId,
    });
    ajaxRequest.then(res => {
      const { portalSet = {} } = props;
      const { portalSetModel = {} } = portalSet;
      const { noticeScope = {} } = portalSetModel;
      onChangePortalSet({
        portalSetModel: {
          ...portalSetModel,
          noticeScope: { ...noticeScope, discussionNotice: true },
        },
        epDiscussWorkFlow: res,
      });
      callback && callback(res);
    });
  };
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

  const renderSelectOptions = () => {
    return (
      <React.Fragment>
        {businessCardOption
          .filter(l => l.value.includes('_'))
          .map(item => (
            <Select.Option value={item.value} label={item.label}>
              {item.label}
            </Select.Option>
          ))}
        {businessCardOption
          .filter(l => !l.value.includes('_'))
          .map((item, i) => (
            <Select.Option value={item.value} label={item.label} className={cx({ BorderTopGrayC: i === 0 })}>
              {item.label}
            </Select.Option>
          ))}
      </React.Fragment>
    );
  };
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
                onClick={checked => {
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
          {LOGIN_WAY.map((o, i) => {
            const { portalSet = {} } = props;
            const { portalSetModel = {} } = portalSet;
            const { loginMode = {} } = portalSetModel;

            if (o.key === 'weChat' && md.global.SysSettings.hideWeixin) return;

            return (
              <Checkbox
                className="mTop16 InlineBlock mRight60 setCheckbox"
                text={o.txt}
                checked={loginMode[o.key]}
                onClick={checked => {
                  changeMode(!loginMode[o.key], o.key, 'loginMode', LOGIN_WAY, () => {
                    alert(_l('至少选择一种登录方式'), 3);
                  });
                }}
              />
            );
          })}
          <br />
          {_.get(props, ['portalSet', 'portalSetModel', 'loginMode', 'weChat']) && !loading && (
            <div className={cx(' Gray_9e mTop4 InlineBlock', { noWX: !isWXExist, WX: !!isWXExist })}>
              {!isWXExist ? (
                <React.Fragment>
                  {_l('暂未绑定公众号，请前往')}
                  <a className="Hand mLeft5 mRight5 InlineBlock" href={`/admin/weixin/${projectId}`} target="_blank">
                    {_l('组织管理')}
                  </a>
                  {_l('添加微信公众账号')}
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
            {!_.get(props, ['portalSet', 'portalSetModel', 'loginMode', 'weChat']) &&
              !md.global.SysSettings.hideWeixin && (
                <span>
                  {_l('只勾选微信登录后首次扫码后需要输入手机号与微信绑定，后续可单独微信扫码快速登录。')}
                  <br />
                </span>
              )}
              
            {(!_.get(md, 'global.Config.IsLocal') || _.get(md, 'global.Config.IsPlatformLocal')) && _l('验证码每条%0，将自动从企业账户扣除。', _.get(md, 'global.PriceConfig.SmsPrice'))}
          </p>
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
        <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('登录设置')}</h6>
        <div className="mTop12">
          <SwitchStyle>
            <Icon
              icon={!!portalSetModel.termsAndAgreementEnable ? 'ic_toggle_on' : 'ic_toggle_off'}
              className="Font32 Hand TxtBottom"
              onClick={() => {
                onChangePortalSet({
                  portalSetModel: {
                    ...portalSetModel,
                    termsAndAgreementEnable: !portalSetModel.termsAndAgreementEnable,
                  },
                });
              }}
            />
            <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">
              {_l('登录时需同意用户协议和隐私条款')}
            </div>
          </SwitchStyle>
          <div style={{ 'margin-left': '44px' }}>
            {!!portalSetModel.termsAndAgreementEnable && (
              <React.Fragment>
                <p className="Gray_9e LineHeight18 mBottom8">
                  {_l(
                    '平台已预置了通用协议内容（无公司主体），因各门户的具体业务不同收集的用户信息不同，请您务必根据公司实际业务重新上传符合规定的协议内容',
                  )}
                </p>
                <div className="bold mTop6 LineHeight24">
                  {_l('设置')}
                  <span
                    className="ThemeColor3 Hand mRight10 mLeft10"
                    onClick={() => {
                      setCommonState({ type: 0, show: true });
                    }}
                  >
                    {_l('用户协议')}
                  </span>
                  {_l('和')}
                  <span
                    className="ThemeColor3 Hand mLeft10"
                    onClick={() => {
                      setCommonState({ type: 1, show: true });
                    }}
                  >
                    {_l('隐私政策')}
                  </span>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
        {/* 私有部署根据系统配置提供是否需要关注公众号的配置 */}
        {!md.global.SysSettings.hideWeixin && (
          <div className="mTop5">
            <SwitchStyle>
              <Icon
                icon={!!portalSetModel.subscribeWXOfficial ? 'ic_toggle_on' : 'ic_toggle_off'}
                className="Font32 Hand"
                onClick={() => {
                  let data = {
                    subscribeWXOfficial: !portalSetModel.subscribeWXOfficial,
                  };
                  onChangePortalSet({
                    portalSetModel: {
                      ...portalSetModel,
                      ...data,
                    },
                  });
                }}
              />
              <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">
                {_l('通过微信扫码登录时，需先关注公众号')}
              </div>
            </SwitchStyle>
          </div>
        )}
        <div className="mTop5">
          <SwitchStyle>
            <Icon
              icon={!!_.get(portalSetModel, 'registerInfo.enable') ? 'ic_toggle_on' : 'ic_toggle_off'}
              className="Font32 Hand"
              onClick={() => {
                let registerInfo = {
                  ..._.get(portalSetModel, 'registerInfo'),
                  enable: !_.get(portalSetModel, 'registerInfo.enable'),
                };
                onChangePortalSet({
                  portalSetModel: {
                    ...portalSetModel,
                    registerInfo,
                  },
                });
              }}
            />
            <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">
              {_l('外部用户注册开始/停止时间')}
            </div>
          </SwitchStyle>
          {_.get(portalSetModel, 'registerInfo.enable') && (
            <div className="rangePicker flexRow alignItemsCenter">
              <DatePicker
                showTime={true}
                className={'flex Hand'}
                locale={locale}
                bordered={false}
                placeholder={_l('开始时间')}
                value={
                  !_.get(portalSetModel, 'registerInfo.startTime') ||
                  _.get(portalSetModel, 'registerInfo.startTime').substr(0, 4) === '0001'
                    ? null
                    : moment(_.get(portalSetModel, 'registerInfo.startTime'))
                }
                onChange={date => {
                  if (
                    !!_.get(portalSetModel, 'registerInfo.endTime') &&
                    moment(_.get(portalSetModel, 'registerInfo.endTime')).isBefore(date)
                  ) {
                    return alert(_l('结束时间不能早于开始时间'), 3);
                  }
                  let registerInfo = {
                    ..._.get(portalSetModel, 'registerInfo'),
                    startTime: date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '',
                  };
                  onChangePortalSet({
                    portalSetModel: {
                      ...portalSetModel,
                      registerInfo,
                    },
                  });
                }}
              />
              <span className="pLeft5 pRight5 Gray_d">—</span>
              <DatePicker
                showTime={true}
                locale={locale}
                className={'flex Hand'}
                bordered={false}
                placeholder={_l('结束时间')}
                value={
                  !_.get(portalSetModel, 'registerInfo.endTime') ||
                  _.get(portalSetModel, 'registerInfo.endTime').substr(0, 4) === '0001'
                    ? null
                    : moment(_.get(portalSetModel, 'registerInfo.endTime'))
                }
                onChange={date => {
                  if (
                    !!_.get(portalSetModel, 'registerInfo.startTime') &&
                    moment(date).isBefore(_.get(portalSetModel, 'registerInfo.startTime'))
                  ) {
                    return alert(_l('结束时间不能早于开始时间'), 3);
                  }
                  let registerInfo = {
                    ..._.get(portalSetModel, 'registerInfo'),
                    endTime: date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '',
                  };
                  onChangePortalSet({
                    portalSetModel: {
                      ...portalSetModel,
                      registerInfo,
                    },
                  });
                }}
              />
            </div>
          )}
        </div>
        <div className="mTop5">
          <SwitchStyle>
            <Icon
              icon={!!portalSetModel.twoAuthenticationEnabled ? 'ic_toggle_on' : 'ic_toggle_off'}
              className="Font32 Hand"
              onClick={() => {
                let data = {
                  twoAuthenticationEnabled: !portalSetModel.twoAuthenticationEnabled,
                };
                onChangePortalSet({
                  portalSetModel: {
                    ...portalSetModel,
                    ...data,
                  },
                });
              }}
            />
            <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">{_l('两步验证')}</div>
          </SwitchStyle>
          {portalSetModel.twoAuthenticationEnabled && (
            <div style={{ 'margin-left': '44px' }} className="Gray_9e">
              {_l('外部用户通过账号密码或微信扫码登录后，需要额外进行验证码验证，验证通过后才能成功登录')}
            </div>
          )}
        </div>
        <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('功能设置')}</h6>
        <div className="mTop12">
          <SwitchStyle>
            <Icon
              icon={!!portalSetModel.allowExAccountDiscuss ? 'ic_toggle_on' : 'ic_toggle_off'}
              className="Font32 Hand"
              onClick={() => {
                const { portalSet = {} } = props;
                const { portalSetModel = {} } = portalSet;
                let data = {
                  allowExAccountDiscuss: !portalSetModel.allowExAccountDiscuss,
                };
                if (portalSetModel.allowExAccountDiscuss) {
                  //关闭外部门户讨论，同时关闭外部门户的消息通知
                  data = {
                    ...data,
                    noticeScope: { ...noticeScope, discussionNotice: false },
                  };
                }
                onChangePortalSet({
                  portalSetModel: {
                    ...portalSetModel,
                    ...data,
                  },
                });
              }}
            />
            <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">{_l('允许参与记录讨论')}</div>
          </SwitchStyle>
          <div style={{ 'margin-left': '36px' }}>
            {portalSetModel.allowExAccountDiscuss && (
              <React.Fragment>
                <div className="mTop8 mLeft8">
                  {DIS_SET.map((o, i) => {
                    return (
                      <div className="">
                        <Radio
                          className=""
                          text={o}
                          checked={portalSetModel.exAccountDiscussEnum === i}
                          onClick={() => {
                            const { portalSet = {} } = props;
                            const { portalSetModel = {} } = portalSet;
                            if (portalSetModel.exAccountDiscussEnum === i) {
                              return;
                            }
                            Dialog.confirm({
                              title:
                                portalSetModel.exAccountDiscussEnum === 0
                                  ? _l('确定切换为不可见内部讨论？')
                                  : _l('确定切换为可见全部讨论？'),
                              width: 480,
                              description:
                                portalSetModel.exAccountDiscussEnum === 0 ? (
                                  <div className="Font13">
                                    <div>
                                      1、
                                      {_l(
                                        '切换后，已有的外部讨论内容全部归为内部讨论，外部用户对其不可查看且不能回复；',
                                      )}
                                    </div>
                                    <div>
                                      2、
                                      {_l(
                                        '切换后，应用成员回复已有讨论，回复内容归属于内部讨论，外部用户不可查看且不能回复',
                                      )}
                                    </div>
                                    <div>
                                      3、
                                      {_l('切换后，讨论分为两个讨论区域，外部用户只能参与外部讨论')}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="Font13">
                                    <div>
                                      {_l('切换后，外部和内部两个讨论共用一个讨论区，已有的外部和内部讨论内容归在一起')}
                                    </div>
                                  </div>
                                ),
                              onOk: () => {
                                const { portalSet = {} } = props;
                                const { portalSetModel = {} } = portalSet;
                                onChangePortalSet({
                                  portalSetModel: {
                                    ...portalSetModel,
                                    exAccountDiscussEnum: i,
                                  },
                                });
                              },
                            });
                          }}
                        />
                        <p className="Gray_9e mTop6 mLeft30">
                          {i === 0
                            ? _l('外部用户与成员共用一个讨论区域，可见全部讨论内容')
                            : _l('分为内部和外部两个讨论区，外部用户不可见内部讨论区')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
        <div className="mTop5">
          <SwitchStyle>
            <Icon
              icon={!!portalSetModel.approved ? 'ic_toggle_on' : 'ic_toggle_off'}
              className="Font32 Hand"
              onClick={() => {
                onChangePortalSet({
                  portalSetModel: {
                    ...portalSetModel,
                    approved: !portalSetModel.approved,
                  },
                });
              }}
            />
            <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">{_l('允许查看审批流转详情')}</div>
          </SwitchStyle>
        </div>
        <div className="mTop5">
          <SwitchStyle>
            <Icon
              icon={!!portalSetModel.watermark && portalSetModel.watermark !== 0 ? 'ic_toggle_on' : 'ic_toggle_off'}
              className="Font32 Hand"
              onClick={() => {
                onChangePortalSet({
                  portalSetModel: {
                    ...portalSetModel,
                    watermark: portalSetModel.watermark === 1 ? 0 : 1,
                  },
                });
              }}
            />
            <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">{_l('水印设置')}</div>
          </SwitchStyle>
          {portalSetModel.watermark === 1 && (
            <div style={{ 'margin-left': '44px' }} className="Gray_9e">
              {_l('启用水印配置后，将在外部门户内显示当前使用者的姓名+手机号后4位或邮箱前缀')}
            </div>
          )}
        </div>
        <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('通知设置')}</h6>
        <div className="mTop12">
          <SwitchStyle>
            <Icon
              icon={!!admin ? 'ic_toggle_on' : 'ic_toggle_off'}
              className="Font32 Hand"
              onClick={() => {
                onChangePortalSet({
                  portalSetModel: {
                    ...portalSetModel,
                    noticeScope: { ...noticeScope, admin: !admin },
                  },
                });
              }}
            />
            <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">
              {_l('新用户注册、激活时通知管理员')}
            </div>
          </SwitchStyle>
        </div>
        <div className="mTop5">
          <SwitchStyle>
            <Icon
              icon={!!exAccountSmsNotice ? 'ic_toggle_on' : 'ic_toggle_off'}
              className="Font32 Hand"
              onClick={() => {
                onChangePortalSet({
                  portalSetModel: {
                    ...portalSetModel,
                    noticeScope: { ...noticeScope, exAccountSmsNotice: !exAccountSmsNotice },
                  },
                });
              }}
            />
            <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">
              {_l('审核结果短信通知外部用户')}
            </div>
          </SwitchStyle>
        </div>
        <div className="mTop5">
          <SwitchStyle>
            <Icon
              icon={!!noticeScope.discussionNotice ? 'ic_toggle_on' : 'ic_toggle_off'}
              className="Font32 Hand"
              onClick={() => {
                //开启
                if (!noticeScope.discussionNotice && !epDiscussWorkFlow.workFlowId) {
                  createWorkFlow();
                } else {
                  onChangePortalSet({
                    portalSetModel: {
                      ...portalSetModel,
                      noticeScope: { ...noticeScope, discussionNotice: !noticeScope.discussionNotice },
                    },
                  });
                }
              }}
            />
            <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">
              {_l('有讨论消息时（被提到、被回复）通知外部用户')}
            </div>
          </SwitchStyle>
        </div>
        {noticeScope.discussionNotice && (
          <div className="exAccountSendCon flexRow">
            {epDiscussWorkFlow.workFlowName && (
              <span className="flex">
                {epDiscussWorkFlow.workFlowName}
                {!epDiscussWorkFlow.isEnable && <span className="Font13 mLeft5 Red">{_l('未启用')}</span>}
              </span>
            )}
            <span
              className="ThemHoverColor3 editFlow Hand"
              onClick={() => {
                if (!epDiscussWorkFlow.workFlowId) {
                  createWorkFlow(() => {
                    setCommonState({ showWorkflowDialog: true });
                  });
                } else {
                  setCommonState({ showWorkflowDialog: true });
                }
              }}
            >
              {_l('编辑工作流')}
            </span>
          </div>
        )}
        <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('名片配置')}</h6>
        <p className="Font12 Gray_9e mTop4 LineHeight18">{_l('设置外部用户的名片层中可以被其他人查看到的信息')}</p>
        <div className="mTop12 mBottom6">{_l('组织成员查看')}</div>
        <Select
          mode="multiple"
          className="cardSelect"
          allowClear
          style={{ width: '100%' }}
          placeholder={_l('请选择')}
          value={internalControls}
          optionLabelProp="label"
          onChange={value => {
            if (value.length > 6) {
              alert('最多支持显示6个字段');
              return;
            }
            onChangePortalSet({
              portalSetModel: {
                ...portalSetModel,
                internalControls: value,
              },
            });
          }}
        >
          {renderSelectOptions()}
        </Select>
        <div className="mTop12 mBottom6">{_l('外部用户查看')}</div>
        <Select
          mode="multiple"
          className="cardSelect"
          allowClear
          style={{ width: '100%' }}
          placeholder={_l('请选择')}
          value={externalControls}
          optionLabelProp="label"
          onChange={value => {
            if (value.length > 6) {
              alert('最多支持显示6个字段');
              return;
            }
            onChangePortalSet({
              portalSetModel: {
                ...portalSetModel,
                externalControls: value,
              },
            });
          }}
        >
          {renderSelectOptions()}
        </Select>
      </div>
      {showWorkflowDialog && (
        <WorkflowDialog
          flowId={epDiscussWorkFlow.workFlowId}
          onBack={value => {
            setCommonState({ showWorkflowDialog: false });
            onChangePortalSet({
              epDiscussWorkFlow: { ...epDiscussWorkFlow, isEnable: value },
            });
          }}
        />
      )}
      {show && (
        <EditAgreementOrPrivacy
          show={show}
          type={type}
          data={type === 1 ? portalSetModel.privacyTerms : portalSetModel.userAgreement}
          setShow={() => {
            setCommonState({ type: null, show: false });
          }}
          onChange={data => {
            let da = type === 1 ? { privacyTerms: data } : { userAgreement: data };
            onChangePortalSet({
              portalSetModel: {
                ...portalSetModel,
                ...da,
              },
            });
          }}
        />
      )}
    </Wrap>
  );
}
