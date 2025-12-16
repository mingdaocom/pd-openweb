import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import DragMask from 'worksheet/common/DragMask';
import 'src/pages/chat/containers/ChatList/index.less';
import ChatPanel from 'src/pages/chat/containers/ChatPanel';
import nodataPng from 'src/pages/chat/containers/SessionList/resource/nodata.png';
import SessionListDrawer from 'src/pages/chat/containers/SessionListDrawer';
import * as socket from 'src/pages/chat/utils/socketEvent';

const Wrap = styled.div`
  .sessionListWrap {
    border-right: 1px solid #ddd;
  }
  .noSession {
    height: 92px;
    width: 100px;
    background: url(${nodataPng});
    transform: scale(1.2);
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
    border-left: 1px solid #ddd;
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
    socket.socketInitEvent.call(this);
  }
  render() {
    const { sessionListWidth, dragMaskVisible } = this.state;
    return (
      <Wrap className="flexRow w100 h100 overflowHidden">
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
        <div className="flex GrayBGFA Relative">
          <ChatPanel embed={true} />
          <div className="flexRow alignItemsCenter justifyContentCenter h100">
            <div className="noSession" />
          </div>
        </div>
      </Wrap>
    );
  }
}
