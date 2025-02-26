import React, { useState, useEffect, useRef } from 'react';
import cx from 'classnames';
import { browserIsMobile } from 'src/util';
import { Icon, SvgIcon } from 'ming-ui';
import { statusList } from '../util';
import LoginContainer from './LoginContainer';
import { FixedContent } from 'src/pages/AuthService/portalAccount/style';
import ChangeLang from 'src/components/ChangeLang';
import { WrapContainer } from '../style';

export default function Container(props) {
  const {
    logoImageUrl,
    pageMode = 3,
    pageTitle = '',
    status,
    appColor = '#00bcd4',
    appLogoUrl = md.global.FileStoreConfig.pubHost.replace(/\/$/, '') + '/customIcon/0_lego.svg',
    isErrUrl,
    noticeScope = {},
    fixInfo = {},
  } = props;

  const getWaring = status => {
    switch (status) {
      case 2:
        return _l('您的账号已被停用');
      case 12:
        return (
          <React.Fragment>
            {/* isErrUrl status===12 // 进到登录根据配置信息判断当前版本购买人数是否超过当前版本购买人数 */}
            {isErrUrl ? _l('当前使用人数超出额度') : _l('运营方使用额度已满')}
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

  const tipStyle = pageMode === 6 && !browserIsMobile() ? { marginTop: document.documentElement.clientHeight / 4 } : {};

  return (
    <WrapContainer
      className={cx('containLogin', {
        isCenterCon: pageMode !== 6,
        isR: pageMode === 6 && !browserIsMobile(),
        isM: browserIsMobile(),
        isTipCon: statusList.filter(o => o !== 14).includes(status),
      })}
      style={{
        maxHeight: pageMode === 3 && [14].includes(status) ? document.documentElement.clientHeight - 64 : 'auto',
      }}
    >
      <div>
        <div className={'lang'}>
          <ChangeLang />
        </div>
        {logoImageUrl ? (
          <img src={logoImageUrl} height={40} />
        ) : appColor && appLogoUrl ? (
          <span className={cx('logoImageUrlIcon')} style={{ backgroundColor: appColor }}>
            <SvgIcon url={appLogoUrl} fill={'#fff'} size={28} />
          </span>
        ) : (
          ''
        )}
        <p className="Font26 Gray mAll0 mTop20 Bold pageTitle" style={{ WebkitBoxOrient: 'vertical' }}>
          {pageTitle}
        </p>
        {status === 3 ? (
          <div className="tipConBox" style={tipStyle}>
            <div className="txtIcon">
              <Icon type="check_circle" className="" style={{ color: '#4caf50' }} />
            </div>
            <p className="txtConsole">{_l('注册成功')}</p>
            <p className="txtConsole Font15 mTop6">{_l('请耐心等待运营方审核')}</p>
            {noticeScope.exAccountSmsNotice && (
              <p className="txtConsole Font15">{_l('会通过短信/邮件告知您审核结果')}</p>
            )}
          </div>
        ) : status === 4 ? (
          <div className="tipConBox" style={tipStyle}>
            <div className="txtIcon">
              <Icon type="knowledge-message" className="Red" />
            </div>
            <p className="txtConsole">{_l('审核未通过')}</p>
          </div>
        ) : [2, 10, 11, 12, 13, 10000, 20000, 40].includes(status) ? (
          <div className="tipConBox" style={tipStyle}>
            <div className="txtIcon">
              <Icon type="knowledge-message" className="Red" />
            </div>
            <p className="txtConsole">{getWaring(status)}</p>
          </div>
        ) : [14].includes(status) ? (
          <FixedContent>
            <div className="iconInfo mBottom25">
              <Icon className="Font48" icon="setting" style={{ color: '#fd7558' }} />
            </div>
            <div className="Font18 mBottom20 fixeding">{_l('应用维护中...')}</div>
            <div className="fixedInfo mBottom20">
              {_l('该应用被%0设置为维护中状态,暂停访问', (fixInfo.fixAccount || {}).fullName || '')}
            </div>
            <div className="fixRemark">{fixInfo.fixRemark}</div>
          </FixedContent>
        ) : (
          <div
            className="messageConBox"
            style={
              pageMode === 6 && !browserIsMobile() ? { marginTop: document.documentElement.clientHeight / 5 - 105 } : {}
            }
          >
            <LoginContainer {...props} />
          </div>
        )}
      </div>
    </WrapContainer>
  );
}
