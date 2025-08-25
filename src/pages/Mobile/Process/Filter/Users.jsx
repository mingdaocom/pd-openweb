import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon, UserHead } from 'ming-ui';
import SelectUser from 'mobile/components/SelectUser';

const UsersCon = styled.div`
  position: relative;
  .addBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #f5f5f5;
    font-size: 22px;
    color: #9e9e9e;
  }
  .rightArrow {
    position: absolute;
    right: 0;
    line-height: 26px;
    font-size: 16px;
    color: #c7c7cc;
  }
`;

const UserItem = styled.span`
  height: 32px;
  background: #f5f5f5;
  border-radius: 14px;
  margin: 0 8px 10px 0;
  padding-right: 12px;
  display: flex;
  align-items: center;
  width: max-content;
  .userAvatar {
    border-radius: 50%;
  }
  .userName {
    font-size: 15px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    margin: 0 20px 0 8px;
    vertical-align: middle;
    display: inline-block;
    max-width: calc(100% - 69px);
  }
`;

export default props => {
  const { projectId, createAccount, onChange } = props;
  const [showSelectUser, setShowSelectUser] = useState(false);
  const onSave = users => {
    onChange(users[0]);
  };
  const pickUser = () => {
    setShowSelectUser(true);
  };
  return (
    <div className="flexColumn mBottom20">
      <div className="Font14 bold mBottom15">{_l('发起人')}</div>
      <UsersCon>
        {createAccount ? (
          <UserItem>
            <UserHead
              className="userAvatar InlineBlock"
              user={{
                userHead: createAccount.avatar,
                accountId: createAccount.accountId,
              }}
              size={32}
              projectId={projectId}
            />
            <span className="userName">{createAccount.fullname}</span>
            <Icon icon="close" onClick={() => onChange(null)} />
          </UserItem>
        ) : (
          <span className="addBtn" onClick={pickUser}>
            <Icon icon="add" />
          </span>
        )}
      </UsersCon>
      {showSelectUser && (
        <SelectUser
          projectId={projectId}
          visible={true}
          type="user"
          userType={1}
          onlyOne={true}
          advancedSetting={{}}
          onClose={() => setShowSelectUser(false)}
          onSave={onSave}
        />
      )}
    </div>
  );
};
