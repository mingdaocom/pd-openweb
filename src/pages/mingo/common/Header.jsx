import React, { Fragment } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Qr } from 'ming-ui';
import { Button, Tooltip } from 'ming-ui/antd-components';
import mingoHead from 'src/pages/chat/containers/ChatList/Mingo/images/mingo.png';
import { getAccountPersonalUrl, pathCompletion } from 'src/utils/platform/navigation/path';
import mingoWordmark from './images/mingo-logo.png';

const Con = styled.div`
  width: 100%;
  height: 50px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-border-primary);
  padding: 0 20px;
  .hap-logo {
    width: 32px;
    height: 32px;
    margin-right: 6px;
    object-fit: cover;
    border-radius: 50%;
  }
  .brand-wordmark {
    height: 22px;
    width: auto;
    object-fit: contain;
    display: block;
    /* 文字 logo 视觉重心偏上，几何居中后略下沉 2px 才视觉居中 */
    margin-top: 1px;
  }
  .mingdao-logo {
    height: 22px;
    width: auto;
    object-fit: contain;
    display: block;
  }
  a.logo {
    color: var(--color-text-primary) !important;
    font-weight: bold;
    font-size: 17px;
  }
  .user-info {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    border: 1px solid var(--color-border-secondary);
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  &.isFooter {
    padding: 0 15px;
    > div {
      flex-direction: row;
      width: 100%;
      gap: 10px;
    }
    button {
      flex: 1;
    }
  }
  &.isEmbed {
    height: 36px;
    text-align: center;
    background-color: var(--color-background-secondary);
    padding: 0 12px;
    .title {
      width: 100%;
      font-size: 13px;
      font-weight: bold;
      color: var(--color-text-title);
    }
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const QrTrigger = styled.div`
  position: relative;
  display: flex;

  &:hover {
    .urlQrCode {
      display: block;
    }
  }
`;

const QrCode = styled.div`
  display: none;
  position: absolute;
  top: calc(100% + 6px);
  left: calc(50% - 90px);
  width: 180px;
  height: 180px;
  background-color: var(--color-background-primary);
  border-radius: 5px;
  padding: 16px;
  background-color: var(--color-background-primary);
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
  }
`;

export default function Header({
  error,
  isShare,
  isFooter = false,
  isSmallMode,
  brandWordmark = false,
  useMingdaoLogo = false,
  hideLoginEntry = false,
  onCopyLink,
  onContinueChat,
}) {
  const searchParams = new URL(location.href).searchParams;
  const isEmbed = !!searchParams.get('embed') || window.top !== window.self;
  const brandLogoUrl = md?.global?.SysSettings?.brandLogoUrl;

  if (isEmbed) {
    return (
      <Con className={cx('t-flex t-items-center t-justify-between isEmbed')}>
        <div className="title">{_l('Mingo')}</div>
        <i
          className="Right icon icon-launch Font18 textSecondary Hand"
          onClick={() => {
            const urlObj = new URL(location.href);
            window.open(location.href.replace(urlObj.search, ''), '_blank');
          }}
        ></i>
      </Con>
    );
  }

  return (
    <Con className={cx('t-flex t-items-center t-justify-between', { isSmallMode, isFooter, isEmbed })}>
      {!isFooter &&
        // PlanPage 使用明道云 logo；agent 落地页用 mingo 文字 logo；其余页面保持品牌 logo + 名称
        (useMingdaoLogo ? (
          <a href={pathCompletion('/')} className="logo t-flex t-items-center">
            {!!brandLogoUrl && <img className="mingdao-logo" src={brandLogoUrl} />}
          </a>
        ) : brandWordmark ? (
          <a href={pathCompletion('/')} className="logo t-flex t-items-center">
            <img className="brand-wordmark" src={md.global.SysSettings.aiBrandLogoUrl || mingoWordmark} alt="mingo" />
          </a>
        ) : (
          <a href={pathCompletion('/')} className="logo t-flex t-items-center">
            <img className="hap-logo" src={md.global.SysSettings.aiBrandLogoUrl || mingoHead} alt={_l('HAP助手')} />
            {md.global.SysSettings.aiBrandName || 'Mingo'}
          </a>
        ))}
      <Right className="t-flex t-items-center">
        {isShare && (!isSmallMode || isFooter) && !error && !window.callFromHelp && (
          <Fragment>
            <Button icon={<i className="icon icon-copy" />} onClick={onCopyLink}>
              {_l('复制链接')}
            </Button>
            {!isSmallMode && (
              <QrTrigger>
                <Button aria-label={_l('二维码')} icon={<i className="icon icon-qr_code" />} />
                <QrCode className="urlQrCode">
                  <Qr content={window.location.href} />
                </QrCode>
              </QrTrigger>
            )}
            <Button type="primary" icon={<i className="icon icon-new_chat" />} onClick={onContinueChat}>
              {_l('对话')}
            </Button>
          </Fragment>
        )}
        {!isShare && md?.global?.Account?.avatar && (
          <Tooltip title={md?.global?.Account?.fullname}>
            <div
              className="user-info t-flex t-items-center"
              onClick={() => {
                if (isSmallMode) {
                  location.href = pathCompletion('/mobile/myHome');
                } else {
                  location.href = getAccountPersonalUrl();
                }
              }}
            >
              <img src={md?.global?.Account?.avatar} alt="avatar" />
            </div>
          </Tooltip>
        )}
        {!hideLoginEntry && !md?.global?.Account?.accountId && !isFooter && (
          <Button
            type="primary"
            onClick={() =>
              (location.href = pathCompletion('/login?ReturnUrl=' + encodeURIComponent(window.location.href)))
            }
          >
            {_l('登录')}
          </Button>
        )}
      </Right>
    </Con>
  );
}

Header.propTypes = {
  error: PropTypes.string,
  isShare: PropTypes.bool,
  isFooter: PropTypes.bool,
  isSmallMode: PropTypes.bool,
  brandWordmark: PropTypes.bool,
  useMingdaoLogo: PropTypes.bool,
  hideLoginEntry: PropTypes.bool,
  onCopyLink: PropTypes.func,
  onContinueChat: PropTypes.func,
};
