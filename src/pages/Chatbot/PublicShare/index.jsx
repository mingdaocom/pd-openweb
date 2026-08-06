import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import DocumentTitle from 'react-document-title';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _, { get } from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import { SHARE_STATE, ShareState, VerificationPass } from 'worksheet/components/ShareState';
import preall from 'src/common/preall';
import RestrictAccessStatus from 'src/components/restrictAccessStatus';
import chatBotDefaultIcon from 'src/pages/Chatbot/assets/profile.png';
import { getTranslateInfo, shareGetAppLangDetail } from 'src/utils/app';
import { pathCompletion } from 'src/utils/common';
import Content from './Content';
import Header from './Header';
import './index.less';

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
  const isSmallMode = window.innerWidth < 880;

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
        const { projectId } = data || {};
        localStorage.setItem('currentProjectId', projectId);
        preall(
          { type: 'function' },
          {
            allowNotLogin: true,
            requestParams: { projectId },
          },
        );

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
      return <Content title={title} updateTime={updateTime} chatbotId={chatbotId} conversationId={conversationId} />;
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

  return (
    <Wrap className={cx('flexColumn h100')}>
      <DocumentTitle title={title} />
      <Header
        isAiAction={share.data?.sourceType === 72}
        error={share.resultCode !== 1}
        isSmallMode={isSmallMode}
        appId={appId}
        projectId={projectId}
        title={customerPageName}
        iconUrl={iconUrl || chatBotDefaultIcon}
        onContinueChat={() =>
          window.open(pathCompletion(`/embed/chatbot/${appId}/${chatbotId}?share=${conversationId}`))
        }
        onCopyLink={() => {
          const link = pathCompletion(`/public/chatbot/${id}`);
          copy(link);
          alert(_l('复制成功'));
        }}
      />
      {renderContent({ title, chatbotId, conversationId })}
      {isSmallMode && (
        <Header
          error={share.resultCode !== 1}
          isAiAction={share.data?.sourceType === 72}
          isSmallMode={isSmallMode}
          isShare
          isFooter
          onContinueChat={() =>
            window.open(pathCompletion(`/embed/chatbot/${appId}/${chatbotId}?share=${conversationId}`))
          }
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

root.render(<Entry />);
