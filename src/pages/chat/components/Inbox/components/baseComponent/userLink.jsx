import React from 'react';
import { UserCard } from 'ming-ui';

export default class UserLink extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props,
    };
  }

  render() {
    const { accountId, fullname } = this.props;

    return (
      <UserCard sourceId={accountId}>
        <a
          ref={elem => {
            this.card = elem;
          }}
        >
          {fullname}
        </a>
      </UserCard>
    );
  }
}
