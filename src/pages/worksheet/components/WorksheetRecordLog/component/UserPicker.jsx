import React, { useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Avatar, Checkbox, Icon } from 'ming-ui';
import { quickSelectUser } from 'ming-ui/functions';
import { isUser } from '../util';

const UserPickerWrapper = styled.div`
  width: 220px;
  padding: 16px 0;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0px 3px 6px 1px rgba(0, 0, 0, 0.16);
  overflow: hidden;
  .divider {
    height: 1px;
    background: #ddd;
    margin: 12px 0;
  }
  .userItem {
    display: flex;
    align-items: center;
    padding: 0 20px;
    height: 40px;
    cursor: pointer;
    &:hover {
      background: #f5f5f5;
    }
    .userIcon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #b4bdc4;
      color: #fff;
    }
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
  const { projectId, appId, selectUsers = [], changeSelect } = props;
  const selectUserRef = useRef();

  const [visible, setVisible] = useState(false);

  const selectUserCallback = users => {
    let param = { selectUsers: users };

    if (!users || users.length !== 1 || !isUser(users[0])) {
      param.requestType = 0;
    }

    changeSelect(undefined, param, { opeartorIds: users.map(item => item.accountId) });
  };

  const pickUser = () => {
    const filterIds = ['user-sub', 'user-undefined'];
    quickSelectUser(selectUserRef.current, {
      hidePortalCurrentUser: true,
      selectRangeOptions: false,
      includeSystemField: false,
      rect: selectUserRef.current.getBoundingClientRect(),

      tabType: 3,
      appId,
      showMoreInvite: false,
      isTask: false,
      filterAccountIds: filterIds,
      selectedAccountIds: selectUsers.map(item => item.accountId),
      offset: {
        top: 2,
      },
      zIndex: 10001,
      SelectUserSettings: {
        unique: true,
        projectId,
        filterAccountIds: filterIds,
        selectedAccountIds: selectUsers.map(item => item.accountId),
        callback: selectUserCallback,
      },
      selectCb: selectUserCallback,
    });
  };

  const clearSelectUser = e => changeSelect(e, { selectUsers: undefined }, { opeartorIds: undefined, requestType: 0 });

  const renderPopup = () => {
    return (
      <UserPickerWrapper>
        <div className="bold pLeft20 pRight20 mBottom8">{_l('类型')}</div>
        {SYSTEM_FIELDS.map(item => {
          const checked = selectUsers.map(user => user.accountId).includes(item.accountId);

          return (
            <div
              className="userItem"
              key={`UserPicker-Item-${item.accountId}`}
              onClick={() => {
                const systemIds = SYSTEM_FIELDS.map(sys => sys.accountId);
                const users = selectUsers.filter(user => !!systemIds.includes(user.accountId));
                selectUserCallback(
                  checked ? users.filter(user => user.accountId !== item.accountId) : users.concat(item),
                );
              }}
            >
              <Checkbox text={item.fullname} checked={checked} />
            </div>
          );
        })}
        <div className="divider" />
        <div
          className="userItem"
          onClick={() => selectUserCallback([{ accountId: 'user-self', fullname: _l('我自己') }])}
        >
          <Avatar src={_.get(md, 'global.Account.avatar')} size={28} />
          <span className="mLeft12">{_l('我自己')}</span>
        </div>
        <div className="userItem" onClick={pickUser}>
          <div className="userIcon">
            <Icon icon="person" className="Font16" />
          </div>
          <span className="mLeft12">{_l('指定用户')}</span>
        </div>
      </UserPickerWrapper>
    );
  };

  return (
    <Trigger
      popupVisible={visible}
      onPopupVisibleChange={value => setVisible(value)}
      action={['click']}
      popupAlign={{ points: ['tl', 'bl'], offset: [0, 5] }}
      popup={renderPopup()}
    >
      <span className={cx({ selectLight: !!selectUsers.length }, 'selectUser')} ref={selectUserRef}>
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
    </Trigger>
  );
}
