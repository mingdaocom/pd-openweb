import React, { useEffect } from 'react';
import { Icon } from 'ming-ui';
import store from 'redux/configureStore';
import cx from 'classnames';
import functionWrap from 'ming-ui/components/FunctionWrap';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import styled from 'styled-components';
import _ from 'lodash';
import ChatBox from './index';

const Wrapper = styled.div`
  position: fixed;
  right: 76px;
  bottom: 10px;
  width: 800px;
  height: 600px;
  background: #fff;
  box-shadow: 0 3px 10px 2px rgba(0, 0, 0, 0.16), 0 5px 20px 4px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  z-index: 100;
  display: none;
  transform: translateY(800px);
  transition: all 0.3s;
  &.open {
    right: 240px;
  }
  .chatHeader {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 17px;
    font-weight: bold;
    padding: 0 16px;
    border-bottom: 1px solid #ddd;
    box-sizing: border-box;
  }
`;

const ClickAwayable = createDecoratedComponent(withClickAway);

function AssistantChatBox(props) {
  const { onClose, assistantId, name } = props;
  const { visible } = store.getState().chat;

  useEffect(() => {
    $('#assistantChatBox').show();
    setTimeout(() => {
      $('#assistantChatBox').css({ transform: 'none' });
    }, [0]);
  }, []);

  return (
    <ClickAwayable onClickAway={onClose}>
      <Wrapper id="assistantChatBox" className={cx({ open: visible })}>
        <div className="flexColumn h100">
          <div className="chatHeader">
            <div>{name || _l('未命名助手')}</div>
            <Icon icon="close" className="pointer Gray_9e ThemeHoverColor3 Font19" onClick={onClose} />
          </div>

          <ChatBox className="flex" assistantId={assistantId} />
        </div>
      </Wrapper>
    </ClickAwayable>
  );
}

export default props => functionWrap(AssistantChatBox, { ...props });
