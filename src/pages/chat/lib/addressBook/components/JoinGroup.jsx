import React from 'react';
import { Button } from 'ming-ui/antd-components';
import Icon from 'ming-ui/components/Icon';
import { joinGroup } from '../api';

export default class JoinGroup extends React.Component {
  state = { joining: false };

  componentWillUnmount() {
    this.unmounted = true;
  }

  handleJoin = () => {
    if (this.joinPending) return;

    this.joinPending = true;
    this.setState({ joining: true });

    return Promise.resolve()
      .then(() => joinGroup(this.props.groupId))
      .catch(error => console.error(error))
      .finally(() => {
        this.joinPending = false;
        if (!this.unmounted) {
          this.setState({ joining: false });
        }
      });
  };

  render() {
    return (
      <div className="contacts-add-friend">
        <Icon icon={'error1'} className="contacts-add-friend-icon" />
        <div className="Font16 mBottom25">{_l('此群组需加入后才可访问')}</div>
        <Button type="primary" loading={this.state.joining} onClick={this.handleJoin}>
          {_l('申请加入此群组')}
        </Button>
      </div>
    );
  }
}
