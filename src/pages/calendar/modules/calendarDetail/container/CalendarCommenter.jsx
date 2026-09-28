import React, { Component } from 'react';
import cx from 'classnames';
import moment from 'moment';
import Icon from 'ming-ui/components/Icon';
import Commenter from 'src/components/comment/commenter';
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

export default class CalendarCommenter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showCount: true,
    };
  }

  render() {
    const {
      calendar: { id, title, discussions, recurTime },
      change,
      scrollToListTop,
    } = this.props;

    const recurTimeStr = recurTime ? moment(recurTime).format('YYYYMMDDHHmmss') : '';

    const props = {
      sourceId: id,
      sourceType: Commenter.TYPES.CALENDAR,
      appId: md.global.APPInfo.calendarAppID,
      remark: (recurTime ? id + '_' + recurTimeStr : id) + '|' + htmlDecodeReg(title) + '|' + _l('日程'),

      mentionsOptions: { position: 'top' },
      forReacordDiscussion: true,
      atData: getCalendarAtData(this.props.calendar),
      selectGroupOptions: { position: 'top' },
      storageId: id,
      onSubmit: discussion => {
        scrollToListTop();
        change({
          discussions: [discussion].concat(discussions),
        });
      },

      onFocusStateChange: isFocus => {
        this.setState({ showCount: !isFocus });
      },
    };
    return (
      <div className="calendarCommenter clearfix">
        <div className="Left">
          <img className="circle userAvatar" src={md.global.Account.avatar} />
        </div>
        {this.state.showCount ? (
          <div className="Right TxtCenter" style={{ width: '40px' }} onClick={() => {}}>
            <span className="calendarTopicCount hoverColorPrimary">
              <Icon icon="textsms" className="Font20 TxtMiddle Hand" />
            </span>
          </div>
        ) : null}
        <div className={cx('commenterBox', { mRight0: !this.state.showCount })}>
          <Commenter {...props} />
        </div>
      </div>
    );
  }
}
