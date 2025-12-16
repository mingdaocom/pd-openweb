import React, { useEffect, useState } from 'react';
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
import chatBotDefaultIcon from 'src/pages/Chatbot/assets/profile.png';
import Content from './Content';
import Header from './Header';
import './index.less';

const Wrap = styled.div`
  background-color: #fff;
  .header {
    height: 44px;
    padding: 0 24px;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.16);
    justify-content: space-between;
    background-color: #fff;
    z-index: 1;
  }
`;

const Entry = () => {
  const pathname = location.pathname.split('/');
  const id = pathname[pathname.length - 1];
  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState({});
  const isSmallMode = window.innerWidth < 880;
  useEffect(() => {
    const clientId = sessionStorage.getItem(id);
    window.clientId = clientId;

    getEntityShareById({
      clientId,
    }).then(async result => {
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
    });
  }, []);

  const getEntityShareById = data => {
    return new Promise(async resolve => {
      const result = await appManagementApi.getEntityShareById({ id, sourceType: 71, ...data });
      const clientId = _.get(result, 'data.clientId');
      window.clientId = clientId;
      clientId && sessionStorage.setItem(id, clientId);
      resolve(result);
    });
  };

  if (loading) {
    return (
      <div className="w100 h100 flexColumn alignItemsCenter justifyContentCenter">
        <LoadDiv />
      </div>
    );
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

  const { appId, pageTitle, customerPageName, iconUrl } = share.data || {};
  const [chatbotId, conversationId] = get(share, 'data.sourceId', '').split('|');
  const title = pageTitle || customerPageName;

  return (
    <Wrap className={cx('flexColumn h100')}>
      <DocumentTitle title={title} />
      <Header
        error={share.resultCode !== 1}
        isSmallMode={isSmallMode}
        title={title}
        iconUrl={iconUrl || chatBotDefaultIcon}
        onContinueChat={() => window.open(`/embed/chatbot/${appId}/${chatbotId}?share=${conversationId}`)}
        onCopyLink={() => {
          const link = `${window.location.origin}/public/chatbot/${id}`;
          copy(link);
          alert(_l('复制成功'));
        }}
      />
      {renderContent({ title, chatbotId, conversationId })}
      {isSmallMode && (
        <Header
          error={share.resultCode !== 1}
          isSmallMode={isSmallMode}
          isShare
          isFooter
          onContinueChat={() => window.open(`/embed/chatbot/${appId}/${chatbotId}?share=${conversationId}`)}
          onCopyLink={() => {
            const link = `${window.location.origin}/public/chatbot/${id}`;
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
