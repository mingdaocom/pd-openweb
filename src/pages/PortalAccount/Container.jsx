import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { browserIsMobile } from 'src/util';
import { Icon } from 'ming-ui';
import { statusList } from './util';
import SvgIcon from 'src/components/SvgIcon';
import LoginContainer from './LoginContainer';

const Wrap = styled.div`
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
    margin-bottom: 24px;
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
    // &.sending {
    //   background: #f5f5f5;
    // }
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

export default function Container(props) {
  const {
    logoImageUrl,
    pageMode = 3,
    pageTitle = '',
    status,
    appColor = '#00bcd4',
    appLogoUrl = 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg',
    isErrUrl,
    noticeScope = {},
  } = props;

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
      case 14:
        return _l('当前应用维护中');
    }
  };

  const tipStyle = pageMode === 6 && !browserIsMobile() ? { marginTop: document.documentElement.clientHeight / 4 } : {};

  return (
    <Wrap
      className={cx('containLogin', {
        isCenterCon: pageMode !== 6,
        isR: pageMode === 6 && !browserIsMobile(),
        isM: browserIsMobile(),
        isTipCon: statusList.includes(status),
      })}
    >
      <div>
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
            {noticeScope.exAccountSmsNotice && <p className="txtConsole Font15">{_l('会通过短信/邮件告知您审核结果')}</p>}
          </div>
        ) : status === 4 ? (
          <div className="tipConBox" style={tipStyle}>
            <div className="txtIcon">
              <Icon type="knowledge-message" className="Red" />
            </div>
            <p className="txtConsole">{_l('审核未通过')}</p>
          </div>
        ) : [2, 10, 11, 12, 13, 14, 10000, 20000].includes(status) ? (
          <div className="tipConBox" style={tipStyle}>
            <div className="txtIcon">
              <Icon type="knowledge-message" className="Red" />
            </div>
            <p className="txtConsole">{getWaring(status)}</p>
          </div>
        ) : (
          <div
            className="messageConBox"
            style={
              pageMode === 6 && !browserIsMobile() ? { marginTop: document.documentElement.clientHeight / 5 - 32 } : {}
            }
          >
            <LoginContainer {...props} />
          </div>
        )}
      </div>
    </Wrap>
  );
}
