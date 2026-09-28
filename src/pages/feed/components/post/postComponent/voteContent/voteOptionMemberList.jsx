import React from 'react';
import PropTypes from 'prop-types';
import { UserHead } from 'ming-ui';
import { Card, Flex } from 'ming-ui/antd-components';

const MEMBER_LIST_STYLE = {
  marginTop: 8,
  background: 'var(--color-background-tertiary)',
  borderColor: 'var(--color-border-secondary)',
};
const MEMBER_LIST_STYLES = { body: { padding: 8 } };

/**
 * 某条投票项的投票用户列表
 */
function VoteOptionMemberList({ members }) {
  return (
    <Card size="small" style={MEMBER_LIST_STYLE} styles={MEMBER_LIST_STYLES}>
      <Flex gap={4} wrap>
        {members.map(user => (
          <UserHead
            key={user.accountId}
            title={user.name}
            user={{ accountId: user.accountId, userHead: user.avatarSmall }}
            size={24}
          />
        ))}
      </Flex>
    </Card>
  );
}

VoteOptionMemberList.propTypes = {
  members: PropTypes.arrayOf(
    PropTypes.shape({
      accountId: PropTypes.string,
      name: PropTypes.string,
      avatarSmall: PropTypes.string,
    }),
  ).isRequired,
};

export default VoteOptionMemberList;
