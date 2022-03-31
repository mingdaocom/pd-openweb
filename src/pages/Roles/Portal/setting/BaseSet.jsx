import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Icon, Radio, Checkbox, Tooltip } from 'ming-ui';
import cx from 'classnames';
// import { validateDomianName } from 'src/api/externalPortal';
import { getWeiXinBindingInfo } from 'src/api/project';

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
const ALLOW_TYPE = [_l('任何人'), _l('通过审核的用户'), _l('仅定向邀请的用户')]; //3,6,9
export default function BaseSet(props) {
  let { portalSet = {}, onChangePortalSet, projectId } = props;
  const [portalSetModel, setPortalSetModel] = useState({});
  // let { urlConfigure = {}, appId } = props;
  // let { portalSetModel = {} } = portalSet;
  const { loginMode = {}, noticeScope = {}, isFrontDomain } = portalSetModel; //isFrontDomain是否为前置域名
  // const { protocol = '', officialDomain = '' } = urlConfigure;
  const [isWXExist, setIsWXExist] = useState(portalSet.isWXExist);
  // const [domainName, setUrl] = useState(portalSetModel.domainName || '');
  const [weChat, setLoginWay] = useState(loginMode.weChat); //微信是否开启
  const [allowUserType, setAllowType] = useState(portalSetModel.allowUserType || 3); //允许的用户
  const [admin, setNotify] = useState(noticeScope.admin || false); //允许的用户
  const [exAccountSmsNotice, setExAccountSmsNotice] = useState(noticeScope.exAccountSmsNotice || false); //审核结果短信通知外部用户
  const [loading, setLoading] = useState(true);
  const [authorizerInfo, setAuthorizerInfo] = useState(portalSet.authorizerInfo || {});
  const [customizeName, setcustomizeName] = useState(portalSetModel.customizeName);
  useEffect(() => {
    let { portalSet = {} } = props;
    let { portalSetModel = {} } = portalSet;
    setPortalSetModel(portalSetModel);
  }, [props]);

  useEffect(() => {
    let { portalSetModel = {} } = portalSet;
    const { loginMode = {}, noticeScope = {} } = portalSetModel;
    // setIsWXExist(portalSet.isWXExist);
    // setUrl(portalSetModel.domainName || '');
    setLoginWay(loginMode.weChat);
    setAllowType(portalSetModel.allowUserType || 3);
    setNotify(noticeScope.admin || false);
    setExAccountSmsNotice(noticeScope.exAccountSmsNotice || false);
    setcustomizeName(portalSetModel.customizeName)
  }, [portalSet.portalSetModel]);

  useEffect(() => {
    if (weChat && !isWXExist && !authorizerInfo.appId) {
      getWeiXinBindingInfo({ projectId: projectId }).then(res => {
        setIsWXExist(res && res.length > 0);
        setAuthorizerInfo(res && res.length > 0 ? res[0] : {});
        setLoading(false);
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
      setLoading(false);
    }
  }, [weChat]);
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
        <h6 className={cx('Font16 Gray Bold mBottom0 mTop16', { mTop24: isFrontDomain })}>{_l('登录/注册方式')}</h6>
        <div className="">
          {LOGIN_WAY.map((o, i) => {
            return (
              <Checkbox
                className="mTop15 InlineBlock mRight60"
                text={o}
                disabled={i === 0}
                checked={i === 0 || weChat}
                onClick={checked => {
                  if (i === 0) {
                    return;
                  }
                  onChangePortalSet({
                    portalSetModel: {
                      ...portalSetModel,
                      loginMode: {
                        ...loginMode,
                        weChat: !weChat,
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
        <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('用户注册设置')}</h6>
        <div className="mTop16">
          <SwitchStyle>
            <Icon
              icon={!!admin ? 'ic_toggle_on' : 'ic_toggle_off'}
              className="Font24 Hand"
              onClick={() => {
                onChangePortalSet({
                  portalSetModel: {
                    ...portalSetModel,
                    noticeScope: { ...noticeScope, admin: !admin },
                  },
                });
              }}
            />
            <div className="switchText InlineBlock Normal Gray mLeft12">{_l('新用户注册、激活时通知管理员')}</div>
          </SwitchStyle>
        </div>
        <div className="mTop16">
          <SwitchStyle>
            <Icon
              icon={!!exAccountSmsNotice ? 'ic_toggle_on' : 'ic_toggle_off'}
              className="Font24 Hand"
              onClick={() => {
                onChangePortalSet({
                  portalSetModel: {
                    ...portalSetModel,
                    noticeScope: { ...noticeScope, exAccountSmsNotice: !exAccountSmsNotice },
                  },
                });
              }}
            />
            <div className="switchText InlineBlock Normal Gray mLeft12">{_l('审核结果短信通知外部用户')}</div>
          </SwitchStyle>
        </div>
      </div>
    </Wrap>
  );
}
