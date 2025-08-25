import React, { useEffect } from 'react';
import DocumentTitle from 'react-document-title';
import { useSetState } from 'react-use';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import externalPortalAjax from 'src/api/externalPortal';
import { getRequest } from 'src/utils/common';
import { accountResultAction } from './util';

const Wrap = styled.div`
  flex: 1;
  .pTop120 {
    padding-top: 120px;
  }
`;
const WrapCon = styled.div`
  width: 100%;
  &.isIcon {
    position: absolute;
    margin-top: -100px;
    top: 50%;
  }
  .txtIcon {
    text-align: center;
    padding-bottom: 10px;
    .Icon {
      font-size: 74px;
    }
  }
  img {
    width: 270px;
    height: 270px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.16);
    border-radius: 8px;
  }
`;

export default function () {
  const [{ url, loading, appName, documentTitle }, setState] = useSetState({
    url: '',
    loading: true,
    appName: '',
    documentTitle: '',
  });

  useEffect(() => {
    login();
  }, []);

  const goPortalLogin = subUrl => {
    location.href = `${window.subPath || ''}/login?${subUrl}`; // 跳转到登录
  };

  const getUrl = () => {
    const request = getRequest();
    const { state = '' } = request;
    externalPortalAjax
      .getTpLoginSubscribedScanUrl({
        state, //链接上带的state
      })
      .then(url => {
        setState({
          url,
          loading: false,
        });
      });
  };

  const login = () => {
    const request = getRequest();
    const { state = '', appid = '', code = '' } = request;
    const pcScan = !!localStorage.getItem('pcScan'); //是否是pc端的扫码登录
    externalPortalAjax
      .tpLogin({
        state,
        wxAppId: appid,
        code,
        pcScan,
      })
      .then(function (res) {
        window.localStorage.removeItem('pcScan');
        const { accountResult, state, accountId, appName } = res;
        let mdAppId = res.appId;
        const customLink = window.isWeiXin && mdAppId ? localStorage.getItem(`${mdAppId}_portalCustomLink`) : '';
        window.localStorage.removeItem(`${mdAppId}_portalCustomLink`);
        if (appName) {
          setState({
            appName,
            documentTitle: _l('登录/注册') + ' - ' + appName,
          });
        } else {
          setState({
            documentTitle: _l('登录/注册'),
          });
        }
        if (pcScan) {
          switch (accountResult) {
            case 1:
              // 返回1，则代表已经关注或者没有开启必须关注服务号，则展现已授权页面即可
              setState({
                url: '',
                loading: false,
              });
              break;
            case 32:
              //32状态值，需要后续展现关注服务号的二维码
              getUrl(state);
              break;
            default:
              goPortalLogin(
                `mdAppId=${mdAppId || ''}&wxState=${res.state || ''}&status=${accountResult}&accountId=${accountId}${
                  customLink ? '&customLink=' + customLink : ''
                }`,
              );
              break;
          }
        } else {
          if (accountResult === 1) {
            accountResultAction(res);
          } else if (accountResult === 32) {
            //32状态值，需要后续展现关注服务号的二维码
            getUrl(state);
          } else {
            goPortalLogin(
              `mdAppId=${mdAppId || ''}&wxState=${res.state || ''}&status=${accountResult}&accountId=${accountId}${
                customLink ? '&customLink=' + customLink : ''
              }`,
            );
          }
        }
      });
  };
  if (!loading) {
    return (
      <WrapCon
        className={cx('flexColumn alignItemsCenter TxtCenter', { isIcon: !url, pLeft20: !!url, pRight20: !!url })}
      >
        {url ? (
          <div>
            <div className="Bold Font20 Gray mTop80">{_l('长按识别下方二维码，关注服务号')}</div>
            <div className="Bold Font18 Gray_75 mTop16">
              {_l('关注后重新扫码或者打开链接进入')}
              {appName}
            </div>
            <img src={url} className="mTop20" />
          </div>
        ) : (
          <div className="TxtCenter">
            <div className="txtIcon">
              <Icon type="check_circle" className="" style={{ color: '#4caf50' }} />
            </div>
            <p className="Font22 Bold mTop25">{_l('微信已授权')}</p>
          </div>
        )}
      </WrapCon>
    );
  }
  return (
    <Wrap>
      <DocumentTitle title={documentTitle} />
      <div className="pTop120">
        <LoadDiv className="" style={{ margin: '30px auto' }} />
      </div>
      <p className="" style={{ textAlign: 'center' }}>
        {_l('微信授权登录中...')}
      </p>
    </Wrap>
  );
}
