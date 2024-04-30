import React from 'react';
import { UserHead } from 'ming-ui';
import styled from 'styled-components';

const UserHeadWrap = styled(UserHead)`
  display: inline-block !important;
  font-size: 0;
  line-height: 24px;
`;

export default class PeopleAvatar extends React.Component {
  render() {
    const { user = [] } = this.props;

    return (
      <UserHeadWrap
        className="avatar"
        accountId={user.targetId}
        user={{
          userHead: user.peopleAvatar,
          accountId: user.targetId,
        }}
        size={24}
      />
    );
  }
}
