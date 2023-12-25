import React from 'react';
import PropTypes from 'prop-types';
import UserHead from 'src/components/userHead';

/**
 * 某条投票项的投票用户列表
 */
function VoteOptionMemberList(props) {
  return (
    <div className="mTop5 clearfix voteOptionMemberList">
      <div className="arrowUpOuter" style={{ float: 'right', marginRight: '50px', marginTop: '-10px' }}>
        <div className="arrowUpInner" />
      </div>
      <div className="clearfix updaterDialog_Main pAll5" style={{ border: '1px solid #D5D5D5' }}>
        {props.members.map(user => (
          <div className="left pAll2" key={user.accountId}>
            <UserHead title={user.name} user={{ accountId: user.accountId, userHead: user.avatarSmall }} size={24} />
          </div>
        ))}
      </div>
    </div>
  );
}
VoteOptionMemberList.propTypes = {
  members: PropTypes.arrayOf(
    PropTypes.shape({
      uid: PropTypes.string,
      name: PropTypes.string,
      avatarSmall: PropTypes.string,
    })
  ).isRequired,
};

export default VoteOptionMemberList;
