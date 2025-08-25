import React from 'react';
import styled from 'styled-components';
import { UserHead } from 'ming-ui';

const UserHeadWrap = styled(UserHead)`
  display: inline-block !important;
  font-size: 0;
  line-height: 24px;
`;

export default class PeopleAvatar extends React.Component {
  render() {
    const { user = {}, projectId } = this.props;

    return (
      <UserHeadWrap
        className="avatar"
        accountId={user.targetId}
        projectId={projectId}
        user={{
          userHead: user.peopleAvatar,
          accountId: user.targetId,
        }}
        size={24}
      />
    );
  }
}
