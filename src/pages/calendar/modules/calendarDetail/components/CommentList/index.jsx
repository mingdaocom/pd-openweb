import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Checkbox } from 'ming-ui/antd-components';
import Commenter from 'src/components/comment/commenter';
import CommentList from 'src/components/comment/commentList';
import { htmlDecodeReg } from 'src/utils/core/string';

const getCalendarAtData = ({ createUser, members = [] }) => {
  const creator = members.find(member => member.accountID === createUser);
  const accountIds = new Set();

  return [creator, ...members.filter(member => member.accountID !== createUser)]
    .filter(Boolean)
    .map((member, index) => ({
      accountId: member.accountID,
      avatar: member.head?.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/1/w/48/h/48/q/90'),
      fullname: member.memberName,
      job: index === 0 && member.accountID === createUser ? _l('组织者') : _l('出席者'),
    }))
    .filter(({ accountId }) => {
      if (!accountId || accountId === md.global.Account.accountId || accountIds.has(accountId)) {
        return false;
      }

      accountIds.add(accountId);
      return true;
    })
    .slice(0, 20);
};

export default class CalendarCommentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOnlyMe: false,
    };

    this.updatePageIndex = this.updatePageIndex.bind(this);
  }

  // export method for parent component, bind context
  updatePageIndex(...args) {
    if (this.commentList) {
      this.commentList.updatePageIndex(...args);
    }
  }

  handleFocusClick(checked) {
    // toggle state and get first page topics
    this.setState({
      isOnlyMe: !checked,
    });
  }

  render() {
    const {
      calendar: { title, id, recurTime, discussions },
      change,
    } = this.props;
    const { isOnlyMe } = this.state;
    const recurTimeStr = recurTime ? moment(recurTime).format('YYYYMMDDHHmmss') : '';

    const props = {
      sourceId: id,
      sourceType: Commenter.TYPES.CALENDAR,
      appId: md.global.APPInfo.calendarAppID,
      remark: (recurTime ? id + '_' + recurTimeStr : id) + '|' + htmlDecodeReg(title) + '|' + _l('日程'),

      storageId: id,
      autoFocus: true,
      forReacordDiscussion: true,
      atData: getCalendarAtData(this.props.calendar),
      onSubmit: data => {
        change({ discussions: (data ? [data] : []).concat(discussions) });
      },
    };

    return (
      <div className="pBottom10">
        <Checkbox
          className="mBottom8 pTop5 mTop5"
          checked={isOnlyMe}
          onChange={event => {
            this.handleFocusClick.bind(this)(!event.target.checked);
          }}
        >
          <span className="textTertiary">{_l('只显示与我相关')}</span>
        </Checkbox>
        <CommentList
          sourceId={id}
          sourceType={CommentList.TYPES.CALENDAR}
          isFocus={isOnlyMe}
          commentList={discussions}
          updateCommentList={data => {
            change({ discussions: data });
          }}
          removeComment={_id => {
            change({
              discussions: _.filter(discussions, ({ discussionId }) => discussionId !== _id),
            });
          }}
          manualRef={comp => {
            this.commentList = comp;
          }}
        >
          <Commenter {...props} />
        </CommentList>
      </div>
    );
  }
}
