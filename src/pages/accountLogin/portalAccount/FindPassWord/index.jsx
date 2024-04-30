import React, { useState, useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import store from 'src/pages/accountLogin/redux/configureStore.js';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import cx from 'classnames';
import { browserIsMobile } from 'src/util';
import Container from './Container';
import { LoadDiv, Icon, SvgIcon } from 'ming-ui';
import { getRequest } from 'src/util/sso';
import externalPortalAjax from 'src/api/externalPortal';
import preall from 'src/common/preall';
import { navigateTo } from 'router/navigateTo';
import { FixedContent } from 'src/pages/accountLogin/portalAccount/style';
import DocumentTitle from 'react-document-title';

const Wrap = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  overflow: hidden;
  .backImageUrl {
    background-color: #ebebeb;
    background-position: center;
    flex: 1;
    background-repeat: no-repeat;
    background-size: cover;
    &.isM {
      position: fixed;
      width: 100%;
      min-height: 100%;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
  .btnUseOldAccount {
    font-size: 14px;
    color: #2196f3;
    display: block;
    margin: 20px auto 0;
    text-align: center;

    &:hover {
      color: #1182dd;
    }
  }
`;
const WrapCon = styled.div`
  .Hide {
    display: none;
  }
  .back {
    &:hover {
      color: #2196f3 !important;
    }
  }
  img {
    max-width: 100%;
    object-fit: contain;
  }
  border-radius: 4px;
  padding: 64px;
  box-sizing: border-box;
  width: 50%;
  max-width: 840px;
  min-width: 360px;
  height: 100%;
  background: #fff;
  .logoImageUrlIcon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    div {
      height: 28px;
    }
  }
  p {
    margin: 0;
    padding: 0;
  }
  .messageConBox {
    max-width: 400px;
    margin: 100px auto;
  }
  .tipConBox {
    margin: 80px auto 0;
    font-weight: 600;
  }
  &.isCenterCon {
    border-radius: 4px;
    width: 440px;
    background: #ffffff;
    height: auto;
    box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.16);
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .messageConBox {
      margin: 0 auto;
    }
    &.isTipCon {
      height: 500px;
    }
  }
  &.isM {
    width: 95%;
    min-width: 95%;
    height: auto;
    padding: 48px 24px;
    .messageConBox {
      margin: 0 auto;
    }
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    &.isTipCon {
      height: 500px;
    }
  }
  .txtIcon {
    text-align: center;
    padding-bottom: 10px;
    .Icon {
      font-size: 74px;
    }
  }
  .txtConsole {
    font-size: 20px;
    font-weight: 500;
    text-align: center;
  }
  .pageTitle {
    margin-bottom: 32px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    text-overflow: ellipsis;
    word-break: break-all;
    width: 100%;
    overflow: hidden;
    line-height: 1.5;
  }
  .loginBtn {
    background: #2196f3;
    height: 40px;
    border-radius: 4px;
    line-height: 40px;
    color: #fff;
    font-weight: 500;
    &:hover {
      background: #42a5f5;
    }
    &.sending {
      background: #f5f5f5;
    }
    &.disable {
      cursor: default;
      background: #bdbdbd !important;
    }
  }
  &.isR {
    margin: 0 0 0 auto;
    overflow: auto;
    .messageBox .mesDiv.errorDiv .warnningTip {
      top: 100%;
      left: 0;
    }
  }
`;

function ContainerCon(props) {
  const [baseSetInfo, setBaseSetInfo] = useState({}); //门户配置
  const [loading, setLoading] = useState(true);
  const [appId, setAppId] = useState('');
  const [fixInfo, setFixInfo] = useState({});
  const [status, setStatus] = useState(0); //0登录  1注册成功 2您的账号已停用 3待审核 4 审核未通过! 12您访问的门户成员已满额 10000  你访问的链接错误! 20000  你访问的链接已停止访问 是否进入填写信息  status = 9
  const [documentTitle, setdocumentTitle] = useState('');
  useEffect(() => {
    getBaseInfo();
  }, []);

  //根据appid  获取当前应用的登录页面 以及应用状态
  const getBaseInfo = () => {
    let ajaxPromise = '';
    let request = getRequest();
    const { appId = '' } = request;
    ajaxPromise = externalPortalAjax.getPortalSetByAppId({ appId });
    ajaxPromise &&
      ajaxPromise.then(res => {
        const { portalSetResult = {}, isExist, status } = res;
        const { isEnable, appId } = portalSetResult;
        if (portalSetResult.pageTitle) {
          setdocumentTitle(_l('忘记密码 - %0', portalSetResult.pageTitle));
        } else {
          setdocumentTitle(_l('忘记密码'));
        }
        if (!isEnable || !isExist) {
          !isEnable && setStatus(20000);
          !isExist && setStatus(10000);
          setLoading(false);
        }
        setFixInfo({
          fixAccount: res.fixAccount,
          fixRemark: res.fixRemark,
        });
        setStatus(status);
        setAppId(appId);
        setBaseSetInfo(portalSetResult);
        setLoading(false);
      });
  };

  if (loading) {
    return <LoadDiv className="" style={{ margin: '120px auto' }} />;
  }
  const tipStyle =
    baseSetInfo.pageMode === 6 && !browserIsMobile() ? { marginTop: document.documentElement.clientHeight / 4 } : {};
  const getWaring = status => {
    switch (status) {
      case 2:
        return _l('您的账号已被停用');
      case 12:
        return (
          <React.Fragment>
            {/* isErrUrl status===12 // 进到登录根据配置信息判断当前版本购买人数是否超过当前版本购买人数 */}
            {isErrUrl ? _l('链接访问存在异常') : _l('运营方使用额度已满')}
            <p className="Font15 mTop6">{isErrUrl ? _l('请联系运营方') : _l('无法注册新用户')}</p>
          </React.Fragment>
        );
      case 20000:
      case 11:
      case 13:
        return _l('你访问的链接已停止访问!');
      case 10000:
        return _l('你访问的链接错误!');
      case 10:
        return _l('当前应用不存在');
    }
  };
  return (
    <Wrap
      style={
        baseSetInfo.backGroundType !== 6
          ? { backgroundColor: baseSetInfo.backColor }
          : baseSetInfo.pageMode !== 6
          ? { backgroundImage: `url(${baseSetInfo.backImageUrl})` }
          : {}
      }
      className={cx({ isCenter: baseSetInfo.pageMode !== 6 })}
    >
      <DocumentTitle title={documentTitle} />
      {baseSetInfo.pageMode === 6 && (
        <div
          className={cx('backImageUrl', { isM: browserIsMobile() })}
          style={{ backgroundImage: `url(${baseSetInfo.backImageUrl})` }}
        />
      )}
      <WrapCon
        className={cx('containLogin', {
          isCenterCon: baseSetInfo.pageMode !== 6,
          isR: baseSetInfo.pageMode === 6 && !browserIsMobile(),
          isM: browserIsMobile(),
        })}
      >
        <div>
          <div className="flexRow">
            {baseSetInfo.logoImageUrl ? (
              <img src={baseSetInfo.logoImageUrl} height={40} />
            ) : (
              <span className={cx('logoImageUrlIcon')} style={{ backgroundColor: baseSetInfo.appColor || '#00bcd4' }}>
                <SvgIcon
                  url={
                    baseSetInfo.appLogoUrl ||
                    md.global.FileStoreConfig.pubHost.replace(/\/$/, '') + '/customIcon/0_lego.svg'
                  }
                  fill={'#fff'}
                  size={28}
                />
              </span>
            )}
            <p className="Font26 Gray mAll0 mLeft20 Bold flex" style={{ WebkitBoxOrient: 'vertical' }}>
              {baseSetInfo.pageTitle}
            </p>
          </div>
          {[2, 10, 11, 12, 13, 10000, 20000].includes(status) ? (
            <React.Fragment>
              <div className="tipConBox pBottom100" style={tipStyle}>
                <div className="txtIcon">
                  <Icon type="knowledge-message" className="Red" />
                </div>
                <p className="txtConsole">{getWaring(status)}</p>
              </div>
            </React.Fragment>
          ) : [14].includes(status) ? (
            <FixedContent>
              <div className="iconInfo mBottom25 mTop30">
                <Icon className="Font48" icon="setting" style={{ color: '#fd7558' }} />
              </div>
              <div className="Font18 mBottom20 fixeding">{_l('应用维护中...')}</div>
              <div className="fixedInfo mBottom20">
                {_l('该应用被%0设置为维护中状态,暂停访问', (fixInfo.fixAccount || {}).fullName || '')}
              </div>
              <div className="fixRemark">{fixInfo.fixRemark}</div>
            </FixedContent>
          ) : (
            <React.Fragment>
              <p className="Font26 Gray mAll0 mTop20 Bold pageTitle" style={{ WebkitBoxOrient: 'vertical' }}>
                {_l('重置密码')}
              </p>
              <div
                className="messageConBox"
                style={
                  baseSetInfo.pageMode === 6 && !browserIsMobile()
                    ? { marginTop: document.documentElement.clientHeight / 5 - 32 }
                    : {}
                }
              >
                <Container {...props} {...baseSetInfo} appId={appId} />
              </div>
              <span
                className="btnUseOldAccount Hand"
                onClick={() => {
                  navigateTo(`${window.subPath || ''}/app/${appId}`);
                }}
              >
                {_l('返回登录页面')}
              </span>
            </React.Fragment>
          )}
        </div>
      </WrapCon>
    </Wrap>
  );
}

const WrappedComp = preall(ContainerCon, { allowNotLogin: true });

ReactDOM.render(
  <Provider store={store}>
    <WrappedComp />
  </Provider>,
  document.querySelector('#app'),
);
