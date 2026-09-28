import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import DocumentTitle from 'react-document-title';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import { SHARE_STATE, ShareState, VerificationPass } from 'worksheet/components/ShareState';
import preall from 'src/common/entries/preall';
import AntdThemeProvider from 'src/common/providers/theme/AntdThemeProvider';
import { continueSharedSession, SHARE_ERROR } from 'src/components/Agent/agentService';
import RestrictAccessStatus from 'src/components/restrictAccessStatus';
import abnormal from 'src/pages/worksheet/assets/abnormal.png';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { pathCompletion, toMainSiteUrl } from 'src/utils/platform/navigation/path';
import { getTranslateInfo, shareGetAppLangDetail } from 'src/utils/services/app';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import Content from './Content';
import Header from './Header';
import { isShareViewerLoggedIn } from './shareAccount';
import './index.less';

// New Mingo 会话分享页（MingoHistory=73）：
// 阶段2 —— 由分享 id 换取分享基础信息（含 shareId、clientId）；阶段3 —— Content 带 clientId 按 shareId 拉分享内容。
const SOURCE_TYPE = 73;
// 无权限：主站过闸未通过（组织内分享的非成员 / 未登录、分享被取消等），统一按此码处理
const RESULT_NO_PERMISSION = 7;
// 分享可见范围（对应 Share/controller 的 SHARE_SCOPE）：1 = 仅本网络内可见，需要登录后校验组织成员
const SCOPE_PROJECT = 1;

// 公开分享的链接挂在独立的分享域名上，那里没有主站登录态：登录页和登录后回来的分享页地址
// 都改挂主站域名，否则在分享域名上登录完回来仍是未登录，「继续对话」会一直被打回登录。
function goLogin() {
  const returnUrl = toMainSiteUrl(location.href);

  location.href = toMainSiteUrl(pathCompletion('/login?ReturnUrl=' + encodeURIComponent(returnUrl)));
}

// 过闸未通过（登录后仍无权限）的终态：与应用内「地址无法访问」同一套文案
// 设计稿：插图 ~124 宽，标题 17px 主文案色，说明 13px 弱化色
const ShareUnavailable = () => (
  <div className="w100 h100 flexColumn alignItemsCenter justifyContentCenter bgPrimary">
    <img className="mBottom40" style={{ width: 124 }} src={abnormal} alt="" />
    <div className="Font17 textPrimary">{_l('地址无法访问')}</div>
    <div className="Font13 textTertiary mTop10">{_l('被取消了查看权限或已删除')}</div>
  </div>
);

const Wrap = styled.div`
  background-color: var(--color-background-primary);
  .header {
    height: 44px;
    padding: 0 24px;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.16);
    justify-content: space-between;
    background-color: var(--color-background-primary);
    z-index: 1;
  }
`;

