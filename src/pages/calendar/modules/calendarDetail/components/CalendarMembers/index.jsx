import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Member from './member';
import Icon from 'ming-ui/components/Icon';
import _ from 'lodash';

export default class CalendarMembers extends Component {
  renderWxMembers() {
    const { thirdUser, bindBusinessCard } = this.props;
    const memberOtherProps = { bindBusinessCard };
    return (
      <div className="membersContainer">
        {thirdUser.map(m => {
          return <Member isCreateUser={false} isWxMember={true} member={m} thirdUser={thirdUser} key={m.thirdID} {...memberOtherProps} />;
        })}
      </div>
    );
  }

  render() {
    const { members, thirdUser, createUser, editable, addCalendarMember, bindBusinessCard } = this.props;
    const creator = _.find(members, m => m.accountID === createUser);
    const others = _.filter(members, m => m.accountID !== createUser);
    const memberOtherProps = { bindBusinessCard };
    return (
      <div className="calendarMember calRow">
        <Icon icon={'group'} className="Font18 calIcon" />
        <div className="memberBox">
          <Member isCreateUser={true} member={creator} {...memberOtherProps} />
          <div className="membersContainer">
            {others.map(m => {
              return <Member isCreateUser={false} member={m} key={m.accountID} {...memberOtherProps} />;
            })}
            {editable ? (
              <span onClick={addCalendarMember} className="addCalendarMember ThemeHoverColor3">
                <Icon icon={'task-add-member-circle'} className="Font26 mRight15 addBtn" />
                {_l('添加参与者')}
              </span>
            ) : null}
          </div>
          {/* weixin members */}
          {thirdUser && thirdUser.length ? <div>{_l('通过日程分享加入的用户')}</div> : null}
          {thirdUser && thirdUser.length ? this.renderWxMembers() : null}
        </div>
      </div>
    );
  }
}
