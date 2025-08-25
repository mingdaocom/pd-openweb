import React, { Component } from 'react';
import { connect } from 'react-redux';
import qs from 'query-string';
import Feed from './components/app/feed';
import postEnum from './constants/postEnum';
import { changeListType, changeTitle } from './redux/postActions';

@connect()
export default class CalendarEntrypoint extends Component {
  componentDidMount() {
    $('html').addClass('AppFeed');
    this.handleUpdate();
  }
  componentDidUpdate() {
    this.handleUpdate();
  }
  componentWillUnmount() {
    $('html').removeClass('AppFeed');
  }
  handleUpdate() {
    const data = qs.parse(this.props.location.search.slice(1));
    const options = Object.assign({}, data, {
      listType: data.listType || postEnum.LIST_TYPE.project,
      groupId: data.groupId || data.groupID || null,
      accountId: data.accountId || data.accountID || null,
      tagId: data.tagId || data.tagID || null,
      catId: data.catId || data.catID || null,
    });
    delete options.groupID;
    delete options.accountID;
    delete options.tagID;
    delete options.catID;

    if (options.listType === postEnum.LIST_TYPE.project) {
      if (options.accountId) {
        options.listType = 'user';
      } else if (options.groupId) {
        options.listType = 'group';
      }
    }
    this.props.dispatch(changeListType(options));
    // TODO: 添加 account store 后从 accountInfo 里获取姓名，去掉 changeTitle
    this.props.dispatch(changeTitle(null));
  }
  render() {
    return <Feed />;
  }
}
