import React, { useCallback, useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { navigateTo } from 'src/router/navigateTo';
import { emitter } from 'src/utils/common';
import Header from './common/Header';
import Mingo from './common/Mingo';
import { ExpandIcon } from './common/Side';
import Side from './common/Side';

const Con = styled.div`
  width: 100%;
  height: 100%;
  background-color: #fff;
`;

const hideHeader = window.hideHeader || new URL(location.href).searchParams.get('header') === '0';
if (hideHeader) {
  window.hideHeader = true;
}

const MingoLand = withRouter(props => {
  const isSmallMode = window.innerWidth < 880;
  const { match, history } = props;
  const params = match ? match.params : {};
  const [currentChatId, setCurrentChatId] = useState(params.chatId);
  const [sideVisible, setSideVisible] = useState(true);
  const [expandIconVisible, setExpandIconVisible] = useState(false);
  const mingoRef = useRef(null);
  useEffect(() => {
    setCurrentChatId(params.chatId);
  }, [params.chatId]);
  useEffect(() => {
    window.reactRouterHistory = history;
    document.title = _l('HAP助手');
  }, []);
  const handleNewChatClick = useCallback(() => {
    navigateTo(`/mingo`);
  }, []);
  useEffect(() => {
    setTimeout(
      () => {
        setExpandIconVisible(!sideVisible);
      },
      sideVisible ? 0 : 300,
    );
  }, [sideVisible]);
  return (
    <Con className="t-flex t-flex-col">
      {!hideHeader && <Header isSmallMode={isSmallMode} />}
      <div className="t-flex-1 t-flex t-flex-row t-overflow-hidden Relative">
        {!isSmallMode && expandIconVisible && (
          <ExpandIcon
            className="expand-icon t-flex t-items-center t-justify-center un-expand"
            onClick={() => {
              setSideVisible(true);
            }}
          >
            <i className="icon icon-menu_right"></i>
          </ExpandIcon>
        )}
        {!isSmallMode && (
          <Side
            visible={sideVisible}
            emitter={emitter}
            currentChatId={currentChatId}
            onSelect={chatItem => {
              navigateTo(`/mingo/chat/${chatItem.chatId}${hideHeader ? '?header=0' : ''}`);
            }}
            handleNewChatClick={handleNewChatClick}
            onExpand={() => {
              setSideVisible(!sideVisible);
            }}
          />
        )}
        <Mingo
          isSmallMode={isSmallMode}
          emitter={emitter}
          ref={mingoRef}
          className="t-flex-1"
          currentChatId={currentChatId}
          onNewChatClick={handleNewChatClick}
          hideHeader={hideHeader}
        />
      </div>
    </Con>
  );
});

MingoLand.propTypes = {
  match: PropTypes.shape({}),
  history: PropTypes.shape({}),
};

export default MingoLand;
