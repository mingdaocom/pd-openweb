import React, { useState, useRef, useEffect, Fragment } from 'react';
import styled from 'styled-components';
import { Tooltip, UserHead } from 'ming-ui';
import { dialogSelectUser } from 'ming-ui/functions';
import _ from 'lodash';

export const Con = styled.div`
  overflow: hidden;
  width: 360px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0px 3px 6px 1px rgba(0, 0, 0, 0.16);
  .moduleName {
    color: #9e9e9e;
    font-size: 13px;
    margin: 10px 16px;
  }
  .searchUser {
  }
`;

export const Content = styled.div`
  height: 328px;
  overflow: auto;
  hr {
    margin: 12px 7px;
    border: none;
    border-top: 1px solid #f0f0f0;
  }
  .moreBtn {
    color: #2196f3;
    cursor: pointer;
    padding: 4px 0 0 16px;
  }
`;

export const UserItemCon = styled.div`
  height: 44px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  .userHead {
    margin-right: 12px;
  }
  .text {
    overflow: hidden;
  }
  .name {
    color: #333;
    font-size: 13px;
  }
  .description {
    color: #9e9e9e;
    font-size: 12px;
    .splitter {
      margin: 0 6px;
    }
  }
  &.focused,
  &:hover {
    background: #f5f5f5;
  }
`;

export const UserListCon = styled.div`
  .empty {
    margin: 100px auto;
    text-align: center;
    color: #bdbdbd;
  }
`;

export const SearchUsers = styled.div`
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 36px;
  margin: 6px 0;
  .search {
    font-size: 18px;
    color: #bdbdbd;
    margin-right: 4px;
  }
  .close {
    font-size: 16px;
    color: #9e9e9e;
    margin: 0 4px;
    cursor: pointer;
  }
  .openAddress {
    font-size: 18px;
    color: #757575;
    cursor: pointer;
    &:hover {
      color: #2196f3;
    }
  }
  input {
    flex: 1;
    line-height: 36px;
    outline: none;
    border: none;
    margin-right: 12px;
    &::placeholder {
      color: #bdbdbd;
    }
  }
`;

export function UserItem(props) {
  const { className, notShowCurrentUserName, user = {}, type, onClick, appId, projectId } = props;
  const { accountId, phone, fullname, job, department } = user;

  return (
    <UserItemCon className={'flexRow userItem ' + className} onClick={onClick}>
      <UserHead
        className="userHead"
        user={{
          userHead: user.avatarSmall || user.avatar,
          accountId: accountId,
        }}
        appId={appId}
        size={28}
        projectId={projectId}
      />
      <div className="flex flexColumn text">
        <div className="name ellipsis" title={fullname}>
          {notShowCurrentUserName && accountId === md.global.Account.accountId ? _l('我自己') : fullname}
        </div>
        <div
          className="description ellipsis"
          title={type === 'external' ? phone : [department, job].filter(_.identity).join(' | ')}
        >
          {type === 'external'
            ? phone
            : [department, job].filter(_.identity).map((text, i) => (
                <Fragment>
                  {i !== 0 && <span className="splitter">|</span>}
                  {text}
                </Fragment>
              ))}
        </div>
      </div>
    </UserItemCon>
  );
}

export function UserList(props) {
  const {
    notShowCurrentUserName,
    keywords,
    activeIndex,
    loading,
    list,
    type,
    showMore,
    limitNum = 2,
    onSelect,
    onShowMore = () => {},
    appId,
    projectId,
  } = props;
  const [isShowMore, setIsShowMore] = useState(false);
  return (
    <UserListCon>
      {!!list.length &&
        (showMore && !isShowMore ? list.slice(0, limitNum) : list).map((user, i) => (
          <UserItem
            notShowCurrentUserName
            className={activeIndex === i ? 'focused' : ''}
            user={user}
            type={type}
            key={i}
            appId={appId}
            projectId={projectId}
            onClick={() => onSelect(user)}
          />
        ))}
      {!loading && !list.length && (
        <div className="empty">{type === 'external' && !keywords ? _l('暂无成员') : _l('没有搜索结果')}</div>
      )}
      {showMore && !isShowMore && list.length > limitNum && (
        <div
          className="moreBtn"
          onClick={() => {
            setIsShowMore(true);
            onShowMore(true);
          }}
        >
          {_l('更多')}
        </div>
      )}
    </UserListCon>
  );
}

export function Search(props) {
  const { type, keywords, setKeywords, parentProps, onSelect, onClose, isHidAddUser, onKeyDown = () => {} } = props;
  const SelectUserSettings = parentProps.SelectUserSettings || { ...parentProps };
  const inputRef = useRef();
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  return (
    <SearchUsers>
      <i className="icon icon-search search" />
      <input
        ref={inputRef}
        type="text"
        value={keywords}
        placeholder={type === 'external' ? _l('请输入姓名、手机') : _l('请输入姓名、手机或邮箱')}
        onChange={e => setKeywords(e.target.value)}
        onKeyDown={onKeyDown}
      />
      {keywords && <i className="icon icon-closeelement-bg-circle close" onClick={() => setKeywords('')} />}
      {!isHidAddUser && type !== 'external' && type !== 'range' && (
        <Tooltip zIndex={10002} destroyPopupOnHide popupPlacement="bottom" text={_l('从通讯录中选择')}>
          <i
            className="icon icon-topbar-addressList openAddress"
            onClick={e => {
              e.stopPropagation();
              SelectUserSettings.includeUndefinedAndMySelf = parentProps.includeUndefinedAndMySelf;
              SelectUserSettings.includeSystemField = parentProps.includeSystemField;
              SelectUserSettings.prefixAccountIds = parentProps.prefixAccountIds;

              if (!SelectUserSettings.callback) {
                SelectUserSettings.callback = onSelect;
              }

              dialogSelectUser({
                SelectUserSettings,
                onCancel: onClose,
              });
              onClose(true);
            }}
          />
        </Tooltip>
      )}
    </SearchUsers>
  );
}

const TabsCon = styled.div`
  display: flex;
  background-color: #f0f0f0;
  color: #757575;
  .tab {
    cursor: pointer;
    flex: 1;
    text-align: center;
    line-height: 32px;
    font-weight: 500;
    &:hover {
      color: #2196f3;
    }
    &.active {
      color: #2196f3;
      background: #fff;
    }
  }
`;

export function Tabs(props) {
  const { active = 0, onActive } = props;
  return (
    <TabsCon>
      {[
        { key: 0, text: _l('常规') },
        { key: 1, text: _l('外部门户') },
      ].map(item => (
        <span className={`tab ${item.key === active ? 'active' : ''}`} onClick={() => onActive(item.key)}>
          {item.text}
        </span>
      ))}
    </TabsCon>
  );
}
