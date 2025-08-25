import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { ScrollView } from 'ming-ui';
import Announcement from '../../components/Announcement';
import DiscussionAnnouncement from '../../components/DiscussionAnnouncement';
import Feeds from '../../components/Feeds';
import FeedsPanel from '../../components/Feeds/Panel';
import FilesPanel from '../../components/Files/Panel';
import Members from '../../components/Members';
import MembersPanel from '../../components/Members/Panel';
import SearchPanel from '../../components/SearchPanel';
import * as actions from '../../redux/actions';
import * as utils from '../../utils';

class ChatPanelSessionInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      panelType: '',
      panelVisible: false,
    };
    this.first = this.props.infoVisible;
  }
  componentWillReceiveProps(nextProps) {
    // 展开和收起
    if (nextProps.infoVisible) {
      this.first = true;
    } else {
      const { panelVisible } = this.state;
      if (panelVisible) {
        this.setState({
          panelType: '',
          panelVisible: false,
        });
      }
    }
    // 搜索聊天&文件&成员
    if (nextProps.searchText) {
      this.setState({
        panelVisible: true,
        panelType: 'search',
      });
    } else {
      const { panelType } = this.state;
      if (panelType === 'search') {
        this.setState({
          panelVisible: false,
          panelType: '',
        });
      }
    }
    // 打开文件
    if (nextProps.isOpenFile) {
      this.setState({
        panelVisible: true,
        panelType: 'files',
      });
    } else {
      const { panelType } = this.state;
      if (panelType === 'files' && nextProps.searchText == '') {
        this.setState({
          panelVisible: false,
          panelType: '',
        });
      }
    }
  }
  handleSetPanelVisible(panelType, panelVisible) {
    if (!panelVisible) {
      panelType = '';
    }
    this.setState({
      panelType,
      panelVisible,
    });
  }
  handleGotoMessage(message) {
    const { id } = message;
    const { session } = this.props;
    this.props.dispatch(actions.setGotoMessage(session.id, id));
  }
  handleOpenSession(user) {
    const { accountId, fullname, avatar } = user;
    const { isWindow } = this.props;
    if (isWindow) {
      utils.windowOpen(accountId, fullname, false);
    } else {
      const msg = {
        logo: avatar,
        uname: fullname,
        sysType: 1,
      };
      this.props.dispatch(actions.addUserSession(accountId, msg));
    }
  }
  render() {
    const { session, infoVisible, searchText } = this.props;
    const { panelType, panelVisible } = this.state;
    return (
      <div className={cx('ChatPanel-sessionInfo', { hidden: !infoVisible })}>
        <ScrollView className="flex">
          {session.isPost && this.first && (
            <Announcement
              session={session}
              updateGroupAbout={value => {
                this.props.dispatch(actions.updateGroupAbout(session.groupId, value));
              }}
            />
          )}

          {session.isGroup && this.first && (
            <Members session={session} onSetPanelVisible={this.handleSetPanelVisible.bind(this, 'members')} />
          )}

          {session.isPost && this.first && (
            <Feeds session={session} onSetPanelVisible={this.handleSetPanelVisible.bind(this, 'feeds')} />
          )}

          {!session.isPost && this.first && (
            <DiscussionAnnouncement
              session={session}
              onSetPanelVisible={this.handleSetPanelVisible.bind(this, 'feeds')}
              onChangeIsPost={projectId => {
                this.props.dispatch(actions.resetGroupIsPost(session.groupId, projectId));
              }}
            />
          )}
        </ScrollView>
        <div className={cx('ChatPanel-sessionInfoPanel', { hidden: !panelVisible })}>
          {panelType === 'members' ? (
            <MembersPanel
              onOpenSession={this.handleOpenSession.bind(this)}
              session={session}
              onSetPanelVisible={this.handleSetPanelVisible.bind(this, 'members')}
            />
          ) : undefined}
          {panelType === 'feeds' ? (
            <FeedsPanel session={session} onSetPanelVisible={this.handleSetPanelVisible.bind(this, 'feeds')} />
          ) : undefined}
          {panelType === 'files' ? <FilesPanel session={session} /> : undefined}
          {panelType === 'search' ? (
            <SearchPanel
              onOpenSession={this.handleOpenSession.bind(this)}
              session={session}
              onSetPanelVisible={this.handleSetPanelVisible.bind(this, 'search')}
              onGotoMessage={this.handleGotoMessage.bind(this)}
              searchText={searchText}
            />
          ) : undefined}
        </div>
      </div>
    );
  }
}

export default connect(state => {
  const { currentSession, currentSessionList, isWindow } = state.chat;

  return {
    currentSession,
    currentSessionList,
    isWindow,
  };
})(ChatPanelSessionInfo);
