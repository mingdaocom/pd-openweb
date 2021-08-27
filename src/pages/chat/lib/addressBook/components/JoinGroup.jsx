import React from 'react';

import Icon from 'ming-ui/components/Icon';
import Button from 'ming-ui/components/Button';

import { joinGroup } from '../api';

export default class JoinGroup extends React.Component {
  render() {
    const { groupId } = this.props;
    return (
      <div className="contacts-add-friend">
        <Icon icon={'task-folder-message'} className="contacts-add-friend-icon" />
        <div className="Font16 mBottom25">{_l('此群组需加入后才可访问')}</div>
        <Button type="primary" size="medium" action={() => joinGroup(groupId)}>
          {_l('申请加入此群组')}
        </Button>
      </div>
    );
  }
}
