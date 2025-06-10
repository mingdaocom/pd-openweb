import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import LoadDiv from 'ming-ui/components/LoadDiv';
import ScrollView from 'ming-ui/components/ScrollView';
import { htmlDecodeReg, htmlEncodeReg } from 'src/utils/common';
import * as ajax from '../../utils/ajax';
import Constant from '../../utils/constant';

const format = (keyword, messages) => {
  return messages.map(item => {
    item.time = item.time.replace(/(^.*)(:\d\d\..*$)/, '$1');
    item.content = highlightMessageText(keyword, item.msg.con);
    return item;
  });
};

const highlightMessageText = (keyword, message) => {
  message = htmlDecodeReg(message);
  const ellipsisIndex = 25;
  const firstIndex = message.indexOf(keyword);
  if (firstIndex > ellipsisIndex) {
    message = '...' + message.slice(firstIndex - ellipsisIndex);
  }
  const reg = new RegExp(_.escapeRegExp(keyword), 'g');
  message = htmlEncodeReg(message.replace(reg, '*#span1#*' + keyword + '*#span2#*'));
  message = message.replace(/\*#span1#\*/g, '<span class="ThemeColor3">').replace(/\*#span2#\*/g, '</span>');
  return message;
};

export default class Messages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      pageIndex: 1,
      messages: [],
    };
  }
  componentDidMount() {
    const { searchText } = this.props;
    this.updateMessages(searchText);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.searchText !== this.props.searchText) {
      this.setState(
        {
          loading: false,
          pageIndex: 1,
          messages: [],
        },
        () => {
          this.updateMessages(nextProps.searchText);
        },
      );
    }
  }
  updateMessages(searchText) {
    const { session } = this.props;
    const type = session.isGroup ? Constant.SESSIONTYPE_GROUP : Constant.SESSIONTYPE_USER;
    const { loading, pageIndex, messages } = this.state;
    if (loading || !pageIndex) {
      return;
    }
    this.setState({
      loading: true,
    });
    ajax
      .getMessage({
        id: session.id,
        type,
        page: pageIndex,
        keyword: searchText,
      })
      .then(res => {
        // res = res.reverse();
        this.setState({
          pageIndex: res && res.length >= 10 ? pageIndex + 1 : 0,
          loading: false,
          messages: format(searchText, messages.concat(res || [])),
        });
      });
  }
  handleScrollEnd() {
    const { searchText } = this.props;
    this.updateMessages(searchText);
  }
  renderMessage(message) {
    const { id, fromAccount, msg, time, content } = message;
    return (
      <div className="search-message" key={id} onClick={this.props.onGotoMessage.bind(this, message)}>
        <div className="search-message-info">
          <div className="userAvatar">
            <img src={fromAccount.logo} />
          </div>
          <div className="userName overflow_ellipsis">{fromAccount.name}</div>
          <div className="time">{time}</div>
        </div>
        <div className="search-message-content" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  }
  render() {
    const { messages, loading } = this.state;
    return (
      <ScrollView
        className="ChatPanel-SearchPanelContent ChatPanel-SearchPanel-Message"
        onScrollEnd={this.handleScrollEnd.bind(this)}
      >
        {messages.map(item => this.renderMessage(item))}
        <LoadDiv className={cx('loading', { Hidden: !loading })} size="small" />
        {!loading && !messages.length ? (
          <div className="nodata-wrapper">
            <div className="nodata-img" />
            <p>{_l('无匹配结果')}</p>
          </div>
        ) : undefined}
      </ScrollView>
    );
  }
}
