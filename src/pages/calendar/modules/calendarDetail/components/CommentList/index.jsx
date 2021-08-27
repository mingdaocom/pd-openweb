import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CheckBox from 'ming-ui/components/Checkbox';
import Commenter from 'commenter';
import CommentList from 'commentList';
import { htmlDecodeReg } from 'src/util';
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
      onSubmit: data => {
        change({ discussions: (data ? [data] : []).concat(discussions) });
      },
    };

    return (
      <div className="pBottom10">
        <CheckBox
          className="mBottom8 pTop5 mTop5"
          checked={isOnlyMe}
          onClick={checked => {
            this.handleFocusClick.bind(this)(checked);
          }}
        >
          <span className="Gray_9">{_l('只显示与我相关')}</span>
        </CheckBox>
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
