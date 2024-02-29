import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'src/pages/Role/AppRoleCon/redux/actions';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, LoadDiv } from 'ming-ui';
import AppAjax from 'src/api/appManagement';
import { navigateTo } from 'src/router/navigateTo';
import RoleNav from './RoleNav';
import DeleRoleDialog from 'src/pages/Role/AppRoleCon/component/DeleRoleDialog.jsx';
import UserListCon from './UserListCon';
import { sysRoleType } from 'src/pages/Role/config.js';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum.js';

const Wrap = styled.div`
  height: 100%;
  .navConList {
    overflow: auto !important;
    padding: 6px 8px 10px;
  }
  .overflowHidden {
    overflow: hidden !important;
  }
  .hs {
    width: 6px;
    height: 6px;
    background: #f44336;
    border-radius: 50%;
    position: relative;
    top: -1px;
  }
  .isMyRole {
    width: 4px;
    height: 4px;
    background: #2196f3;
    border-radius: 50%;
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translate(0, -50%);
  }
  .optionNs {
    width: 20px;
    height: 20px;
    background: transparent;
    border-radius: 3px 3px 3px 3px;
    .moreop,
    .num {
      width: 20px;
      height: 20px;
      position: absolute;
      right: 0;
      top: 0;
      line-height: 20px;
      text-align: center;
    }
    .num {
      opacity: 1;
    }
    .moreop {
      opacity: 0;
    }
  }
  .navRoleLi {
    &:hover {
      .optionNs {
        .num {
          opacity: 0;
          z-index: 0;
        }
        .moreop {
          opacity: 1;
          z-index: 1;
        }
      }
    }
  }
  .iconBG {
    width: 32px;
    height: 32px;
    background: #2196f3;
    border-radius: 20px;
  }
  .memberInfo {
    .memberName {
      font-weight: 400;
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
  }
`;
class Con extends React.Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { editType },
      },
    } = props;
    this.state = {
      roleId: editType || 'all',
      keywords: '',
      roleList: [],
      showDeleRoleByMoveUser: false,
      loading: true,
      delId: '',
      selectDebugRole: [],
    };
  }
  componentDidMount() {
    const {
      setRoleId,
      isAdmin,
      appRole = {},
      match: {
        params: { editType },
      },
      getUserList,
      appId,
      appDetail = {},
    } = this.props;
    const { roleInfos = [] } = appRole;
    const { quickTag } = appRole;
    if (quickTag.roleId) {
      this.setState({
        roleId: editType || quickTag.roleId,
      });
    } else {
      setRoleId(editType ? editType : appRole.roleId ? appRole.roleId : 'all');
    }
    if (!!editType && editType !== 'all') {
      //申请加入等地址，获取全部项计数
      getUserList({ appId }, true);
    }
    if ((appDetail.debugRole || {}).canDebug) {
      this.setState({
        selectDebugRole: appDetail.debugRole.selectedRoles,
      });
    }

    this.setState({
      roleList: roleInfos,
      loading: false,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.appRole.pageLoading !== this.props.appRole.pageLoading ||
      nextProps.appRole.roleId !== this.props.appRole.roleId
    ) {
      this.setState(
        {
          roleId: nextProps.appRole.roleId,
        },
        () => {
          nextProps.setRoleId(nextProps.appRole.roleId);
        },
      );
    }
    const editType = _.get(nextProps, ['match', 'params', 'editType']);
    if (!!editType && !_.isEqual(editType, _.get(this.props, ['match', 'params', 'editType']))) {
      this.setState({
        roleId: editType,
      });
    }
    if (nextProps.appRole.roleInfos !== this.props.appRole.roleInfos) {
      this.setState({
        roleList: nextProps.appRole.roleInfos,
      });
    }
  }

  delDialog = data => {
    if (data.totalCount > 0) {
      if ([APP_ROLE_TYPE.DEVELOPERS_ROLE].includes(_.get(this.props, 'appDetail.permissionType'))) {
        return alert(_l('当前角色已有成员，请移出所有成员后再删除'), 3);
      }
      this.setState({ showDeleRoleByMoveUser: true, delId: data.roleId });
    } else {
      return Dialog.confirm({
        title: <span className="Red">{_l('你确认删除此角色吗？')}</span>,
        buttonType: 'danger',
        description: '',
        onOk: () => {
          this.onRemoveRole(data);
        },
      });
    }
  };
  onRemoveRole = data => {
    const { appId, projectId, getRoleSummary, setRoleId } = this.props;
    const { resultRoleId = '' } = data;
    AppAjax.removeRole({
      appId,
      roleId: data.roleId,
      resultRoleId,
      projectId,
    }).then(res => {
      if (res) {
        let list = this.state.roleList.filter(o => o.roleId !== data.roleId);
        setRoleId('all');
        this.setState({
          showDeleRoleByMoveUser: false,
          roleId: 'all',
          roleList: list,
        });
        getRoleSummary(appId);
        alert(_l('删除成功'));
      } else {
        alert(_l('操作失败，请刷新页面重试'), 2);
      }
    });
  };

  /**
   * 退出角色
   */
  exitRole = roleId => {
    const { appId = '', SetAppRolePagingModel } = this.props;
    return AppAjax.quitAppForRole({
      appId,
      roleId,
    }).then(res => {
      if (res.isRoleForUser) {
        if (res.isRoleDepartment) {
          if (this.state.roleList.filter(it => it.isMyRole).length <= 1) {
            navigateTo(`/app/${appId}`);
          }
          location.reload();
        } else {
          Dialog.confirm({
            title: <span style={{ color: '#f44336' }}>{_l('无法退出非“人员”类型成员加入的角色')}</span>,
            description: _l('非“人员”类型的成员，只能由管理员或运营者操作'),
            closable: false,
            removeCancelBtn: true,
            okText: _l('关闭'),
          });
          SetAppRolePagingModel(null);
          this.freshNum();
        }
      } else {
        alert(_l('操作失败，请刷新页面重试'), 2);
      }
    });
  };

  freshNum = () => {
    const { appId = '', getUserList, getUserAllCount, fetchAllNavCount, isAdmin, canEditUser } = this.props;
    fetchAllNavCount({
      appId,
      canEditUser,
    });
    getUserList({ appId }, true);
    if (['all'].includes(this.state.roleId)) {
      // getUserList({ appId }, true);
    } else {
      canEditUser && getUserAllCount({ appId });
    }
  };

  render() {
    const { roleList, showDeleRoleByMoveUser, delId, selectDebugRole } = this.state;
    const { appRole = {} } = this.props;
    const { pageLoading } = appRole;
    if (pageLoading) {
      return <LoadDiv />;
    }
    return (
      <Wrap className="flexRow">
        <RoleNav
          {...this.props}
          {...this.state}
          selectDebugRole={selectDebugRole}
          onChange={data => {
            this.setState({ ...data });
          }}
          exitRole={this.exitRole}
          delDialog={this.delDialog}
        />
        <UserListCon
          {...this.props}
          {...this.state}
          freshNum={this.freshNum}
          onChange={data => {
            this.setState({ ...data });
          }}
        />
        {showDeleRoleByMoveUser && (
          <DeleRoleDialog
            roleList={roleList.filter(item => !sysRoleType.includes(item.roleType) && item.roleId !== delId)}
            onOk={data => {
              this.onRemoveRole({ ...roleList.find(o => o.roleId === delId), resultRoleId: data });
            }}
            onCancel={() => {
              this.setState({
                showDeleRoleByMoveUser: false,
                delId: '',
              });
            }}
          />
        )}
      </Wrap>
    );
  }
}

const mapStateToProps = state => ({
  appRole: state.appRole,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Con);
