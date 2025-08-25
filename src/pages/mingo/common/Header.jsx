import React, { Fragment } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui';
import { Button, Qr } from 'ming-ui';
import mingoHead from 'src/pages/chat/containers/ChatList/Mingo/images/mingo.png';
import embedMingo from '../embed';

if (location.href.includes('embedTest')) {
  embedMingo();
}

const Con = styled.div`
  width: 100%;
  height: 50px;
  flex-shrink: 0;
  border-bottom: 1px solid #dddddd;
  padding: 0 20px;
  .hap-logo {
    width: 32px;
    height: 32px;
    margin-right: 6px;
    object-fit: cover;
    border-radius: 50%;
  }
  a.logo {
    color: #151515 !important;
    font-weight: bold;
    font-size: 17px;
  }
  .user-info {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    border: 1px solid #e3e3e3;
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
    background-color: #f8f8f8;
    padding: 0 12px;
    .title {
      width: 100%;
      font-size: 13px;
      font-weight: bold;
      color: #151515;
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
  color: #151515 !important;
  border-color: #ccc !important;
  min-width: auto !important;
  display: flex !important;
  align-items: center;
  justify-content: center;

  .icon {
    font-size: 18px;
    color: #9d9d9d !important;
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
    background-color: var(--ai-primary-color) !important;
    border-color: var(--ai-primary-color) !important;
    color: #fff !important;
    .icon {
      color: #fff !important;
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
  background-color: #fff;
  border-radius: 5px;
  padding: 16px;
  background-color: #fff;
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
          className="Right icon icon-launch Font18 Gray_75 Hand"
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
          <img className="hap-logo" src={mingoHead} alt="HAP助手" />
          {_l('Mingo')}
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
            <WrappedButton type="ghostgray" className="new-chat" onClick={onContinueChat}>
              <i className="icon icon-newchat"></i>
              {_l('对话')}
            </WrappedButton>
          </Fragment>
        )}
        {!isShare && md?.global?.Account?.avatar && (
          <Tooltip text={md?.global?.Account?.fullname}>
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
