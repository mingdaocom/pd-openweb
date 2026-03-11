import React, { Fragment } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import 'ming-ui';
import { Button, Qr } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import mingoHead from 'src/pages/chat/containers/ChatList/Mingo/images/mingo.png';
import embedMingo from '../embed';

if (location.href.includes('embedTest')) {
  embedMingo();
}

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

const WrappedButton = styled(Button)`
  padding: 0 10px !important;
  color: var(--color-text-primary) !important;
  border-color: var(--color-border-tertiary) !important;
  min-width: auto !important;
  display: flex !important;
  align-items: center;
  justify-content: center;

  .icon {
    font-size: 18px;
    color: var(--color-text-tertiary) !important;
    margin-right: 5px;
  }
  &.icon {
    padding: 0px !important;
    width: 36px !important;
    .icon {
      margin-right: 0px !important;
      font-size: 22px !important;
    }
  }
  &.new-chat {
    color: var(--color-white) !important;
    .icon {
      color: var(--color-white) !important;
    }
  }
  &.urlQrCode {
    position: relative;
    &:hover {
      .urlQrCode {
        display: block;
      }
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

export default function Header({ error, isShare, isFooter = false, isSmallMode, onCopyLink, onContinueChat }) {
  const searchParams = new URL(location.href).searchParams;
  const isEmbed = !!searchParams.get('embed') || window.top !== window.self;
  if (isEmbed) {
    return (
      <Con className={cx('t-flex t-items-center t-justify-between isEmbed')}>
        <div className="title">{_l('HAP助手')}</div>
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
      {!isFooter && (
        <a href="/" className="logo t-flex t-items-center">
          <img className="hap-logo" src={md.global.SysSettings.aiBrandLogoUrl || mingoHead} alt="HAP助手" />
          {md.global.SysSettings.aiBrandName || 'Mingo'}
        </a>
      )}
      <Right className="t-flex t-items-center">
        {isShare && (!isSmallMode || isFooter) && !error && (
          <Fragment>
            <WrappedButton type="ghostgray" onClick={onCopyLink}>
              <i className="icon icon-copy"></i>
              {_l('复制链接')}
            </WrappedButton>
            {!isSmallMode && (
              <WrappedButton type="ghostgray" className="urlQrCode icon">
                <i className="icon icon-qr_code"></i>
                <QrCode className="urlQrCode">
                  <Qr content={window.location.href} />
                </QrCode>
              </WrappedButton>
            )}
            <WrappedButton className="new-chat" onClick={onContinueChat}>
              <i className="icon icon-new_chat"></i>
              {_l('对话')}
            </WrappedButton>
          </Fragment>
        )}
        {!isShare && md?.global?.Account?.avatar && (
          <Tooltip title={md?.global?.Account?.fullname}>
            <div
              className="user-info t-flex t-items-center"
              onClick={() => {
                if (isSmallMode) {
                  location.href = '/mobile/myHome';
                } else {
                  location.href = '/personal';
                }
              }}
            >
              <img src={md?.global?.Account?.avatar} alt="avatar" />
            </div>
          </Tooltip>
        )}
        {!md?.global?.Account?.accountId && !isFooter && (
          <Button
            type="primary"
            onClick={() => (location.href = '/login?ReturnUrl=' + encodeURIComponent(window.location.href))}
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
  onCopyLink: PropTypes.func,
  onContinueChat: PropTypes.func,
};
