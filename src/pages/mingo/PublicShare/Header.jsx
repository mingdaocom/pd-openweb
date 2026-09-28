import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button as AntdButton, Tooltip } from 'ming-ui/antd-components';
import PublicAppLangDropdown from 'src/components/PublicAppLangDropdown';
import mingoLogo from 'src/pages/mingo/common/images/mingo-logo.png';
import { getAccountPersonalUrl, pathCompletion } from 'src/utils/platform/navigation/path';
import { isShareViewerLoggedIn } from './shareAccount';

const Con = styled.div`
  width: 100%;
  height: 50px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-border-primary);
  padding: 0 24px;
  .brand-wordmark {
    /* 设计稿 logo 高 28 */
    height: 28px;
    width: auto;
    object-fit: contain;
    flex-shrink: 0;
    /* 文字 logo 视觉重心偏上，下沉后与标题视觉对齐 */
    margin-top: 8px;
  }
  .logoBar {
    flex: 1;
    min-width: 0;
    margin-right: 16px;
  }
  a.logo {
    flex-shrink: 0;
  }
  /* 会话标题：18px 常规字重、紧跟 logo 9px、无分隔线；是纯展示文本，不跟 logo 一起跳首页 */
  .headerTitle {
    min-width: 0;
    margin-left: 9px;
    color: var(--color-text-primary);
    font-size: 18px;
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
  /* 窄屏底部条只保留「继续对话」，整条居中 */
  &.isFooter {
    padding: 0 15px;
    justify-content: center;
    > div {
      flex-direction: row;
      justify-content: center;
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

// 「继续对话」：设计稿 128×36 胶囊，白底 + 常规描边，mingo 紫图标 + 主文案色文字
const ContinueButton = styled(AntdButton)`
  height: 36px;
  min-width: 128px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* 常态描边锁死：点击后按钮仍保持 focus / active 态，antd 会改写边框色导致边框看起来消失 */
  color: var(--color-text-primary) !important;
  border-color: var(--color-border-primary) !important;
  .icon {
    font-size: 18px;
    /* 图标字形自带左右留白，间距取 2px 才与设计稿的视觉间距一致 */
    margin-right: 2px;
    color: var(--color-mingo);
  }
  &:hover {
    border-color: var(--color-mingo) !important;
  }
`;

// 分享页可能部署在独立的分享域名上：logo 直接跳配置里的主站地址（WebUrl 本身就是完整地址），
// 取不到时退回当前站点根路径
function goMainSite() {
  location.href = window.md?.global?.Config?.WebUrl || pathCompletion('/');
}

export default function Header({
  title,
  error,
  isShare = true,
  isFooter = false,
  isSmallMode,
  appId,
  projectId,
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
        <div className="logoBar t-flex t-items-center">
          {/* WebUrl 要等 preall 写入 Config，渲染期还取不到，跳转地址放到点击时再算 */}
          <a className="logo t-flex t-items-center pointer" onClick={goMainSite}>
            <img className="brand-wordmark" src={mingoLogo} alt="mingo" />
          </a>
          {!!title && <span className="headerTitle ellipsis">{title}</span>}
        </div>
      )}
      <Right className="t-flex t-items-center">
        {!isFooter && !error && appId && projectId && <PublicAppLangDropdown appId={appId} projectId={projectId} />}
        {/* 头部右侧与窄屏底部条都只有「继续对话」（底部条居中） */}
        {isShare && (!isSmallMode || isFooter) && !error && (
          <ContinueButton onClick={onContinueChat}>
            <i className="icon icon-new_chat"></i>
            {_l('继续对话')}
          </ContinueButton>
        )}
        {/* 头像即「已登录」的外显：门户账号按未登录处理，不展示（其入口指向的账号中心对门户账号也不通） */}
        {!isFooter && isShareViewerLoggedIn() && md?.global?.Account?.avatar && (
          <Tooltip title={md?.global?.Account?.fullname}>
            <div
              className="user-info t-flex t-items-center"
              onClick={() => {
                // 分享页是独立入口（mingoshare.html），本站 pathCompletion('/personal') 无对应路由会 404；
                // 桌面统一走账号中心绝对地址 getAccountPersonalUrl()（与落地页 common/Header 一致）。
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
  title: PropTypes.string,
  appId: PropTypes.string,
  projectId: PropTypes.string,
  error: PropTypes.bool,
  isShare: PropTypes.bool,
  isFooter: PropTypes.bool,
  isSmallMode: PropTypes.bool,
  onContinueChat: PropTypes.func,
};
