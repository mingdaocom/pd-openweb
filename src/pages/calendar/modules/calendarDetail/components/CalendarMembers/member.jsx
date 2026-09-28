import React, { Component } from 'react';
import { UserCard } from 'ming-ui';
import { Button, Flex, Tooltip } from 'ming-ui/antd-components';
import { MEMBER_STATUS } from '../../constant';

export default class Member extends Component {
  render() {
    const {
      member: { head, memberName, status, remark, face, nickName, accountID, thirdID },
      isCreateUser,
      isWxMember,
      editable,
      callback,
      argProps,
    } = this.props;
    const isCurrentAccount = accountID === md.global.Account.accountId;

    const operation = (
      <Flex className="w100" align="center" gap={5}>
        <Button
          block
          ellipsis
          danger
          onClick={() => {
            if (isCurrentAccount) {
              callback.removeMember(accountID, argProps);
            } else {
              isWxMember ? callback.removeWxMember(thirdID, argProps) : callback.removeMember(accountID, argProps);
            }
          }}
        >
          {isCurrentAccount ? _l('退出本日程') : _l('移出本日程')}
        </Button>
        {status !== MEMBER_STATUS.CONFIRMED && !isWxMember && !isCreateUser && (
          <Button
            block
            ellipsis
            color="primary"
            variant="outlined"
            onClick={() => callback.reInvite(accountID, argProps)}
          >
            {_l('重新发送邀请')}
          </Button>
        )}
      </Flex>
    );
    return (
      <span
        className="memberItem"
        ref={el => {
          this.memberItem = el;
        }}
      >
        <UserCard
          className="calendarBusinessCard"
          placement="bottomLeft"
          sourceId={accountID || thirdID}
          disabled={isWxMember}
          data={{
            avatar: head || face,
            fullname: memberName || nickName,
            accountId: md.global.Account.accountId,
            status: 3,
            companyName: _l('来自微信邀请'),
          }}
          operation={!isCreateUser && editable ? operation : null}
        >
          {!isWxMember ? (
            <img
              src={head ? head.replace(/\/w\/(\w+)\/h\/(\w+)/, '/w/100/h/100') : ''}
              alt={memberName}
              className="memberAvatar"
            />
          ) : (
            <img src={face} alt={nickName} className="memberAvatar" />
          )}
        </UserCard>
        {(() => {
          if (isCreateUser) return null;
          if (isWxMember) return <span className="memberStatus confirmed" />;
          switch (status) {
            case MEMBER_STATUS.CONFIRMED:
              return <span className="memberStatus confirmed" />;
            case MEMBER_STATUS.REFUSED:
              return (
                <Tooltip title={remark}>
                  <span className="memberStatus refused" />
                </Tooltip>
              );
            case MEMBER_STATUS.UNCONFIRMED:
            default:
              return <span className="memberStatus unConfirmed" />;
          }
        })()}
        {!isWxMember ? (
          <span className="memberName">{memberName}</span>
        ) : (
          <span className="memberName">{nickName}</span>
        )}
        {isCreateUser ? <span>{_l('（组织者）')}</span> : null}
      </span>
    );
  }
}
