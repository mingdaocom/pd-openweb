import React, { Component } from 'react';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import DragMask from 'worksheet/common/DragMask';
import 'src/pages/chat/containers/ChatList/index.less';
import ChatPanel from 'src/pages/chat/containers/ChatPanel';
import SessionListDrawer from 'src/pages/chat/containers/SessionListDrawer';
import * as socket from 'src/pages/chat/utils/socketEvent';
import globalEvents from 'src/router/globalEvents';

const Wrap = styled.div`
  .sessionListWrap {
    border-right: 1px solid var(--color-border-primary);
  }
  .ChatPanel-header .icon-maximizing_a {
    display: none;
  }
  .ChatPanel-sessionInfo {
    width: 320px;
  }
  .SessionList-item:first-child {
    margin-top: 0;
  }
  .personalStatus,
  .personalStatus .remark {
    flex: 1;
    min-width: 0;
  }
`;

const Drag = styled.div(
  ({ left }) => `
  position: absolute;
  z-index: 99;
  left: ${left}px;
  width: 2px;
  height: 100%;
  cursor: ew-resize;
  &:hover {
    border-left: 1px solid var(--color-border-primary);
  }
`,
);

@connect()
export default class WindowChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sessionListWidth: Number(localStorage.getItem(`windowChatSessionListWidth`)) || 280,
      dragMaskVisible: false,
    };
  }
  componentDidMount() {
    globalEvents();
    socket.socketInitEvent.call(this);
    document.body.addEventListener('keydown', this.closeChatPanel);
  }
  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.closeChatPanel);
  }
  closeChatPanel = e => {
    if ((e.key === 'Escape' || e.keyCode === 26) && _.isEmpty(window.closeFns)) {
      const closeEl = document.querySelector('.ChatPanel .icon-close');
      closeEl && closeEl.click();
    }
  };
  render() {
    const { sessionListWidth, dragMaskVisible } = this.state;
    return (
      <Wrap className="flexRow w100 h100 overflowHidden">
        <DocumentTitle title={_l('消息')} />
        <div className="flexRow sessionListWrap" style={{ width: sessionListWidth }}>
          <SessionListDrawer embed={true} />
        </div>
        {dragMaskVisible && (
          <DragMask
            value={sessionListWidth}
            min={280}
            max={580}
            onChange={value => {
              localStorage.setItem(`windowChatSessionListWidth`, value);
              this.setState({
                sessionListWidth: value,
                dragMaskVisible: false,
              });
            }}
          />
        )}
        <Drag
          left={sessionListWidth}
          onMouseDown={() => {
            this.setState({ dragMaskVisible: true });
          }}
        />
        <div className="flex bgSecondary Relative">
          <ChatPanel embed={true} />
          <div className="flexRow alignItemsCenter justifyContentCenter h100">
            <Icon icon="chat-full" className="textDisabled" style={{ fontSize: 100 }} />
          </div>
        </div>
      </Wrap>
    );
  }
}
