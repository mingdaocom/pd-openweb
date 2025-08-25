import React, { Component } from 'react';
import _ from 'lodash';
import Icon from 'ming-ui/components/Icon';
import Member from './member';

export default class CalendarMembers extends Component {
  renderWxMembers() {
    const { thirdUser, editable, callback, argProps } = this.props;
    const memberOtherProps = { editable, callback, argProps };
    return (
      <div className="membersContainer">
        {thirdUser.map(m => {
          return (
            <Member
              isCreateUser={false}
              isWxMember={true}
              member={m}
              thirdUser={thirdUser}
              key={m.thirdID}
              {...memberOtherProps}
            />
          );
        })}
      </div>
    );
  }

  render() {
    const { members, thirdUser, createUser, editable, addCalendarMember, callback, argProps } = this.props;
    const creator = _.find(members, m => m.accountID === createUser);
    const others = _.filter(members, m => m.accountID !== createUser);
    const memberOtherProps = { editable, callback, argProps };
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
                {_l('添加出席者')}
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
