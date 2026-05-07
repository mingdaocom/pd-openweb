import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _, { get } from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import mingoApi from 'src/api/mingo';
import { SHARE_STATE, ShareState, VerificationPass } from 'worksheet/components/ShareState';
import RestrictAccessStatus from 'src/components/restrictAccessStatus';
import Header from './common/Header';
import Mingo from './common/Mingo';

const Con = styled.div`
  width: 100%;
  height: 100%;
  background-color: var(--color-background-primary);
  .scroll-viewport {
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    overscroll-behavior-y: contain;
  }
`;

const MingoShare = styled(Mingo)`
  width: 100%;
  .messageListContent {
    padding-bottom: 30px;
  }
`;

const MessageListHeader = styled.div`
  padding: 20px 0 6px;
  max-width: 880px;
  margin: 0 auto;
  .title {
    font-size: 26px;
    font-weight: bold;
    color: var(--color-text-primary);
  }
  .updateTime {
    margin-top: 6px;
    font-size: 13px;
    color: var(--color-text-secondary);
  }
  &.isSmallMode {
    padding-top: 2px;
  }
`;

const MingoShareLand = props => {
  const isSmallMode = window.innerWidth < 880;
  const { match, history } = props;
  const params = match ? match.params : {};
  const shareId = params.shareId;
  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState({});
  const [errorCode, setErrorCode] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const getEntityShareById = data => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await appManagementApi.getEntityShareById({ id: shareId, sourceType: 73, ...data });
        const clientId = _.get(result, 'data.clientId');
        window.clientId = clientId;
        clientId && sessionStorage.setItem(shareId, clientId);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  };

  const fetchChatInfo = chatId => {
    mingoApi.getChat({ sourceId: chatId }).then(data => {
      if (!data) {
        setError(_l('聊天已删除'));
        setInfoLoading(false);
        return;
      }

      setInfo(data);
      setInfoLoading(false);
    });
  };

  useEffect(() => {
    window.isMingoShare = true;
    window.reactRouterHistory = history;
    document.title = _l('HAP助手');
    window.callFromHelp = new URL(location.href).searchParams.get('help') === 'true';

    const clientId = sessionStorage.getItem(shareId);
    window.clientId = clientId;

    getEntityShareById({ clientId })
      .then(async result => {
        setShare(result);
        setLoading(false);

        if (result.resultCode === 1) {
          const chatIdFromShare = get(result, 'data.sourceId');
          setChatId(chatIdFromShare);
          fetchChatInfo(chatIdFromShare);
        }
      })
      .catch(err => {
        setLoading(false);
        setErrorCode(err.errorCode);
      });
  }, []);

  const onCopyLink = () => {
    const link = `${window.location.origin}/mingo/share/${shareId}`;
    copy(link);
    alert(_l('复制成功'));
  };

  const onContinueChat = () => {
    window.open(`/mingo/chat/${chatId}?from=share`, '_blank');
  };

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

  const renderContent = () => {
    if (share.resultCode === 1) {
      return (
        <React.Fragment>
          {!error ? (
            <div className="t-flex-1 t-flex t-flex-row t-overflow-hidden">
              <MingoShare
                isSmallMode={isSmallMode}
                currentChatId={info?.chatId}
                disabled
                infoLoading={infoLoading}
                messageListHeader={
                  !infoLoading ? (
                    <MessageListHeader className={cx({ isSmallMode })}>
                      <div className="title">{info.title}</div>
                      <div className="updateTime">{moment(info.updateTime).format('lll')}</div>
                    </MessageListHeader>
                  ) : null
                }
              />
            </div>
          ) : (
            <div className="t-flex-1 t-flex t-flex-row t-overflow-hidden t-items-center t-justify-center">
              {_l('该聊天记录不存在')}
            </div>
          )}
        </React.Fragment>
      );
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
                    const chatIdFromShare = get(data, 'data.sourceId');
                    setChatId(chatIdFromShare);
                    fetchChatInfo(chatIdFromShare);
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

  return (
    <Con className="t-flex t-flex-col">
      <Header
        error={error || share.resultCode !== 1}
        isSmallMode={isSmallMode}
        isShare
        onCopyLink={onCopyLink}
        onContinueChat={onContinueChat}
      />
      {renderContent()}
      {isSmallMode && !window.callFromHelp && share.resultCode === 1 && (
        <Header
          error={error}
          isSmallMode={isSmallMode}
          isShare
          isFooter
          onCopyLink={onCopyLink}
          onContinueChat={onContinueChat}
        />
      )}
    </Con>
  );
};

MingoShareLand.propTypes = {
  match: PropTypes.shape({}),
  history: PropTypes.shape({}),
};

export default MingoShareLand;
