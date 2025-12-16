import React, { Fragment, useCallback, useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import {
  Button,
  Dialog,
  Dropdown,
  Icon,
  Input,
  LoadDiv,
  ScrollView,
  Switch,
  Textarea,
  UserHead,
  VerifyPasswordConfirm,
} from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { dialogSelectDept, dialogSelectUser } from 'ming-ui/functions';
import groupAjax from 'src/api/group';
import invitationController from 'src/api/invitation';
import addFriends from 'src/components/addFriends';
import { checkPermission } from 'src/components/checkPermission';
import { expireDialogAsync } from 'src/components/upgradeVersion';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import { existAccountHint } from 'src/utils/inviteCommon';
import SelectAvatarTrigger from '../createGroup/SelectAvatarTrigger';
import { BUTTONS, GROUP_INFOS, USER_ACTION_AJAX, USER_ACTION_MAP, USER_ACTIONS, USER_ACTIONS_MAP } from './config';
import QrPopup from './QrPopup';

const ActionResult = {
  MissParams: -2,
  NotLogin: -1,
  Failed: 0,
  Success: 1,
  OnlyGroupAdmin: 2,
  ApprovalUserNotExist: 3,
};
const PAGE_SIZE = 30;

const SettingDialog = styled(Dialog)`
  background: #f5f5f5 !important;
`;

const ContentWrap = styled.div`
  .group-card {
    background-color: #fff;
    border-radius: 6px;
    padding: 16px;
    display: flex;
    align-items: center;
    min-height: 46px;
    &.height46 {
      height: 46px;
    }
  }
  .button-card {
    font-size: 13px;
    font-weight: 600;
    color: #151515;
    justify-content: center;
    &.red {
      color: #ff4d4f;
    }
    &.orange {
      color: #ff9a00;
    }
  }
  .switch-other-item {
    display: flex;
    align-items: center;
    width: 100%;
  }
  .group-card-others {
    flex-direction: column;
    align-items: flex-start;
    > div {
      height: 46px;
      border-bottom: 1px solid #f5f5f5;
      &:last-child {
        border-bottom: none;
      }
    }
  }
  .group-header-card {
    gap: 16px;
    justify-content: space-between;
    .avatarWrap {
      position: relative;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      img {
        width: 100%;
        height: 100%;
      }
      .changeAvatar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.4);
        color: #fff;
        opacity: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      &:hover {
        .changeAvatar {
          opacity: 1;
        }
      }
    }
  }
  .contentWrap {
    gap: 20px;
    .groupItem {
      .label {
        font-size: 13px;
        font-weight: 600;
        color: #757575;
        margin-bottom: 8px;
        padding-left: 16px;
      }
    }
    input {
      border: none !important;
      background: #fff !important;
      padding: 0 16px !important;
      border-radius: 6px !important;
      height: 46px !important;
    }
    .userList {
      flex-wrap: wrap;
      overflow: hidden;
      gap: 8px;
      overflow: hidden;
      img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
      }
      &.nowrap {
        flex-wrap: nowrap !important;
      }
    }
  }
  .btnSplitLine {
    margin: 0 16px;
    width: calc(100% - 36px);
    height: 1px;
    background: #f5f5f5;
  }
`;

const AboutTextarea = styled(Textarea)`
  background: #fff !important;
  border-radius: 6px !important;
`;

const UserDialogContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  .selectUsers {
    background: #fff;
    border-radius: 6px;
    padding-top: 6px;
    padding-bottom: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    .searchWrap {
      display: flex;
      align-items: center;
      padding: 0 16px;
      input {
        border: none !important;
      }
    }
    .userList {
      flex: 1;
    }
  }
  .userItem {
    height: 40px;
    gap: 8px;
    padding: 0 16px;
    &:hover {
      background: #f5f5f5;
    }
    .name {
      width: 170px;
    }
    .job {
      flex: 1;
    }
    .action {
      text-align: right;
      width: 120px;
      .Dropdown--input {
        padding: 0 !important;
      }
    }
  }
  .ming.Dropdown.disabled {
    background-color: transparent;
  }
`;

function SettingGroup(props) {
  const { visible, groupID, isApprove = false, onClose, success = () => {} } = props;

  let moreUserLoading = false;
  const [groupInfo, setState] = useSetState({
    loading: true,
    userDialogVisible: isApprove,
    aboutDialogVisible: false,
    pageIndex: 1,
    keywords: '',
    userLoading: true,
    users: undefined,
    hasGroupAuth: false,
    chatOrgId: undefined,
    covertVisible: false,
    covertOkDisabled: false,
    qrLoading: true,
  });

  const debouncedSearch = useCallback(
    _.debounce(keywords => {
      getGroupUsers({ keywords, pageIndex: 1 });
    }, 500),
    [groupID],
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, []);

  useEffect(() => {
    getGroupInfo();
    getGroupUsers();
  }, [groupID]);

  const getGroupUsers = (params = {}) => {
    setState({ userLoading: true, ...params });
    const pageIndex = params.pageIndex || groupInfo.pageIndex;

    groupAjax
      .getGroupUsers({
        groupId: groupID,
        keywords: params.keywords || groupInfo.keywords,
        pageIndex,
        pageSize: PAGE_SIZE,
      })
      .then(res => {
        setState({
          users: {
            ...res,
            groupUsers:
              pageIndex === 1 ? res.groupUsers : _.union(groupInfo.users.groupUsers, res.groupUsers, 'accountId'),
          },
          userLoading: false,
        });
        moreUserLoading = false;
      });
  };
  const getGroupInfo = () => {
    setState({ loading: true });
    groupAjax.getGroupInfo({ groupId: groupID }).then(result => {
      if (result && result.status === 1) {
        setState({
          ...result,
          loading: false,
          hasGroupAuth:
            result.project &&
            result.project.projectId &&
            checkPermission(result.project.projectId, PERMISSION_ENUM.GROUP_MANAGE),
        });
      } else {
        alert(_l('该群组已关闭或删除'), 3);
        onClose();
      }
    });
  };

  const getQrCode = () =>
    invitationController.getQRCodeInviteLink({
      sourceId: groupID,
      fromType: 1,
      linkFromType: 4,
      width: 100,
      height: 100,
    });

  const addMembers = userArray => {
    invitationController
      .inviteUser({
        sourceId: groupID,
        accountIds: userArray.map(l => l.accountId),
        fromType: 1,
      })
      .then(res => {
        const formatedData = existAccountHint(res);

        if (formatedData.accountInfos.length) {
          success('ADD_MEMBERS', {
            groupId: groupID,
            accounts: formatedData.accountInfos,
          });

          getGroupInfo();
          getGroupUsers({ pageIndex: 1, keywords: '' });
          location.href.includes('chat_window') && window.close();
        }
      });
  };

  const quickInviteEvent = () => {
    dialogSelectUser({
      sourceId: groupID,
      fromType: 1,
      SelectUserSettings: {
        callback: addMembers,
      },
    });
  };

  const updateAvatar = ({ avatar, avatarName }) => {
    groupAjax
      .updateGroupAvatar({
        groupId: groupID,
        avatar: avatarName,
      })
      .then(res => {
        if (res) {
          success && success('UPDATE_AVATAR', { groupID: groupID, avatar: avatarName, groupAvatar: res.avatar });
          setState({ avatar: avatar });
          location.href.includes('chat_window') && window.close();
          alert(_l('操作成功'));
        } else {
          alert(_l('操作失败'), 2);
        }
      });
  };

  const updateName = () => {
    if (!groupInfo.name) return alert(_l('群组名字不能为空'), 2);
    if (groupInfo.name.length > 64) return alert(_l('您输入的群组名字过长，不能超过64个字符'), 2);

    groupAjax
      .updateGroupName({
        groupId: groupID,
        groupName: groupInfo.name,
      })
      .then(res => {
        if (!res) {
          alert(_l('操作失败'), 2);
          return;
        }

        success && success('RENAME', { groupId: groupID, groupName: groupInfo.name });
        location.href.includes('chat_window') && window.close();
      });
  };

  const updateGroup = (params, type, keys, close) => {
    const ajaxFun = groupAjax[USER_ACTION_AJAX[type]];
    const isGroups = [8, 9].includes(type);

    ajaxFun({
      [isGroups ? 'groupIds' : 'groupId']: isGroups ? [groupID] : groupID,
      ...(keys ? _.pick(params, keys) : params),
    }).then(res => {
      if (res === ActionResult.Success || res === true) {
        USER_ACTION_MAP[type] && success(USER_ACTION_MAP[type], { ...params, groupId: groupID });
        setState(params);
        alert(_l('操作成功'));
        location.href.includes('chat_window') && window.close();
      } else if (res === ActionResult.OnlyGroupAdmin) {
        alert(_l('您是该群组的唯一管理员，请指定一名管理员再退出群组'), 3);
      } else {
        alert(_l('操作失败'), 2);
      }
    });

    if (close) onClose();
  };

  const updateGroupAbout = () => {
    groupAjax
      .updateGroupAbout({
        groupId: groupID,
        groupAbout: groupInfo.about,
      })
      .then(res => {
        if (!res) {
          alert(_l('操作失败'), 2);
          return;
        }

        success && success('UPDATE_DESC', { groupId: groupID, groupAbout: groupInfo.about });
        location.href.includes('chat_window') && window.close();
      });
  };

  const onCloseAbout = () => {
    setState({ aboutDialogVisible: false });
    groupInfo.isAdmin && updateGroupAbout();
  };

  const inviteFriends = () => {
    addFriends({
      projectId: groupID,
      fromType: 1,
      fromText: groupInfo.name,
    });
  };

  const onClickButton = item => {
    switch (item.key) {
      case 0:
        Dialog.confirm({
          title: _l('是否确认关闭群组？'),
          description: (
            <div>
              {_l('关闭群组后，群组将不能被访问')}
              <br />
              {_l('您可以在 组织管理-群组 中找到并重新开启这个群组')}
            </div>
          ),
          onOk: () => {
            VerifyPasswordConfirm.confirm({
              isRequired: true,
              onOk: () => updateGroup({}, 8, undefined, true),
            });
          },
        });
        break;
      case 1:
        Dialog.confirm({
          title: _l('是否确认解散？'),
          description: groupInfo.isPost
            ? _l('群组解散后，将永久删除该群组。不可恢复')
            : _l('聊天解散后，将永久删除该聊天。不可恢复'),
          onOk: () => {
            VerifyPasswordConfirm.confirm({
              isRequired: true,
              onOk: () => updateGroup({}, 9, undefined, true),
            });
          },
        });
        break;
      case 2:
        Dialog.confirm({
          title: _l('是否确认退出？'),
          description: groupInfo.isPost
            ? _l('退出群组后，您将不能进入这个群组')
            : _l('退出聊天后，您将不能进入这个聊天'),
          onOk: () => {
            updateGroup({}, 10, undefined, true);
          },
        });
        break;
    }
  };

  const onClickDepartment = () => {
    const projectId = _.get(groupInfo, 'project.projectId');
    const mapDepartmentName = _.get(groupInfo, 'mapDepartmentName');

    if (!projectId || !groupInfo.isAdmin) return;

    dialogSelectDept({
      projectId: projectId,
      unique: true,
      onClose: isSelect => {
        if (!isSelect) {
          setState({ isVerified: !!mapDepartmentName || false });
        }
      },
      selectFn: data => {
        if (!_.get(data, '[0].departmentName')) {
          setState({ isVerified: false });
          return;
        }

        updateGroup(
          {
            isVerified: true,
            mapDepartmentId: _.get(data, '[0].departmentId'),
            mapDepartmentName: _.get(data, '[0].departmentName'),
          },
          6,
          ['isVerified', 'mapDepartmentId'],
        );
      },
    });
  };

  const onScrollEnd = () => {
    if (moreUserLoading) return;
    if (groupInfo.userLoading || groupInfo.users.matchedMemberCount <= groupInfo.users.groupUsers.length) return;
    moreUserLoading = true;
    getGroupUsers({ pageIndex: groupInfo.pageIndex + 1 });
  };

  const onClickUserAction = (value, user) => {
    const ajaxFun = groupAjax[USER_ACTION_AJAX[value]];
    const isSingle = [0, 3].includes(value);

    ajaxFun({
      groupId: groupID,
      [isSingle ? 'accountId' : 'accountIds']: isSingle ? user.accountId : [user.accountId],
    }).then(res => {
      USER_ACTION_MAP[value] &&
        success(USER_ACTION_MAP[value], {
          groupId: groupID,
          accountId: user.accountId,
        });

      if (res) {
        getGroupInfo();
        setState({
          users: {
            ...groupInfo.users,
            groupMemberCount: value !== 3 ? groupInfo.users.groupMemberCount : groupInfo.users.groupMemberCount - 1,
            matchedMemberCount:
              value !== 3 ? groupInfo.users.matchedMemberCount : groupInfo.users.matchedMemberCount - 1,
            groupUsers:
              value !== 3
                ? groupInfo.users.groupUsers.map(l =>
                    l.accountId === user.accountId ? { ...l, groupUserRole: value } : l,
                  )
                : groupInfo.users.groupUsers.filter(l => l.accountId !== user.accountId),
          },
        });
      }
    });
  };

  const onApplyUser = (value, user) => {
    if (value) {
      groupAjax
        .passJoinGroup({
          groupId: groupID,
          accountIds: [user.accountId],
        })
        .then(data => {
          if (data) {
            alert(_l('操作成功'));
            getGroupInfo();
            getGroupUsers();
            setState({
              userDialogVisible: false,
            });
          }
        });
    } else {
      groupAjax
        .refuseUser({
          groupId: groupID,
          accountId: user.accountId,
        })
        .then(data => {
          if (data) {
            alert(_l('操作成功'));
            getGroupInfo();
            getGroupUsers();
            setState({
              userDialogVisible: false,
            });
          }
        });
    }
  };

  const openCovertPost = () => setState({ covertVisible: true });

  const onSelectProject = orgId => {
    if (orgId === groupInfo.chatOrgId) return;

    setState({ chatOrgId: orgId });
    expireDialogAsync(orgId)
      .then(() => {
        setState({ covertOkDisabled: false });
      })
      .catch(() => {
        setState({ covertOkDisabled: true });
      });
  };

  const handleVerified = () => {
    if (!groupInfo.mapDepartmentName && !groupInfo.isVerified) {
      setState({ isVerified: !groupInfo.isVerified });
      onClickDepartment();
      return;
    }

    updateGroup({ isVerified: !groupInfo.isVerified }, 6);
  };

  const renderOrg = () => {
    const projects = _.get(md, 'global.Account.projects', []).map(l => ({ value: l.projectId, text: l.companyName }));

    return (
      <Dropdown
        border
        isAppendToBody
        className="w100"
        value={groupInfo.chatOrgId}
        data={projects}
        onChange={val => onSelectProject(val)}
      />
    );
  };

  const renderHeader = () => {
    if (groupInfo.loading) return null;

    return (
      <div className="group-card group-header-card mBottom20">
        <div className="avatarWrap">
          <img src={groupInfo.avatar} />
          {groupInfo.isAdmin && groupInfo.isPost && (
            <SelectAvatarTrigger onChange={updateAvatar}>
              <div className="changeAvatar">{_l('修改头像')}</div>
            </SelectAvatarTrigger>
          )}
        </div>
        <div className="flex overflow_ellipsis">
          <div className="Font17 Gray_15 Bold mBottom8 overflow_ellipsis">{groupInfo.name}</div>
          {_.get(groupInfo, 'project.companyName') && (
            <div className="Font13 Gray_75 overflow_ellipsis">{groupInfo.project.companyName}</div>
          )}
        </div>
        {groupInfo.isPost && (
          <div className="barcodeWrap">
            <QrPopup tip={_l('手机扫描邀请成员加入')} getLink={getQrCode}>
              <Icon icon="zendeskHelp-qrcode" className="Gray_9e Font22 Hover_21 pointer" />
            </QrPopup>
          </div>
        )}
      </div>
    );
  };

  const renderUsers = (users, editable) => {
    if (!users) return;

    return (
      <div
        className={cx('valignWrapper group-card', { Hand: editable })}
        onClick={() => editable && setState({ userDialogVisible: true })}
      >
        <div className={cx('userList valignWrapper flex', { nowrap: editable })}>
          {users.map(user => {
            return (
              <UserHead
                key={`group-card-${user.accountId}`}
                user={{
                  userHead: user.avatar,
                  accountId: user.accountId,
                }}
                size={32}
                projectId={_.get(groupInfo, 'project.projectId')}
              />
            );
          })}
        </div>
        {editable && <Icon icon="arrow-right-border" className="Font16 mLeft20 Gray_9f" />}
      </div>
    );
  };

  const renderContentItem = item => {
    switch (item.key) {
      case 'name':
        return (
          <Input
            className="w100"
            value={groupInfo.name}
            disabled={!groupInfo.isAdmin}
            onChange={value => setState({ name: value })}
            onBlur={updateName}
          />
        );
      case 'adminUsers':
        return renderUsers(groupInfo.adminUsers, false);
      case 'about':
        return (
          <div
            className="group-card valignWrapper justifyContentBetween Hand"
            onClick={() => setState({ aboutDialogVisible: true })}
          >
            <span className={cx('flex ellipsis', { Gray_9e: !_.get(groupInfo, 'about') })}>
              {_.get(groupInfo, 'about')}
            </span>
            <Icon icon="arrow-right-border" className="Font16 mLeft20 Gray_9f" />
          </div>
        );
      case 'users':
        return renderUsers(
          _.get(groupInfo, 'adminUsers', [])
            .concat(_.get(groupInfo, 'groupUsers', []))
            .slice(0, PAGE_SIZE),
          true,
        );
      case 'others':
        return (
          <div className="others">
            {groupInfo.isPost && (
              <div className="group-card group-card-others pTop0 pBottom0 mBottom20">
                {!_.isEmpty(groupInfo.project) && (
                  <div className="switch-other-item">
                    <Switch
                      size="small"
                      className="mRight8"
                      disabled={!groupInfo.isAdmin}
                      checked={!groupInfo.isHidden}
                      onClick={() => updateGroup({ isHidden: !groupInfo.isHidden }, 4)}
                    />
                    <span>{_l('在组织通讯录下显示当前群组')}</span>
                  </div>
                )}

                <div className="switch-other-item">
                  <Switch
                    size="small"
                    className="mRight8"
                    disabled={!groupInfo.isAdmin}
                    checked={groupInfo.isForbidInvite}
                    onClick={() => updateGroup({ isForbidInvite: !groupInfo.isForbidInvite }, 5)}
                  />
                  <span>{_l('仅允许群主及管理员邀请新成员')}</span>
                </div>
                {!_.isEmpty(groupInfo.project) && (
                  <Fragment>
                    <div className="switch-other-item" style={{ border: 'none' }}>
                      <Switch
                        size="small"
                        className="mRight8"
                        disabled={!groupInfo.isAdmin}
                        checked={groupInfo.isVerified}
                        onClick={handleVerified}
                      />
                      <span className="mRight8">{_l('关联部门')}</span>
                      {groupInfo.isVerified && groupInfo.mapDepartmentName && (
                        <span className="ThemeColor3 Hand bold" onClick={onClickDepartment}>
                          {groupInfo.mapDepartmentName}
                        </span>
                      )}
                    </div>
                    <span className="Gray_75 mLeft42 mBottom10" style={{ marginTop: -6 }}>
                      {_l('新成员加入部门后自动加入群组')}
                    </span>
                  </Fragment>
                )}
              </div>
            )}
            {groupInfo.isPost && (
              <Fragment>
                <div className="group-card">
                  <Switch
                    size="small"
                    className="mRight8"
                    disabled={!groupInfo.isAdmin}
                    checked={groupInfo.isApproval}
                    onClick={() => updateGroup({ isApproval: !groupInfo.isApproval }, 7)}
                  />
                  <span>{_l('新成员加入需要管理员验证')}</span>
                </div>
                <div className="Font13 Gray_9e mTop6 mLeft16 mBottom20">
                  {_l('仅对主动申请加入和通过链接邀请的用户生效')}
                </div>
              </Fragment>
            )}
            <div className="group-card">
              <Switch
                size="small"
                className="mRight8"
                checked={!groupInfo.isPushNotice}
                onClick={() => updateGroup({ isPushNotice: !groupInfo.isPushNotice }, 11)}
              />
              <span>{_l('消息免打扰')}</span>
            </div>
            <div className="Font13 Gray_9e mTop6 mLeft16 mBottom20">
              {_l('开启后，仅接收到@我及@全体群成员的消息提醒')}
            </div>
          </div>
        );
      default:
        return <div className="group-card">{_.get(groupInfo, item.key)}</div>;
    }
  };
  const renderContent = () => {
    return (
      <div className="flexColumn contentWrap">
        {!groupInfo.isPost && (
          <div>
            <div className="mBottom6 group-card button-card Hand orange" onClick={openCovertPost}>
              {_l('转换为长期群组')}
            </div>
            <div className="pLeft16">
              {_l('转换为群组后，您可获得：指定更多管理员，群组审批，邀请外部用户等功能。')}
              <br />
              {_l('同事群组进入到通讯录中方便管理并能支持到更多应用。')}
            </div>
          </div>
        )}
        {GROUP_INFOS.filter(l => !l.isPost || groupInfo.isPost).map(item => {
          if (item.require && !_.get(groupInfo, item.key)) return null;

          return (
            <div className="groupItem">
              <div className="label">
                {item.label}
                {item.key === 'users' && _l('（%0人）', _.get(groupInfo, 'groupMemberCount'))}
              </div>
              <div className="content">{renderContentItem(item)}</div>
              {item.key === 'project.companyName' && (
                <div className="mTop8 Gray_75">{_l('组织成员离职后自动退出群组')}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderButtons = () => {
    return (
      <Fragment>
        <div>
          {BUTTONS.filter(l => {
            if (l.key === 2) {
              return true;
            }
            if (l.isAdmin) {
              return groupInfo.isAdmin;
            }
            return false;
          }).map(l => {
            const desc = groupInfo.isPost ? l.desc : l.chatDesc;

            return (
              <div className={cx({ mBottom20: !l.splintLine })} key={`setting-group-bottom-${l.key}`}>
                <div className={cx('group-card button-card Hand', { red: l.red })} onClick={() => onClickButton(l)}>
                  {groupInfo.isPost ? l.label : l.chatLabel}
                </div>
                {!!desc && <div className="Font13 Gray_9e mTop6 mLeft16 mBottom20">{desc}</div>}
                {l.splintLine && <div className="btnSplitLine"></div>}
              </div>
            );
          })}
        </div>
        <div className="mTop20 Font12 TxtRight Gray_9e">
          {_l('创建时间')}: {groupInfo.createTime}
        </div>
      </Fragment>
    );
  };

  const renderUserItem = user => {
    const DropdownCon = user.status ? (
      <Dropdown
        className="action"
        isAppendToBody
        menuStyle={{ width: 'auto', minWidth: '120px' }}
        points={['tr', 'br']}
        value={user.groupUserRole}
        disabled={!groupInfo.isAdmin}
        data={USER_ACTIONS.filter(l => l.value !== user.groupUserRole)}
        onChange={value => onClickUserAction(value, user)}
        renderPointer={() => (
          <span className="actioWrap">
            <span>{USER_ACTIONS_MAP[user.groupUserRole]}</span>
            <Icon icon="arrow-up-border1" className="Font14 Gray_9e" />
          </span>
        )}
      />
    ) : (
      <Dropdown
        className="action"
        isAppendToBody
        menuStyle={{ width: 'auto', minWidth: '120px' }}
        points={['tr', 'br']}
        value={user.groupUserRole}
        disabled={!groupInfo.isAdmin}
        data={[
          {
            text: _l('允许'),
            value: 1,
          },
          {
            text: _l('拒绝'),
            value: 0,
          },
        ]}
        onChange={value => onApplyUser(value, user)}
        renderPointer={() => (
          <span className="actioWrap">
            <span>{_l('等待审批加入群组')}</span>
            <Icon icon="arrow-up-border1" className="Font14 Gray_9e" />
          </span>
        )}
      />
    );
    const renderAction = () => {
      if (user.groupUserRole === 1 && user.isCreateUser) {
        return <span className="action">{_l('群主')}</span>;
      }
      if (user.groupUserRole === 1 && user.accountId === md.global.Account.accountId) {
        return <span className="action">{_l('管理员')}</span>;
      }
      if (groupInfo.isPost) {
        return DropdownCon;
      } else {
        return groupInfo.isAdmin ? (
          <span className="ThemeColor action Hand" onClick={() => onClickUserAction(3, user)}>
            {_l('移出')}
          </span>
        ) : null;
      }
    };
    return (
      <div className="userItem valignWrapper">
        <UserHead
          user={{
            userHead: user.avatar,
            accountId: user.accountId,
          }}
          size={28}
          projectId={_.get(groupInfo, 'project.projectId')}
        />
        <span className="name overflow_ellipsis">{user.fullname}</span>
        <span className="job overflow_ellipsis">
          {user.department}
          {user.department && user.job && '|'}
          {user.job}
        </span>
        {renderAction()}
      </div>
    );
  };

  const renderCovertPostDialog = () => {
    return (
      <Dialog
        visible={groupInfo.covertVisible}
        title={_l('转换为长期群组')}
        okDisabled={groupInfo.covertOkDisabled}
        onOk={() => updateGroup({ projectId: groupInfo.chatOrgId, covertVisible: false }, 12, ['projectId'], true)}
        onCancel={() => setState({ covertVisible: false })}
      >
        <div>
          <div className="mTop15 Gray_6 flexRow alignItemsCenter">
            <div>{_l('所属组织')}</div>
            <div className="mLeft15 flex">{renderOrg()}</div>
          </div>
          <p className="mTop15 Gray_6">{_l('点选转换后，该长期群组将永久隶属于此组织，不可更改')}</p>
        </div>
      </Dialog>
    );
  };

  const renderUserDialog = () => {
    const userList = _.get(groupInfo, 'users.groupUsers', []);
    const loading = groupInfo.loading && groupInfo.userLoading;
    return (
      <SettingDialog
        visible={groupInfo.userDialogVisible}
        width={620}
        type="fixed"
        title={
          <span className="valignWrapper">
            <Icon
              icon="backspace"
              className="Font20 Bold mRight8 Hand"
              onClick={() => setState({ userDialogVisible: false })}
            />
            {groupInfo.isPost ? _l('群成员') : _l('聊天成员')}
            {!loading && _l('（%0人）', _.get(groupInfo, 'groupMemberCount'))}
          </span>
        }
        footer={null}
        onCancel={() => setState({ userDialogVisible: false })}
      >
        {loading ? (
          <LoadDiv />
        ) : (
          <UserDialogContent>
            {(groupInfo.isAdmin ? true : !groupInfo.isForbidInvite) && (
              <div className="valignWrapper mBottom16">
                <Button icon="add" className="mRight10" onClick={quickInviteEvent}>
                  {_l('添加成员')}
                </Button>
                <Button type="ghost" onClick={inviteFriends}>
                  {_l('更多邀请')}
                </Button>
              </div>
            )}
            <div className="selectUsers minHeight0">
              <div className="searchWrap">
                <Icon icon="search" className="mRight5 Gray_75" />
                <Input
                  className="w100"
                  placeholder={_l('搜索')}
                  value={groupInfo.keywords}
                  onChange={value => {
                    setState({ keywords: value, pageIndex: 1 });
                    debouncedSearch(value);
                  }}
                />
              </div>
              <div className="userList minHeight0">
                {_.isEmpty(userList) ? (
                  <div className="Gray_bd Font13 mTop32 TxtCenter">{_l('无匹配结果')}</div>
                ) : (
                  <ScrollView onScrollEnd={onScrollEnd}>{userList.map(l => renderUserItem(l))}</ScrollView>
                )}
              </div>
            </div>
          </UserDialogContent>
        )}
      </SettingDialog>
    );
  };

  const renderAboutDialog = () => {
    return (
      <SettingDialog
        visible={groupInfo.aboutDialogVisible}
        width={620}
        type="fixed"
        title={
          <span className="valignWrapper">
            <Icon icon="backspace" className="Font20 Bold mRight8" onClick={onCloseAbout} />
            {_l('群公告')}
          </span>
        }
        footer={null}
        onCancel={onCloseAbout}
      >
        <div className="flexColumn h100">
          <AboutTextarea
            className="flex"
            value={groupInfo.about}
            disabled={!groupInfo.isAdmin}
            placeholder={_l('请输入群公告')}
            onChange={value => setState({ about: value })}
          />
        </div>
      </SettingDialog>
    );
  };

  return (
    <Fragment>
      <SettingDialog visible={visible} width={620} title={_l('设置')} footer={null} onCancel={onClose}>
        {groupInfo.loading && groupInfo.userLoading ? (
          <div style={{ height: 300 }} className="flexRow alignItemsCenter justifyContentCenter">
            <LoadDiv />
          </div>
        ) : (
          <ContentWrap>
            {renderHeader()}
            {renderContent()}
            {renderButtons()}
          </ContentWrap>
        )}
      </SettingDialog>
      {renderUserDialog()}
      {renderAboutDialog()}
      {renderCovertPostDialog()}
    </Fragment>
  );
}

export default function settingGroup(props) {
  functionWrap(SettingGroup, props);
}
