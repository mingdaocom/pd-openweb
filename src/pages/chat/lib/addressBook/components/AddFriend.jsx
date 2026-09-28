import React from 'react';
import { Icon } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import { addFriendConfirm } from 'ming-ui/functions';

export default class AddFriend extends React.Component {
  render() {
    return (
      <div className="contacts-add-friend">
        <Icon icon={'error1'} className="contacts-add-friend-icon" />
        <div className="Font16 mBottom25">{_l('对方不是您的联系人，无法查看')}</div>
        <Button
          type="primary"
          onClick={() => {
            addFriendConfirm({
              accountId: this.props.accountId,
            });
          }}
        >
          {_l('加为好友')}
        </Button>
      </div>
    );
  }
}
