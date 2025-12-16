import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import moment from 'moment';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import mingoApi from 'src/api/mingo';
import Header from './common/Header';
import Mingo from './common/Mingo';

const Con = styled.div`
  width: 100%;
  height: 100%;
  background-color: #fff;
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
    color: #151515;
  }
  .updateTime {
    margin-top: 6px;
    font-size: 13px;
    color: #757575;
  }
  &.isSmallMode {
    padding-top: 2px;
  }
`;

const MingoShareLand = props => {
  const isSmallMode = window.innerWidth < 880;
  const { match, history } = props;
  const params = match ? match.params : {};
  const chatId = params.chatId;
  const [infoLoading, setInfoLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  useEffect(() => {
    window.isMingoShare = true;
    window.reactRouterHistory = history;
    document.title = _l('HAP助手');
    mingoApi.getChat({ chatId }).then(data => {
      if (!data) {
        setError(_l('聊天已删除'));
        setInfoLoading(false);
        return;
      }
      setInfo(data);
      setInfoLoading(false);
    });
  }, []);
  const onCopyLink = () => {
    const link = `${window.location.origin}/mingo/share/${chatId}`;
    copy(link);
    alert(_l('复制成功'));
  };
  const onContinueChat = () => {
    window.open(`/mingo/chat/${chatId}?from=share`, '_blank');
  };
  return (
    <Con className="t-flex t-flex-col">
      <Header error={error} isSmallMode={isSmallMode} isShare onCopyLink={onCopyLink} onContinueChat={onContinueChat} />
      {!error ? (
        <div className="t-flex-1 t-flex t-flex-row t-overflow-hidden">
          <MingoShare
            isSmallMode={isSmallMode}
            currentChatId={chatId}
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
      {isSmallMode && (
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
