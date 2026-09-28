import React, { Component } from 'react';
import cx from 'classnames';
import * as ajax from '../../utils/ajax';
import Constant from '../../utils/constant';
import Files from './Files';
import Members from './Members';
import Messages from './Messages';
import './index.less';

const formatMatchedTab = (res, isGroup, isFileTrsnsfer) => {
  const tab = [
    {
      title: isFileTrsnsfer ? _l('文字消息') : _l('聊天记录'),
      count: res.matchedMessageCount,
      type: 'message',
    },
    {
      title: _l('文件'),
      count: res.matchedFileCount,
      type: 'file',
    },
    {
      title: _l('成员'),
      count: res.matchedMemberCount,
      type: 'member',
    },
  ];

  // 个人聊天没有成员
  if (!isGroup) {
    delete tab[2];
  }

  return tab.sort((a, b) => {
    return b.count - a.count;
  });
};

export default class SearchPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      tabIndex: 0,
      tab: [],
      type: '',
    };
  }
  componentDidMount() {
    this.updateTabCount(this.props.searchText);
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.searchText) {
        this.updateTabCount(this.props.searchText);
      }
    }
  }
  updateTabCount(searchText) {
    const { session } = this.props;
    const isFileTrsnsfer = session.id === Constant.FILE_TRANSFER.id;
    const param = {
      keywords: searchText,
      [session.isGroup ? 'groupId' : 'withUser']: session.id,
    };
    ajax.getCountByTabName(param).then(result => {
      result = formatMatchedTab(result, session.isGroup, isFileTrsnsfer);
      this.setState({
        tab: result,
        tabIndex: 0,
        type: result[0].type,
      });
    });
  }
  handleSetTab(item, index) {
    const { type } = item;
    this.setState({
      tabIndex: index,
      type,
    });
  }
  renderTab() {
    const { tab, tabIndex } = this.state;
    return (
      <div className="ChatPanel-SearchPanelTab">
        {tab.map((item, index) => (
          <div className="item-box" key={index} onClick={this.handleSetTab.bind(this, item, index)}>
            <span className={cx('item', { borderColorPrimary: index === tabIndex, colorPrimary: index === tabIndex })}>
              {item.title}
              {`(${item.count >= 99 ? '99+' : item.count})`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  render() {
    const { type } = this.state;
    const { searchText, session } = this.props;
    return (
      <div className="ChatPanel-SearchPanel">
        {this.renderTab()}
        {type === 'message' ? (
          <Messages onGotoMessage={this.props.onGotoMessage} session={session} searchText={searchText} />
        ) : undefined}
        {type === 'file' ? (
          <Files onGotoMessage={this.props.onGotoMessage} session={session} searchText={searchText} />
        ) : undefined}
        {type === 'member' ? (
          <Members onOpenSession={this.props.onOpenSession} session={session} searchText={searchText} />
        ) : undefined}
      </div>
    );
  }
}