const Entry = () => {
  const pathname = location.pathname.split('/');
  const id = pathname[pathname.length - 1];
  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState({});
  const [errorCode, setErrorCode] = useState(null);
  // 阶段3（按 shareId 读分享内容）返回的错误：403 无权限 / 404 会话已删 等，决定整页的终态
  const [contentError, setContentError] = useState(null);
  // 本次分享的可见范围（取自主站分享信息）：只有「仅本网络内可见」才需要引导登录，
  // 公开分享是匿名可看的，被拒就是真的不可访问，不能把访客送去登录页
  const shareScopeRef = useRef(null);
  const isSmallMode = window.innerWidth < 880;
  // 移动端（含企业微信/钉钉/飞书侧边栏等 H5 环境）继续对话要落 H5 的 Mingo 页，而不是桌面对话页
  const isMobile = browserIsMobile();

  // 读取分享内容失败：组织内分享且未登录时先去登录（登录后过闸可能就有权限），其余按错误码给终态。
  // 429 限流不换页面，提示稍后重试即可。
  const handleContentError = useCallback(err => {
    const code = err && err.errorCode;

    if (code === SHARE_ERROR.RATE_LIMIT) {
      alert(_l('访问过于频繁，请稍后重试'), 3);
      return;
    }

    if (shareScopeRef.current === SCOPE_PROJECT && !isShareViewerLoggedIn()) {
      goLogin();
      return;
    }

    setContentError(err || new Error('share access denied'));
  }, []);

  const getEntityShareById = useCallback(
    async params => {
      const result = await appManagementApi.getEntityShareById({ id, sourceType: SOURCE_TYPE, ...params });
      const shareData = _.get(result, 'data') || {};
      // 阶段2：从分享基础信息里取 clientId，落 window / sessionStorage，供阶段3 端点作为独立 Header 携带
      const clientId = shareData.clientId;
      window.clientId = clientId;
      clientId && sessionStorage.setItem(id, clientId);

      if (result.resultCode === 1) {
        const { appId, projectId, sourceId } = shareData;
        // V6.0 起 SourceId 即 shareId（整会话分享时等于 sessionId）；split 兼容对话机器人那种 a|b 拼接锚点
        const [shareId] = (sourceId || '').split('|');

        if (appId && projectId) {
          await shareGetAppLangDetail({ appId, projectId });

          result.data = {
            ...shareData,
            shareId,
            customerPageName: getTranslateInfo(appId, null, shareId).name || shareData.customerPageName,
          };
        } else {
          result.data = { ...shareData, shareId };
        }
      }

      return result;
    },
    [id],
  );

  useEffect(() => {
    const clientId = sessionStorage.getItem(id);
    window.clientId = clientId;

    getEntityShareById({
      clientId,
    })
      .then(async result => {
        const { data } = result;
        const { projectId, scope } = data || {};

        shareScopeRef.current = scope;
        projectId && localStorage.setItem('currentProjectId', projectId);
        preall(
          { type: 'function' },
          {
            allowNotLogin: true,
            requestParams: { projectId },
          },
        );

        // 权限以主站过闸结果为准（前端不自行比对组织成员身份）：仅「本网络内可见」的分享在未登录被拒时
        // 引导登录，登录后重新过闸可能就有权限；公开分享被拒即为真的不可访问，直接渲染「地址无法访问」。
        if (result.resultCode === RESULT_NO_PERMISSION && scope === SCOPE_PROJECT && !isShareViewerLoggedIn()) {
          goLogin();
          return;
        }

        setShare(result);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        setErrorCode(err.errorCode);
      });
  }, [getEntityShareById, id]);

  if (loading) {
    return (
      <div className="w100 h100 flexColumn alignItemsCenter justifyContentCenter">
        <LoadDiv />
      </div>
    );
  }

  if (errorCode === 300016) {
    return <RestrictAccessStatus />;
  }

  const renderContent = ({ shareId }) => {
    if (share.resultCode === 1) {
      // 主站过闸放行、但 agent 侧读取被拒（clientId 失效、分享关闭、组织内分享非成员）：同样落到「地址无法访问」
      if (contentError) {
        return <ShareUnavailable />;
      }

      return <Content shareId={shareId} onError={handleContentError} />;
    }

    // 无权限（登录后仍未通过过闸）：用「地址无法访问」终态，而不是笼统的“无权限”
    if (share.resultCode === RESULT_NO_PERMISSION) {
      return <ShareUnavailable />;
    }

    if ([14, 18, 19].includes(share.resultCode)) {
      return (
        <VerificationPass
          validatorPassPromise={(value, captchaResult) => {
            return new Promise(async (resolve, reject) => {
              if (value) {
                getEntityShareById({
                  password: value,
                  ...captchaResult,
                }).then(data => {
                  if (data.resultCode === 1) {
                    setShare(data);
                    resolve(data);
                  } else {
                    reject(SHARE_STATE[data.resultCode]);
                  }
                });
              } else {
                reject();
              }
            });
          }}
        />
      );
    }

    return <ShareState code={share.resultCode} />;
  };

  const { appId, projectId, pageTitle, customerPageName, shareId } = share.data || {};
  const title = pageTitle || customerPageName || _l('Mingo 对话');
  const contentVisible = share.resultCode === 1 && !contentError;

  // 「继续对话」：登录是硬门槛（公开分享是匿名看的，先补登录）；再带 clientId 调 continue —— 分享人本人回原会话，
  // 其他访客 fork 出归属自己的新会话，两种情况前端一样，拿 sessionId 跳正常对话页。
  // 移动端落 H5 路由 /mobile/mingo/:sessionId（由 mobile/Mingo 解析为初始会话续接），桌面端落 /mingo/chat/:sessionId。
  // 对话页要主站登录态，公开分享所在的分享域名上打不开，跳转地址统一改挂主站域名。
  const getChatPageUrl = sessionId => {
    if (!sessionId) {
      return toMainSiteUrl(pathCompletion(isMobile ? '/mobile/mingo' : '/mingo'));
    }

    return toMainSiteUrl(
      pathCompletion(isMobile ? `/mobile/mingo/${encodeURIComponent(sessionId)}` : `/mingo/chat/${sessionId}`),
    );
  };

  // 移动端 / 窄屏不新开页，直接在当前页跳转。
  const openChatPage = url => {
    if (isMobile || isSmallMode) {
      location.href = url;
    } else {
      window.open(url);
    }
  };

  const handleContinueChat = async () => {
    if (!isShareViewerLoggedIn()) {
      goLogin();
      return;
    }

    if (!shareId) {
      openChatPage(getChatPageUrl(''));
      return;
    }

    try {
      const { sessionId } = await continueSharedSession({ shareId, clientId: window.clientId || '' });
      openChatPage(getChatPageUrl(sessionId));
    } catch (err) {
      console.error('[mingo-share] continue chat failed', err);

      if (err && (err.errorCode === SHARE_ERROR.ACCESS_DENIED || err.errorCode === SHARE_ERROR.SESSION_NOT_FOUND)) {
        setContentError(err);
        return;
      }

      alertIfNotUnauthorized(err, _l('操作失败，请稍后重试'), 2);
    }
  };

  return (
    <Wrap className={cx('flexColumn h100')}>
      <DocumentTitle title={title} />
      <Header
        error={!contentVisible}
        isSmallMode={isSmallMode}
        appId={appId}
        projectId={projectId}
        title={title}
        onContinueChat={handleContinueChat}
      />
      {renderContent({ shareId })}
      {isSmallMode && (
        <Header
          error={!contentVisible}
          isSmallMode={isSmallMode}
          isShare
          isFooter
          onContinueChat={handleContinueChat}
        />
      )}
    </Wrap>
  );
};

const root = createRoot(document.getElementById('app'));

root.render(
  <AntdThemeProvider>
    <Entry />
  </AntdThemeProvider>,
);
