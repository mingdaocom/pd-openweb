import React from 'react';
import { Icon, UserCard, UserHead } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';

export default function OtherUserList({ onDelete, users }) {
  return users.map(user => (
    <div className="addOtherUser boxSizing" data-id={user.accountID} key={user.accountID}>
      <UserCard sourceId={user.accountID}>
        <span className="addOtherUserHeadImg circle pointer">
          <UserHead user={{ userHead: user.avatar, accountId: user.accountID }} size={24} />
        </span>
      </UserCard>
      <span className="textSecondary">{user.fullName}</span>
      <Button
        className="addOtherUserDelImg textSecondary"
        type="text"
        size="small"
        icon={<Icon icon="delete" />}
        title={_l('删除')}
        onClick={() => onDelete(user.accountID)}
      />
    </div>
  ));
}
