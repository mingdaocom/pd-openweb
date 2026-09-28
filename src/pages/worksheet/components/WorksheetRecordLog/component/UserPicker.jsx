import React, { useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Avatar, Icon } from 'ming-ui';
import { Checkbox, Dropdown } from 'ming-ui/antd-components';
import { UserSelectPopover } from 'ming-ui/functions/quickSelectUser';
import { isUser } from '../util';

const USER_PICKER_MENU_STYLE = {
  width: 220,
  padding: '12px 0',
};

const USER_PICKER_ITEM_STYLE = {
  height: 40,
};

const UserItemLabel = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  .userIcon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--color-text-disabled);
    color: var(--color-white);
  }
`;

const SYSTEM_FIELDS = [
  { fullname: _l('用户'), accountId: 'all-users' },
  { fullname: _l('自动化工作流'), accountId: 'user-workflow' },
  { fullname: _l('公开表单'), accountId: 'user-publicform' },
  { fullname: _l('API'), accountId: 'user-api' },
  { fullname: _l('数据集成'), accountId: 'user-integration' },
];

export default function UserPicker(props) {
  const { projectId, appId, selectUsers = [], changeSelect, showRequestTypeFilter = true } = props;

  const [visible, setVisible] = useState(false);
  const [userSelectVisible, setUserSelectVisible] = useState(false);
  const isPortal = _.get(md, 'global.Account.isPortal');

  const selectUserCallback = users => {
    let param = { selectUsers: users };

    if (!users || users.length !== 1 || !isUser(users[0])) {
      param.requestType = 0;
    }

    changeSelect(undefined, param, { opeartorIds: users.map(item => item.accountId) });
  };

  const clearSelectUser = e => changeSelect(e, { selectUsers: undefined }, { opeartorIds: undefined, requestType: 0 });

  const systemIds = SYSTEM_FIELDS.map(item => item.accountId);
  const selectedAccountIds = selectUsers.map(item => item.accountId);
  const menuItems = [
    ...(showRequestTypeFilter
      ? [
          {
            key: 'request-type',
            type: 'group',
            label: <span className="bold textPrimary">{_l('类型')}</span>,
            children: SYSTEM_FIELDS.map(item => {
              const checked = selectedAccountIds.includes(item.accountId);

              return {
                key: item.accountId,
                label: <Checkbox checked={checked}>{item.fullname}</Checkbox>,
                style: USER_PICKER_ITEM_STYLE,
                onClick: () => {
                  const users = selectUsers.filter(user => systemIds.includes(user.accountId));
                  selectUserCallback(
                    checked ? users.filter(user => user.accountId !== item.accountId) : users.concat(item),
                  );
                },
              };
            }),
          },
          { key: 'request-type-divider', type: 'divider' },
        ]
      : []),
    {
      key: 'user-self',
      label: (
        <UserItemLabel>
          <Avatar src={_.get(md, 'global.Account.avatar')} size={28} />
          <span className="mLeft12">{_l('我自己')}</span>
        </UserItemLabel>
      ),
      style: USER_PICKER_ITEM_STYLE,
      onClick: () => selectUserCallback([{ accountId: 'user-self', fullname: _l('我自己') }]),
    },
    {
      key: 'specified-user',
      label: (
        <UserSelectPopover
          open={userSelectVisible}
          onOpenChange={setUserSelectVisible}
          isHidAddUser={isPortal}
          hidePortalCurrentUser
          selectRangeOptions={false}
          includeSystemField={false}
          tabType={isPortal ? 2 : 3}
          appId={appId}
          showMoreInvite={false}
          filterAccountIds={['user-sub', 'user-undefined']}
          selectedAccountIds={selectedAccountIds}
          offset={{ top: 2, left: 0 }}
          SelectUserSettings={{
            unique: true,
            projectId,
            filterAccountIds: ['user-sub', 'user-undefined'],
            selectedAccountIds,
            callback: selectUserCallback,
          }}
          onSelect={selectUserCallback}
        >
          <UserItemLabel>
            <div className="userIcon">
              <Icon icon="person" className="Font16" />
            </div>
            <span className="mLeft12">{_l('指定用户')}</span>
          </UserItemLabel>
        </UserSelectPopover>
      ),
      style: USER_PICKER_ITEM_STYLE,
    },
  ];

  return (
    <Dropdown
      open={visible}
      onOpenChange={(value, info) => {
        if (_.get(info, 'source') === 'menu') return;

        setVisible(value);
      }}
      trigger={['click']}
      placement="bottomLeft"
      align={{ offset: [0, 5] }}
      menu={{ items: menuItems, style: USER_PICKER_MENU_STYLE }}
    >
      <span className={cx({ selectLight: !!selectUsers.length }, 'selectUser')}>
        <Icon icon="person" />
        <span className="selectConText breakAll">
          {selectUsers.length > 1
            ? selectUsers.length + _l('项')
            : selectUsers.length === 1
              ? selectUsers[0].fullname
              : _l('操作者')}
        </span>
        <Icon icon="arrow-down" style={selectUsers.length ? {} : { display: 'inline-block' }} />
        {!!selectUsers.length && <Icon onClick={clearSelectUser} icon="cancel" />}
      </span>
    </Dropdown>
  );
}
