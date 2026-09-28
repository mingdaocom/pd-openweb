import React, { Fragment } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Qr } from 'ming-ui';
import { Button, Tooltip } from 'ming-ui/antd-components';
import PublicAppLangDropdown from 'src/components/PublicAppLangDropdown';
import { getAccountPersonalUrl, pathCompletion } from 'src/utils/platform/navigation/path';

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
    flex: 1;
    min-width: 0;
    margin-right: 16px;
    color: var(--color-text-primary) !important;
    font-weight: bold;
    font-size: 17px;
    .logoTitle {
      min-width: 0;
    }
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
    &.isSmallMode {
      height: 60px;
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
  flex: none;
  /* 设计稿：「继续对话」与头像间距 20 */
  gap: 20px;
`;

const QrButtonWrap = styled.div`
  position: relative;
  &:hover .urlQrCode {
    display: block;
  }
`;

// 「继续对话」使用白底常规描边，主题色图标 + 主文案色文字。
// 分享页不走 setAppThemeColor，--app-primary-color 可能未注入，回退到成功色（HAP 默认绿）。
const ContinueButton = styled(Button)`
  /* 常态描边锁死：点击后按钮仍保持 focus / active 态，antd 会改写边框色导致边框看起来消失 */
  color: var(--color-text-primary) !important;
  border-color: var(--color-border-primary) !important;
  .hap-btn-icon .icon {
    color: var(--app-primary-color, var(--color-success));
  }
  &:hover {
    border-color: var(--app-primary-color, var(--color-success)) !important;
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
  &.isAiAction {
    left: auto;
    right: 0;
  }
`;

// 分享页可能部署在独立的分享域名上：logo 直接跳配置里的主站地址（WebUrl 本身就是完整地址），
// 取不到时退回当前站点根路径
function goMainSite() {
  location.href = window.md?.global?.Config?.WebUrl || pathCompletion('/');
}

export default function Header({
  title,
  iconUrl,
  error,
  isAiAction,
  isShare = true,
  isFooter = false,
  isSmallMode,
  appId,
  projectId,
  onCopyLink,
  onContinueChat,
}) {
  const searchParams = new URL(location.href).searchParams;
  const isEmbed = !!searchParams.get('embed') || window.top !== window.self;

  if (isEmbed) {
    return (
      <Con className={cx('t-flex t-items-center t-justify-between isEmbed')}>
        <div className="title">{title}</div>
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
        // WebUrl 要等 preall 写入 Config，渲染期还取不到，跳转地址放到点击时再算
        <a className="logo t-flex t-items-center pointer" onClick={goMainSite}>
          <img className="hap-logo" src={iconUrl} alt={title} />
          <span className="logoTitle ellipsis">{title}</span>
        </a>
      )}
      <Right className="t-flex t-items-center">
        {!isFooter && appId && projectId && <PublicAppLangDropdown appId={appId} projectId={projectId} />}
        {isShare && (!isSmallMode || isFooter) && !error && (
          <Fragment>
            {isAiAction ? (
              // AI 操作分享页没有「继续对话」，保留原有的复制链接 + 二维码，否则右上角会空掉
              <Fragment>
                <Button icon={<i className="icon icon-copy textTertiary" />} onClick={onCopyLink}>
                  {_l('复制链接')}
                </Button>
                {!isSmallMode && (
                  <QrButtonWrap>
                    <Button aria-label={_l('二维码')} icon={<i className="icon icon-qr_code textTertiary" />} />
                    <QrCode className={cx('urlQrCode', { isAiAction })}>
                      <Qr content={window.location.href} />
                    </QrCode>
                  </QrButtonWrap>
                )}
              </Fragment>
            ) : (
              // 设计稿的头部右侧只有「继续对话」+ 头像；复制链接保留在窄屏底部条
              <Fragment>
                {isFooter && (
                  <Button icon={<i className="icon icon-copy textTertiary" />} onClick={onCopyLink}>
                    {_l('复制链接')}
                  </Button>
                )}
                <ContinueButton shape="round" icon={<i className="icon icon-new_chat" />} onClick={onContinueChat}>
                  {_l('继续对话')}
                </ContinueButton>
              </Fragment>
            )}
          </Fragment>
        )}
        {!isFooter && md?.global?.Account?.avatar && (
          <Tooltip title={md?.global?.Account?.fullname}>
            <div
              className="user-info t-flex t-items-center"
              onClick={() => {
                // 分享页是独立入口，本站 pathCompletion('/personal') 无对应路由会 404；
                // 桌面统一走账号中心绝对地址
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
      </Right>
    </Con>
  );
}

Header.propTypes = {
  appId: PropTypes.string,
  projectId: PropTypes.string,
  error: PropTypes.string,
  isShare: PropTypes.bool,
  isFooter: PropTypes.bool,
  isSmallMode: PropTypes.bool,
  onCopyLink: PropTypes.func,
  onContinueChat: PropTypes.func,
};
