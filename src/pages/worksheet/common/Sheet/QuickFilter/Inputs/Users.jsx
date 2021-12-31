import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { arrayOf, func, number, string } from 'prop-types';
import UserHead from 'src/pages/feed/components/userHead';
import 'dialogSelectUser';

const Con = styled.div`
  display: flex;
  align-items: center;
  height: 32px;
  line-height: 32px;
  border: 1px solid #dddddd;
  border-radius: 4px;
  border: 1px solid ${({ active }) => (active ? '#2196f3' : '#ddd')} !important;
  .clearIcon {
    display: none;
  }
  &:hover {
    .clearIcon {
      display: inline-block;
    }
  }
  ${({ isEmpty }) => (!isEmpty ? '&:hover { .downIcon { display: none;} }' : '')}
`;

const UsersCon = styled.div`
  cursor: pointer;
  flex: 1;
  overflow: hidden;
  font-size: 13px;
  height: 32px;
  padding: 0 0 0 10px;
`;

const UsersText = styled.div`
  font-size: 13px;
  color: #333;
`;

const UserItem = styled.div`
  font-size: 13px;
  color: #333;
  .userHead {
    display: inline-block !important;
    margin-right: 8px;
  }
`;

const Icon = styled.i`
  cursor: pointer;
  font-size: 13px;
  color: #9e9e9e;
  margin-right: 8px;
`;

const Empty = styled.span`
  color: #bdbdbd;
`;
export default function Users(props) {
  const { values = [], projectId, isMultiple, onChange = () => {} } = props;
  const [active, setActive] = useState();
  const conRef = useRef();
  return (
    <Con
      isEmpty={!values.length}
      active={active}
      onClick={() => {
        setActive(true);
        $(conRef.current).quickSelectUser({
          showQuickInvite: false,
          showMoreInvite: false,
          isTask: false,
          includeUndefinedAndMySelf: true,
          includeSystemField: true,
          offset: {
            top: 0,
            left: 1,
          },
          zIndex: 10001,
          filterAccountIds: [md.global.Account.accountId],
          SelectUserSettings: {
            projectId,
            callback(users) {
              onChange({ values: isMultiple ? _.uniq([...values, ...users], 'accountId') : users });
              setActive(false);
            },
          },
          selectCb(users) {
            onChange({ values: isMultiple ? _.uniq([...values, ...users], 'accountId') : users });
            setActive(false);
          },
          onClose: () => {
            setActive(false);
          },
        });
      }}
    >
      <UsersCon ref={conRef}>
        {!values.length && <Empty>{_l('请选择')}</Empty>}
        {values.length === 1 ? (
          <UserItem className="ellipsis">
            <UserHead
              className="userHead"
              alwaysBindCard
              user={{
                userHead: values[0].avatar,
                accountId: values[0].accountId,
              }}
              size={24}
            />
            {values[0].fullname}
          </UserItem>
        ) : (
          <UsersText className="ellipsis" title={values.map(user => user.fullname).join(', ')}>
            {values.map(user => user.fullname).join(', ')}
          </UsersText>
        )}
      </UsersCon>
      <Icon className="icon icon-arrow-down-border downIcon" />
      {!!values.length && (
        <Icon
          className="icon icon-cancel clearIcon"
          onClick={() => {
            onChange({ values: [] });
          }}
        />
      )}
    </Con>
  );
}

Users.propTypes = {
  projectId: string,
  values: arrayOf(string),
  onChange: func,
};
