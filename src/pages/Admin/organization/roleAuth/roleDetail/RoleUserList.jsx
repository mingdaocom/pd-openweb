import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Button, LoadDiv, UserHead, ScrollView } from 'ming-ui';
import { dialogSelectUser } from 'ming-ui/functions';
import roleApi from 'src/api/role';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import PaginationWrap from 'src/pages/Admin/components/PaginationWrap';

const UserListWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 20px 24px 0px;
  .userListHeader {
    .searchInput {
      height: 32px;
      background: #fff;
      border: 1px solid #e0e0e0;
      input {
        min-width: 160px;
      }
    }
  }
  .userItem {
    display: flex;
    align-items: center;
    padding: 12px 8px;
    cursor: pointer;
    .userName,
    .createTime {
      flex: 4;
    }
    .operateName {
      flex: 2;
    }
    .operateColumn {
      flex: 1;
    }
    &.isHeader {
      color: #9e9e9e;
      border-bottom: 1px solid #eaeaea;
      cursor: unset;
    }
    &:hover:not(.isHeader) {
      background: #f5f5f5;
      .removeBtn {
        color: #f44336 !important;
      }
    }
  }
  .listEmpty {
    text-align: center;
    border: none;
    padding-top: 118px;
    padding-bottom: 100px;
    .icon-empty_member {
      font-size: 50px;
      line-height: 106px;
      color: #999;
      border-radius: 50%;
      display: inline-block;
      width: 106px;
      height: 106px;
      background: #f5f5f5;
    }
  }
`;

export default function RoleUserList(props) {
  const { projectId, roleId, isHrVisible, allowManageUser, isRoleSuperAdmin, onUpdateSuccess } = props;
  const [fetchState, setFetchState] = useSetState({
    loading: true,
    pageIndex: 1,
    totalCount: 0,
    keywords: '',
    noMore: false,
  });
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    setFetchState({ loading: true, pageIndex: 1 });
  }, [roleId]);

  useEffect(() => {
    getUserList();
  }, [fetchState.loading, fetchState.pageIndex, fetchState.keywords]);

  const getUserList = () => {
    if (!fetchState.loading) {
      return;
    }
    roleApi
      .pagedRoleMembers({
        projectId,
        roleId,
        pageSize: 50,
        pageIndex: fetchState.pageIndex,
        keywords: fetchState.keywords,
        isHRRole: isHrVisible,
      })
      .then(({ members, totalCount } = {}) => {
        setFetchState({ loading: false, noMore: members.length < 50, totalCount });
        setUserList(members);
      })
      .catch(() => {
        setFetchState({ loading: false });
      });
  };

  const onAddMember = () => {
    dialogSelectUser({
      sourceId: 0,
      fromType: 0,
      fromAdmin: true,
      SelectUserSettings: {
        filterAll: true, // 过滤全部
        filterFriend: true, // 是否过滤好友
        filterOthers: true,
        filterOtherProject: true,
        filterResigned: false,
        projectId,
        inProject: true,
        callback: users => {
          const accountIds = users.map(user => user.accountId);
          roleApi
            .addUserToRole({
              projectId,
              roleId,
              accountIds,
            })
            .then(data => {
              if (data) {
                alert(_l('添加成功'));
                setFetchState({ loading: true, pageIndex: 1 });
                onUpdateSuccess();
              } else {
                alert(_l('添加失败'), 2);
              }
            });
        },
      },
    });
  };

  const onRemoveMember = user => {
    const isOwner = user.accountId === md.global.Account.accountId;
    roleApi.removeUserFromRole({ accountId: user.accountId, projectId, roleId }).then(res => {
      if (res) {
        if (isOwner) {
          location.href = '/admin/sysroles/' + projectId;
        } else {
          alert(_l('移除成功'));
          onUpdateSuccess();
          setFetchState({ loading: true, pageIndex: 1 });
        }
      } else {
        alert(_l('移除失败'), 2);
      }
    });
  };

  return (
    <UserListWrapper>
      <div className="userListHeader">
        <div className="flexRow alignItemsCenter">
          <SearchInput
            className="searchInput"
            placeholder={_l('搜索')}
            value={fetchState.keywords}
            onChange={_.debounce(value => {
              setFetchState({ loading: true, keywords: value, pageIndex: 1 });
            }, 500)}
          />
          <div className="flex" />

          {allowManageUser && (
            <Button type="ghost" size="small" onClick={onAddMember}>
              <span className="Font16">+</span>
              <span className="mLeft4">{_l('添加')}</span>
            </Button>
          )}
        </div>

        <div className="userItem isHeader">
          <div className="userName">{_l('姓名')}</div>
          <div className="operateName">{_l('操作人')}</div>
          <div className="createTime">{_l('添加时间')}</div>
          {allowManageUser && <div className="operateColumn" />}
        </div>
      </div>

      {fetchState.loading && <LoadDiv className="mTop10" />}

      {!fetchState.loading &&
        (!userList.length ? (
          <div className="listEmpty">
            <div>
              <span className="icon-empty_member mainIcon" />
            </div>
            <div className="mTop20">{_l('暂无成员')}</div>
          </div>
        ) : (
          <React.Fragment>
            <ScrollView className="flex">
              {userList.map((user, index) => {
                const isOwner = user.accountId === md.global.Account.accountId;
                return (
                  <div key={index} className="userItem">
                    <div className="flex flexRow alignItemsCenter userName">
                      <UserHead
                        user={{ userHead: user.avatar, accountId: user.accountId }}
                        size={32}
                        projectId={projectId}
                      />
                      <div className="mLeft8 overflow_ellipsis">{user.accountName}</div>
                    </div>
                    <div className="operateName overflow_ellipsis" title={user.operatorName}>
                      {user.operatorName}
                    </div>
                    <div className="createTime">{user.createTime}</div>
                    {allowManageUser && (
                      <div className="operateColumn">
                        {!(isOwner && isRoleSuperAdmin) && (
                          <div className="removeBtn Gray_9e" onClick={() => onRemoveMember(user)}>
                            {isOwner ? _l('退出') : _l('移除')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </ScrollView>

            {fetchState.totalCount > 50 && (
              <PaginationWrap
                total={fetchState.totalCount}
                pageIndex={fetchState.pageIndex}
                pageSize={50}
                onChange={pageIndex => setFetchState({ loading: true, pageIndex })}
              />
            )}
          </React.Fragment>
        ))}
    </UserListWrapper>
  );
}
