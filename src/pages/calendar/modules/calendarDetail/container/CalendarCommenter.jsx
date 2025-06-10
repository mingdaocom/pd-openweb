import React, { Component } from 'react';
import cx from 'classnames';
import moment from 'moment';
import Icon from 'ming-ui/components/Icon';
import Commenter from 'src/components/comment/commenter';
import { htmlDecodeReg } from 'src/utils/common';

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
            <span className="calendarTopicCount ThemeHoverColor3">
              <Icon icon={'ic_textsms_black'} className="Font20 TxtMiddle Hand" />
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
