import React, { useState, useEffect } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Icon, Radio, Checkbox, Tooltip, Dialog } from 'ming-ui';
import cx from 'classnames';
import { createEPDiscussWorkFlow } from 'src/api/externalPortal';
import { getWeiXinBindingInfo } from 'src/api/project';
import EditAgreementOrPrivacy from 'src/pages/Roles/Portal/components/EditAgreementOrPrivacy';
// import process from 'src/pages/workflow/api/process';
import WorkflowDialog from 'src/pages/workflow/components/WorkflowDialog';

const Wrap = styled.div`
  position: relative;
  height: calc(100% - 100px);
  overflow: hidden;
  .content {
    padding: 24px;
    height: calc(100% - 68px);
    overflow: auto;
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
    padding: 16px 18px;
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
const LOGIN_WAY = [_l('手机号'), _l('微信')];
const DIS_SET = [_l('可见全部讨论'), _l('不可见内部讨论')];
const ALLOW_TYPE = [_l('任何人'), _l('通过审核的用户'), _l('仅定向邀请的用户')]; //3,6,9
let ajaxRequest = null;
export default function BaseSet(props) {
  let { portalSet = {}, onChangePortalSet, projectId, appId } = props;
  const [portalSetModel, setPortalSetModel] = useState({});
  // let { urlConfigure = {}, appId } = props;
  // let { portalSetModel = {} } = portalSet;
  const { loginMode = {}, noticeScope = {}, isFrontDomain } = portalSetModel; //isFrontDomain是否为前置域名
  // const { protocol = '', officialDomain = '' } = urlConfigure;
  const [epDiscussWorkFlow, setEpDiscussWorkFlow] = useState(portalSet.epDiscussWorkFlow || {});
  const [isWXExist, setIsWXExist] = useState(portalSet.isWXExist);
  // const [domainName, setUrl] = useState(portalSetModel.domainName || '');
  const [weChat, setLoginWay] = useState(loginMode.weChat); //微信是否开启
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
  useEffect(
    () => {
      let { portalSet = {} } = props;
      let { portalSetModel = {}, epDiscussWorkFlow = {} } = portalSet;
      setPortalSetModel(portalSetModel);
      setEpDiscussWorkFlow(epDiscussWorkFlow);
    },
    [props],
  );

  useEffect(
    () => {
      let { portalSetModel = {} } = portalSet;
      const { loginMode = {}, noticeScope = {} } = portalSetModel;
      // setIsWXExist(portalSet.isWXExist);
      // setUrl(portalSetModel.domainName || '');
      setLoginWay(loginMode.weChat);
      setAllowType(portalSetModel.allowUserType || 3);
      setNotify(noticeScope.admin || false);
      setExAccountSmsNotice(noticeScope.exAccountSmsNotice || false);
      setcustomizeName(portalSetModel.customizeName);
    },
    [portalSet.portalSetModel],
  );

  useEffect(
    () => {
      if (weChat && !isWXExist && !authorizerInfo.appId) {
        getWeiXinBindingInfo({ projectId: projectId }).then(res => {
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
    },
    [weChat],
  );
  const createWorkFlow = callback => {
    if (ajaxRequest) {
      ajaxRequest.abort();
    }
    ajaxRequest = createEPDiscussWorkFlow({
      appId,
    });
    ajaxRequest.then(res => {
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
  return (
    <Wrap>
      <div className="content">
        {/* {isFrontDomain && (
          <React.Fragment>
            <h6 className="Font16 Gray Bold mBottom0">
              {_l('自定义域名')}
              <Tooltip
                popupPlacement="bottom"
                text={
                  <span>
                    {_l('可以将链接放在微信公众号的自定义菜单与自动回复内，方便微信用户关注公众号后随时打开此链接')}
                  </span>
                }
              >
                <Icon icon="help" className="Gray_9e mLeft5 Font14" />
              </Tooltip>
            </h6>
            <div className="mTop6">
              <React.Fragment>
                <span className="urlH InlineBlock Gray_9e">{protocol}</span>
                <input
                  type="text"
                  className="domainName InlineBlock"
                  placeholder={_l('请输入')}
                  value={domainName}
                  onFocus={() => {}}
                  onBlur={e => {
                    validateDomianName({
                      domainName,
                      appId,
                    }).then(res => {
                      if (!res.success) {
                        onChangePortalSet({
                          portalSetModel: { ...portalSetModel, domainName: '' },
                        });
                        alert(message, 2);
                      }
                    });
                  }}
                  onChange={e => {
                    onChangePortalSet({
                      portalSetModel: { ...portalSetModel, domainName: e.target.value.trim() },
                    });
                  }}
                />
                <span className="urlEnd InlineBlock Gray_9e">{officialDomain}</span>
              </React.Fragment>
            </div>
          </React.Fragment>
        )} */}
        <h6 className="Font16 Gray Bold mBottom0">{_l('门户名称')}</h6>
        <input
          type="text"
          className="pageTitle mTop6"
          placeholder={_l('请输入')}
          value={customizeName}
          onFocus={() => {}}
          onBlur={e => {
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
        <h6 className={cx('Font16 Gray Bold mBottom0 mTop16', { mTop24: isFrontDomain })}>{_l('登录方式')}</h6>
        <div className="">
          {LOGIN_WAY.map((o, i) => {
            return (
              <Checkbox
                className="mTop15 InlineBlock mRight60"
                text={o}
                disabled={i === 0 && md.global.Config.IsLocal}
                checked={(i === 0 && (_.get(loginMode, ['phone']) || md.global.Config.IsLocal)) || (i === 1 && weChat)}
                onClick={checked => {
                  let params = {};
                  if (i === 0 && !md.global.Config.IsLocal) {
                    if (!!_.get(loginMode, ['phone']) && !weChat) {
                      return alert(_l('至少选择一种登录方式'));
                    }
                    params = {
                      phone: !_.get(loginMode, ['phone']),
                    };
                  } else if (i === 1) {
                    if (!_.get(loginMode, ['phone']) && !!weChat) {
                      return alert(_l('至少选择一种登录方式'));
                    }
                    params = {
                      weChat: !weChat,
                    };
                  }
                  onChangePortalSet({
                    portalSetModel: {
                      ...portalSetModel,
                      loginMode: {
                        ...loginMode,
                        ...params,
                      },
                    },
                  });
                }}
              />
            );
          })}
          <br />
          {weChat && !loading && (
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
          <p className="Font12 Gray_9e mTop4">
            {/*_l('只勾选微信登录后首次扫码后需要输入手机号与微信绑定，后续可单独微信扫码快速登录。')*/}
            <br />
            {/*_l('验证码每条0.05元，自动从企业账户余额扣费。为保证业务不受影响，请保持企业账户余额充足。')*/}
          </p>
        </div>
        <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('允许访问的用户')}</h6>
        <div className="mTop18">
          {ALLOW_TYPE.map((o, i) => {
            return (
              <Radio
                className=""
                text={o}
                checked={allowUserType === (i + 1) * 3}
                onClick={() => {
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
        <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('功能设置')}</h6>
        <div className="mTop16">
          <SwitchStyle>
            <Icon
              icon={!!portalSetModel.allowExAccountDiscuss ? 'ic_toggle_on' : 'ic_toggle_off'}
              className="Font32 Hand"
              onClick={() => {
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
            <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">
              {_l('允许外部用户对记录讨论')}
              {portalSetModel.allowExAccountDiscuss && (
                <Tooltip
                  text={<span className="Block">{_l('记录讨论的使用范围继承设置：工作表-功能开关-讨论范围设置')}</span>}
                >
                  <i className="icon-help Hand Font16 Gray_9e mLeft3" />
                </Tooltip>
              )}
            </div>
          </SwitchStyle>
          <div style={{ 'margin-left': '36px' }}>
            {!portalSetModel.allowExAccountDiscuss ? (
              <p className="mLeft8 LineHeight24 Gray_9e">
                {_l('记录讨论的使用范围继承设置工作表-功能开关-讨论范围设置')}
              </p>
            ) : (
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
        <div className="mTop16">
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
            <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">{_l('用户协议和隐私条款')}</div>
          </SwitchStyle>
          <div style={{ 'margin-left': '44px' }}>
            {!!portalSetModel.termsAndAgreementEnable ? (
              <React.Fragment>
                <p className="Gray_9e mTop6 LineHeight24 mBottom8">
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
            ) : (
              <p className="Gray_9e mLeft8 LineHeight24">
                {_l(
                  '根据工信部等相关部门要求，用户在注册、登录网站时需要提供相应的协议及隐私政策内容告知用户同意后才可以注册',
                )}
              </p>
            )}
          </div>
        </div>
        <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('通知设置')}</h6>
        <div className="mTop16">
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
        <div className="mTop16">
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
        <div className="mTop16">
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
