import React from 'react';

import Icon from 'ming-ui/components/Icon';
import Button from 'ming-ui/components/Button';

const AddFriendConfirm = require('addFriendConfirm');

export default class AddFriend extends React.Component {
  render() {
    return (
      <div className="contacts-add-friend">
        <Icon icon={'task-folder-message'} className="contacts-add-friend-icon" />
        <div className="Font16 mBottom25">{_l('对方不是您的联系人，无法查看')}</div>
        <Button
          type="primary"
          size="medium"
          onClick={() => {
            new AddFriendConfirm({
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
