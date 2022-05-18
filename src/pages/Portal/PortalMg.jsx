import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import 'src/pages/chat/containers/ChatPanel/index.less';
import * as actions from 'src/pages/chat/redux/actions';
import * as socket from 'src/pages/chat/utils/socket';
import { Inbox } from 'src/pages/chat/components/Inbox';
import { browserIsMobile } from 'src/util';
import styled from 'styled-components';
const Wrap = styled.div`
  .back {
    height: 50px;
    line-height: 50px;
  }
  .ChatPanel-inbox-portalCon.isM {
    height: calc(100% - 50px);
  }
`;
const ClickAwayable = createDecoratedComponent(withClickAway);
@connect(state => {
  const { currentSession, currentSessionList, visible } = state.chat;
  return {
    currentSession,
    currentSessionList,
    visible,
  };
})
export default class PortalMg extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      isError: false,
    };
  }
  handleClosePanel = () => {
    const { currentSession } = this.props;
    if (currentSession.value) {
      this.props.dispatch(actions.setNewCurrentSession({}));
      socket.Contact.recordAction({ id: '' });
      socket.Contact.clearAllUnread();
    }
  };
  handleClickAway = e => {
    this.handleClosePanel();
    e.stopPropagation && e.stopPropagation();
  };
  render() {
    const { currentSession } = this.props;
    const exceptions = [
      '.dialogScroll',
      '.ant-modal',
      '.mdModal',
      '.ChatPanel-Trigger',
      '.attachmentsPreview',
      '.Tooltip',
      '.mui-dialog-container',
      '.mdAlertDialog',
      '.confirm',
      '.PositionContainer-wrapper',
      '.groupSettingAvatarSelect',
      '.ui-timepicker-list',
      '.businessCardSite',
      '.selectUserBox',
      '.warpDatePicker',
      '.dropdownTrigger',
      '.rc-trigger-popup',
      '.workflowStepListWrap',
      '.ant-select-dropdown',
      '.ant-cascader-menus',
      '.InboxFilterWrapper',
      '.ant-picker-dropdown',
    ];
    return (
      <ClickAwayable
        component="div"
        onClickAwayExceptions={exceptions}
        onClickAway={this.handleClickAway.bind(this)}
        className={cx('ChatPanel-wrapper ChatPanel-position tipBoxShadow portalChatPanel', {
          'ChatPanel-close': _.isEmpty(currentSession),
          'ChatPanel-small': window.innerHeight < 700,
          'ChatPanel-big': window.innerHeight > 2000,
          isMobile: browserIsMobile(),
        })}
      >
        {currentSession.iconType ? (
          <Wrap
            className={cx('ChatPanel ChatPanel-inbox', { flexColumn: md.global.Account.isPortal && browserIsMobile() })}
          >
            {md.global.Account.isPortal && browserIsMobile() ? (
              <React.Fragment>
                <span
                  className="Font17 Hand InlineBlock back pLeft16"
                  onClick={e => {
                    this.handleClickAway(e);
                  }}
                >
                  <Icon icon="backspace mRight8 Gray_9e" />
                  {_l('消息')}
                </span>
              </React.Fragment>
            ) : (
              <i
                onClick={e => {
                  this.handleClickAway(e);
                }}
                className="ChatPanel-inbox-close icon-close ThemeColor3"
              />
            )}
            <div className={cx('ChatPanel-inbox-portalCon', { isM: browserIsMobile() })}>
              <Inbox inboxType={currentSession.iconType} count={currentSession.count} />
            </div>
          </Wrap>
        ) : (
          ''
        )}
      </ClickAwayable>
    );
  }
}
