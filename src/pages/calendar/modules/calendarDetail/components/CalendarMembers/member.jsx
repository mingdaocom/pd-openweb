import React, { Component } from 'react';
import { MEMBER_STATUS } from '../../constant';
import UserCard from 'src/components/UserCard';
export default class Member extends Component {
  render() {
    const {
      member: { head, memberName, status, face, nickName, accountID, thirdID },
      isCreateUser,
      isWxMember,
      editable,
      callback,
      argProps,
    } = this.props;

    const operation = (
      <div className="messageDivBtn clearfix">
        <span
          className={accountID === md.global.Account.accountId ? 'messageDivExit' : 'messageDivRemove'}
          onClick={() => {
            if (accountID === md.global.Account.accountId) {
              callback.removeMember(accountID, argProps);
            } else {
              isWxMember ? callback.removeWxMember(thirdID, argProps) : callback.removeMember(accountID, argProps);
            }
          }}
        >
          {accountID === md.global.Account.accountId ? _l('退出本日程') : _l('移出本日程')}
        </span>
        {status !== MEMBER_STATUS.CONFIRMED && !isWxMember && !isCreateUser && (
          <span className="messageDivPerson" onClick={() => callback.reInvite(accountID, argProps)}>
            {_l('重新发送邀请')}
          </span>
        )}
      </div>
    );
    return (
      <UserCard
        className="calendarBusinessCard"
        sourceId={accountID || thirdID}
        data={{
          avatar: head || face,
          fullname: memberName || nickName,
          accountId: md.global.Account.accountId,
          status: 3,
          companyName: _l('来自微信邀请'),
        }}
        operation={!isCreateUser && editable ? operation : null}
      >
        <span
          className="memberItem"
          ref={el => {
            this.memberItem = el;
          }}
        >
          {!isWxMember ? (
            <img
              src={head ? head.replace(/\/w\/(\w+)\/h\/(\w+)/, '/w/26/h/26') : ''}
              alt={memberName}
              className="memberAvatar"
            />
          ) : (
            <img src={face} alt={nickName} className="memberAvatar" />
          )}
          {(() => {
            if (isCreateUser) return null;
            if (isWxMember) return <span className="memberStatus confirmed" />;
            switch (status) {
              case MEMBER_STATUS.UNCONFIRMED:
              default:
                return <span className="memberStatus unConfirmed" />;
              case MEMBER_STATUS.CONFIRMED:
                return <span className="memberStatus confirmed" />;
              case MEMBER_STATUS.REFUSED:
                return <span className="memberStatus refused" />;
            }
          })()}
          {!isWxMember ? (
            <span className="memberName">{memberName}</span>
          ) : (
            <span className="memberName">{nickName}</span>
          )}
          {isCreateUser ? <span>{_l('（发起人）')}</span> : null}
        </span>
      </UserCard>
    );
  }
}
