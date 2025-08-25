import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import styled from 'styled-components';
import * as actions from 'src/pages/chat/redux/actions';
import * as ajax from 'src/pages/chat/utils/ajax';
import * as socketEvent from 'src/pages/chat/utils/socketEvent.js';
import PortalMg from 'src/pages/Portal/PortalMg.jsx';
import { getAppFeaturesVisible } from 'src/utils/app';
import './index.less';

const Wrap = styled.div`
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: #fff;
  margin-right: 15px;
  .unread {
    position: absolute;
    border-radius: 8px;
    text-align: center;
    line-height: 12px;
    background-color: #fff;
    z-index: 1;
    left: 22px;
    top: 50%;
    padding: 1px 5px;
    transform: translate(0px, -100%);
    font-size: 12px;
    &.isMobile {
      background-color: red;
    }
  }
  .isMobile {
    color: #9e9e9e;
  }
`;

class PortalMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
    };
  }
  componentDidMount() {
    // 注册事件
    socketEvent.socketInitEvent.call(this);
    this.getChatCount();
  }
  componentWillReceiveProps(nextProps) {
    const { sessionList = [] } = nextProps;
    const count = (sessionList.find(o => o.value === 'worksheet') || {}).count;
    const countProps = ((this.props.sessionList || []).find(o => o.value === 'worksheet') || {}).count;
    if (count > 0 && countProps !== count) {
      this.setState({
        count,
      });
    }
  }
  getChatCount = () => {
    ajax
      .chatSessionList({
        pageIndex: 1,
        pageSize: 100,
      })
      .then(sessionList => {
        const count = (sessionList.find(o => o && o.value === 'worksheet') || {}).count;
        if (count > 0) {
          this.setState({
            count,
          });
        }
      });
  };
  render() {
    const { rp } = getAppFeaturesVisible();
    const { isMobile, color } = this.props;
    const { count = 0 } = this.state;
    return (
      <React.Fragment>
        <Wrap
          onClick={() => {
            this.setState(
              {
                count: 0,
              },
              () => {
                this.props.dispatch(
                  actions.setNewCurrentSession({
                    id: 'worksheet',
                    value: 'worksheet',
                    iconType: 'worksheet',
                  }),
                );
              },
            );
          }}
        >
          {count > 0 && (
            <div className={cx('unread Hand', { isMobile })} style={{ color: isMobile ? '#fff' : color }}>
              {count > 99 ? '99+' : count}
            </div>
          )}
          <i className={cx('icon icon-notifications Font20 Hand', { Gray_9e: isMobile })} onClick={() => {}}></i>
        </Wrap>
        <div id="chatPanel">{rp && <PortalMg />}</div>
      </React.Fragment>
    );
  }
}
export default connect(state => {
  const { currentSession, visible, sessionList } = state.chat;
  return {
    currentSession,
    visible,
    sessionList,
  };
})(PortalMessage);
