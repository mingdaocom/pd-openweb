import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import DocumentTitle from 'react-document-title';
import cx from 'classnames';
import { navigateTo } from 'router/navigateTo';
import { Icon, LoadDiv, SvgIcon } from 'ming-ui';
import externalPortalAjax from 'src/api/externalPortal';
import preall from 'src/common/preall';
import 'src/pages/AuthService/components/form.less';
import { FixedContent } from 'src/pages/AuthService/portalAccount/style';
import { WrapCom } from 'src/pages/AuthService/style.jsx';
import { browserIsMobile } from 'src/utils/common';
import { getRequest } from 'src/utils/sso';
import { isErrSet } from '../util';
import Container from './Container';
import { Wrap, WrapCon } from './style';

function ContainerCon(props) {
  const [baseSetInfo, setBaseSetInfo] = useState({}); //门户配置
  const [loading, setLoading] = useState(true);
  const [appId, setAppId] = useState('');
  const [fixInfo, setFixInfo] = useState({});
  const [status, setStatus] = useState(0); //0登录  1注册成功 2您的账号已停用 3待审核 4 审核未通过! 12您访问的门户成员已满额 10000  你访问的链接错误! 20000  你访问的链接已停止访问 是否进入填写信息  status = 9
  const [documentTitle, setdocumentTitle] = useState('');
  const { customLink } = getRequest();

  useEffect(() => {
    getBaseInfo();
  }, []);

  //根据appid  获取当前应用的登录页面 以及应用状态
  const getBaseInfo = () => {
    let ajaxPromise = '';
    let request = getRequest();
    const { appId = '' } = request;
    ajaxPromise = externalPortalAjax.getPortalSetByAppId({ appId, customLink });
    ajaxPromise &&
      ajaxPromise.then(res => {
        const { portalSetResult = {}, isExist, status } = res;
        const { isEnable, appId } = portalSetResult;
        if (portalSetResult.pageTitle) {
          setdocumentTitle(_l('忘记密码 - %0', portalSetResult.pageTitle));
        } else {
          setdocumentTitle(_l('忘记密码'));
        }
        const isErrCustomUrl = customLink && isErrSet(portalSetResult);
        if (status === 40 || isErrCustomUrl) {
          //扩展链接不存在 || 你访问的链接已停止访问
          setStatus(40);
          setLoading(false);
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
    const { isErrUrl } = props;
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
      case 40:
        return _l('你访问的链接无效!');
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
            {baseSetInfo.logoImageUrl ? <img src={baseSetInfo.logoImageUrl} height={40} className="mRight20" /> : ''}
            <p className="Font26 Gray mAll0 Bold flex" style={{ WebkitBoxOrient: 'vertical' }}>
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
                  navigateTo(`${window.subPath || ''}/app/${appId}${customLink ? '/' + customLink : ''}`);
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
const root = createRoot(document.querySelector('#app'));

root.render(
  <WrapCom>
    <WrappedComp />
  </WrapCom>,
);
