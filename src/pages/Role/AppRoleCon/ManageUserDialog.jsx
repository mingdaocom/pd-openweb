import React, { useRef, useState, Fragment, useEffect } from 'react';
import { useSetState } from 'react-use';
import { Dialog, LoadDiv } from 'ming-ui';
import styled from 'styled-components';
import UserTable from 'src/pages/Role/AppRoleCon/UserCon/UserListCon/index.jsx';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'src/pages/Role/AppRoleCon/redux/actions';
import HomeAjax from 'src/api/homeApp';
import AppAjax from 'src/api/appManagement';
import { getUserRole, canEditApp, canEditData } from 'src/pages/worksheet/redux/actions/util';
import 'src/pages/Role/style.less';
import { dialogSelectUser } from 'ming-ui/functions';

const Wrapper = styled.div`
  min-height: 640px; //最小高度
  height: 100%;
  overflow: hidden;
  .iconBG {
    width: 32px;
    height: 32px;
    background: #2196f3;
    border-radius: 20px;
  }
  .wrapTr:not(.checkBoxTr):not(.optionWrapTr) {
    width: calc(calc(calc(100% - 30px - 38px) / 100) * 15);
  }
  .ming.Dropdown .Dropdown--input,
  .dropdownTrigger .Dropdown--input {
    padding: 0;
  }
  .topActDrop .Dropdown--input {
    display: flex;
    align-items: center;
    & > span.value {
      display: inline-block;
      flex: 1;
    }
    .icon {
      display: block;
    }
  }
  .memberTag {
    font-size: 12px;
    color: #2196f3;
    padding: 2px 6px;
    border-radius: 12px;
    background: #f3faff;
    display: inline-block;
    flex-shrink: 0;
  }
  .ownerTag {
    color: #fff;
    background: #2196f3;
    font-weight: bold;
    padding: 2px 6px;
    font-size: 12px;
    border-radius: 12px;
    display: inline-block;
    flex-shrink: 0;
  }
`;

function ManageUserDialog(props) {
  const {
    onCancel,
    appId,
    getRoleSummary,
    getUserList,
    appRole,
    setAppRoleSummary,
    setUserList,
    SetAppRolePagingModel,
    setLoading,
  } = props;
  const [{ loading, appDetail, notify }, setState] = useSetState({
    loading: true,
    appDetail: {},
    notify: false,
  });
  useEffect(() => {
    setLoading(true);
    HomeAjax.getApp({
      appId,
    }).then(appDetail => {
      setState({
        appDetail,
        // isExternal: appDetail.sourceType === 55
      });
      getRoleSummary(appId);
      getUserList({ appId }, true);
    });
    AppAjax.getAppRoleSetting({ appId }).then(data => {
      setState({ notify: data.notify });
    });
    return () => {
      setUserList([]);
      setAppRoleSummary([]);
      SetAppRolePagingModel(null);
    };
  }, []);

  useEffect(() => {
    setState({
      loading: appRole.pageLoading,
    });
  }, [appRole]);

  /**
   * 转交他人
   */
  const transferApp = () => {
    const { projectId, appId, onCancel } = props;

    dialogSelectUser({
      showMoreInvite: false,
      SelectUserSettings: {
        projectId,
        filterAll: true,
        filterFriend: true,
        filterOthers: true,
        filterOtherProject: true,
        unique: true,
        callback: users => {
          AppAjax.updateAppOwner({
            appId,
            memberId: users[0].accountId,
          }).then(res => {
            if (res) {
              onCancel();
              // location.reload();
            } else {
              alert(_l('托付失败'), 2);
            }
          });
        },
      },
    });
  };

  let { isOwner, isAdmin } = getUserRole(appDetail.permissionType);
  isAdmin = isOwner || isAdmin;
  const editApp = canEditApp(appDetail.permissionType, appDetail.isLock);
  const editUser = canEditData(appDetail.permissionType);
  const updateAppRoleNotify = () => {
    const { appId } = props;
    AppAjax.updateAppRoleNotify({ appId, notify: !notify }).then(data => {
      if (data) {
        setState({ notify: !notify });
      }
    });
  };
  return (
    <Dialog
      visible
      title={null}
      width={1000}
      footer={null}
      onCancel={() => {
        onCancel();
      }}
      bodyClass={'pAll0 manageUserDialogBody flexColumn'}
      headerClass={'pAll0'}
    >
      <Wrapper className="flex flexColumn">
        {loading ? (
          <LoadDiv />
        ) : (
          <UserTable
            {...props}
            notify={notify}
            updateAppRoleNotify={updateAppRoleNotify}
            appDetail={appDetail}
            isAdmin={isAdmin}
            isOwner={isOwner}
            canEditUser={editUser}
            canEditApp={editApp}
            isExternal={true}
            roleList={_.get(props, 'appRole.roleInfos') || []}
            freshNum={() => getUserList({ appId }, true)}
            transferApp={() => transferApp()}
          />
        )}
      </Wrapper>
    </Dialog>
  );
}

const mapStateToProps = state => ({
  appRole: state.appRole,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ManageUserDialog);
