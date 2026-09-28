import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import DocumentTitle from 'react-document-title';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _, { get } from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import { SHARE_STATE, ShareState, VerificationPass } from 'worksheet/components/ShareState';
import preall from 'src/common/entries/preall';
import AntdThemeProvider from 'src/common/providers/theme/AntdThemeProvider';
import RestrictAccessStatus from 'src/components/restrictAccessStatus';
import chatBotDefaultIcon from 'src/pages/Chatbot/assets/profile.png';
import abnormal from 'src/pages/worksheet/assets/abnormal.png';
import { pathCompletion, toMainSiteUrl } from 'src/utils/platform/navigation/path';
import { getTranslateInfo, shareGetAppLangDetail } from 'src/utils/services/app';
import Content from './Content';
import Header from './Header';
import './index.less';

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
  // 读取会话内容失败（分享被取消、组织内分享非成员等），决定整页的终态
  const [contentError, setContentError] = useState(null);
  // 本次分享的可见范围（取自主站分享信息）：只有「仅本网络内可见」才需要引导登录，
  // 公开分享是匿名可看的，被拒就是真的不可访问，不能把访客送去登录页
  const shareScopeRef = useRef(null);
  const isSmallMode = window.innerWidth < 880;

  // 组织内分享且未登录时先去登录（登录后过闸可能就有权限），其余按无权限终态处理
  const handleContentError = useCallback(err => {
    if (shareScopeRef.current === SCOPE_PROJECT && !md?.global?.Account?.accountId) {
      goLogin();
      return;
    }

    setContentError(err || new Error('share access denied'));
  }, []);

  const getEntityShareById = useCallback(
    async params => {
      const result = await appManagementApi.getEntityShareById({ id, sourceType: 71, ...params });
      const shareData = _.get(result, 'data') || {};
      const clientId = shareData.clientId;
      window.clientId = clientId;
      clientId && sessionStorage.setItem(id, clientId);

      if (result.resultCode === 1) {
        const { appId, projectId, sourceId } = shareData;
        const [chatbotId] = (sourceId || '').split('|');

        if (appId && projectId && chatbotId) {
          await shareGetAppLangDetail({ appId, projectId });

          result.data = {
            ...shareData,
            customerPageName: getTranslateInfo(appId, null, chatbotId).name || shareData.customerPageName,
          };
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
        localStorage.setItem('currentProjectId', projectId);
        preall(
          { type: 'function' },
          {
            allowNotLogin: true,
            requestParams: { projectId },
          },
        );

        // 权限以主站过闸结果为准（前端不自行比对组织成员身份）：仅「本网络内可见」的分享在未登录被拒时
        // 引导登录，登录后重新过闸可能就有权限；公开分享被拒即为真的不可访问，直接渲染「地址无法访问」。
        if (result.resultCode === RESULT_NO_PERMISSION && scope === SCOPE_PROJECT && !md?.global?.Account?.accountId) {
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

  const renderContent = ({ title, updateTime, chatbotId, conversationId }) => {
    if (share.resultCode === 1) {
      // 主站过闸放行、但读取会话被拒（分享已关闭、组织内分享非成员）：同样落到「地址无法访问」
      if (contentError) {
        return <ShareUnavailable />;
      }

      return (
        <Content
          title={title}
          updateTime={updateTime}
          chatbotId={chatbotId}
          conversationId={conversationId}
          onError={handleContentError}
        />
      );
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

  const { appId, projectId, pageTitle, customerPageName, iconUrl } = share.data || {};
  const [chatbotId, conversationId] = get(share, 'data.sourceId', '').split('|');
  const title = pageTitle || customerPageName;
  // 内容不可见时头部不再提供「复制链接 / 继续对话」
  const contentVisible = share.resultCode === 1 && !contentError;

  // 对话页要主站登录态，公开分享所在的分享域名上打不开，跳转地址统一改挂主站域名。
  const chatbotUrl = () =>
    toMainSiteUrl(pathCompletion(`/embed/chatbot/${appId}/${chatbotId}?share=${conversationId}`));

  // 「继续对话」：登录是硬门槛（公开分享可匿名查看，先补登录），登录后再 fork 出归属自己的会话。
  // 头部不再单独放「登录」按钮，未登录访客由这里引导。
  const handleContinueChat = () => {
    if (!md?.global?.Account?.accountId) {
      goLogin();
      return;
    }

    window.open(chatbotUrl());
  };

  return (
    <Wrap className={cx('flexColumn h100')}>
      <DocumentTitle title={title} />
      <Header
        isAiAction={share.data?.sourceType === 72}
        error={!contentVisible}
        isSmallMode={isSmallMode}
        appId={appId}
        projectId={projectId}
        title={customerPageName}
        iconUrl={iconUrl || chatBotDefaultIcon}
        onContinueChat={handleContinueChat}
        onCopyLink={() => {
          const link = pathCompletion(`/public/chatbot/${id}`);
          copy(link);
          alert(_l('复制成功'));
        }}
      />
      {renderContent({ title, chatbotId, conversationId })}
      {isSmallMode && (
        <Header
          error={!contentVisible}
          isAiAction={share.data?.sourceType === 72}
          isSmallMode={isSmallMode}
          isShare
          isFooter
          onContinueChat={() => window.open(chatbotUrl())}
          onCopyLink={() => {
            const link = pathCompletion(`/public/chatbot/${id}`);
            copy(link);
            alert(_l('复制成功'));
          }}
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
