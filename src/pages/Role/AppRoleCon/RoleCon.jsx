import React from 'react';
import cx from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'src/pages/Role/AppRoleCon/redux/actions';
import _ from 'lodash';
import RoleTem from 'src/pages/Role/component/RolePermissions';
import { LoadDiv, Dialog } from 'ming-ui';
import CopyRoleDialog from 'src/pages/Role/PortalCon/components/CopyRoleDialog';
import appManagementAjax from 'src/api/appManagement';
import DeleRoleDialog from './component/DeleRoleDialog';
import { sysRoleType } from 'src/pages/Role/config.js';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum.js';

class Con extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roleId: '',
      roleList: [],
      copyData: null,
      loading: true,
      showDeleRoleByMoveUser: false,
    };
  }
  componentDidMount() {
    const { appRole = {}, canEditUser } = this.props;
    const { roleInfos = [], quickTag = {} } = appRole;
    // const { roleId } = quickTag;
    this.setState({
      roleId: appRole.roleId
        ? ['all', 'pendingReview', 'apply', 'outsourcing'].includes(appRole.roleId)
          ? (roleInfos[0] || {}).roleId
          : appRole.roleId
        : (roleInfos[0] || {}).roleId,
      roleList: roleInfos,
      dataList: [
        {
          text: _l('管理角色'),
          key: 10,
        },
        {
          text: _l('复制'),
          key: 0,
        },
        {
          text: _l('复制到外部门户'),
          key: 1,
        },
        {
          text: _l('删除'),
          type: 'err',
          key: 3,
        },
      ].filter(o => (canEditUser ? true : o.key !== 10)),
      loading: false,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { appRole = {} } = nextProps;
    const { roleInfos = [] } = appRole;
    if (!_.isEqual(this.props.appRole.roleInfos, roleInfos)) {
      this.setState({
        roleList: roleInfos,
        // roleId: roleInfos.length > 0 ? roleInfos[0].roleId : '',
        loading: false,
      });
    }
  }
  //复制角色到外部门户
  copyRoleToPortal = ({ roleId, roleName }) => {
    const { appId } = this.props;
    appManagementAjax
      .copyRoleToExternalPortal({
        roleId,
        roleName,
        appId,
      })
      .then(res => {
        if (res.resultCode === 1) {
          alert(_l('复制成功'));
        } else if (res.resultCode === 2) {
          alert(_l('角色名称重复，请重新命名'), 3);
        } else {
          alert(_l('复制失败'), 2);
        }
      });
  };

  delDialog = data => {
    if (data.totalCount > 0) {
      if ([APP_ROLE_TYPE.DEVELOPERS_ROLE].includes(_.get(this.props, 'appDetail.permissionType'))) {
        return alert(_l('当前角色已有成员，请移出所有成员后再删除'), 3);
      }
      this.setState({ showDeleRoleByMoveUser: true, roleId: data.roleId });
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
    const { appId, projectId, getRoleSummary } = this.props;
    const { resultRoleId = '' } = data;
    appManagementAjax
      .removeRole({
        appId,
        roleId: data.roleId,
        resultRoleId,
        projectId,
      })
      .then(res => {
        if (res) {
          let list = this.state.roleList.filter(o => o.roleId !== data.roleId);
          this.setState({
            showDeleRoleByMoveUser: false,
            roleId: (list[0] || {}).roleId,
            roleList: list,
          });
          getRoleSummary(appId);
          alert(_l('删除成功'));
        } else {
          alert(_l('操作失败，请刷新页面重试'), 2);
        }
      });
  };
  quickTag = data => {
    this.props.setQuickTag(data);
  };
  render() {
    const { showRoleSet, getRoleSummary, isOpenPortal, appId, projectId, setQuickTag, setRoleId, editType } =
      this.props;
    const { dataList = [], copyData, roleList = [], loading, roleId, showDeleRoleByMoveUser } = this.state;
    if (loading) {
      return <LoadDiv />;
    }
    return (
      <React.Fragment>
        {!!copyData && (
          <CopyRoleDialog
            editType={editType}
            appId={appId}
            copyData={copyData}
            setCopyData={data =>
              this.setState({
                copyData: data,
              })
            }
            updataRoleData={id => {
              getRoleSummary(appId);
              this.setState({
                roleList: [...roleList, { ...copyData, roleId: id }],
                roleId: id,
              });
            }}
          />
        )}
        <RoleTem
          {...this.props}
          setQuickTag={data => {
            this.quickTag(data);
          }}
          projectId={projectId}
          key={this.state.roleId}
          roleId={this.state.roleId}
          showRoleSet={showRoleSet}
          roleList={roleList}
          isForPortal={false}
          dataList={dataList.filter(o => (isOpenPortal ? true : o.key !== 1))}
          appId={appId}
          editCallback={roleId => {
            getRoleSummary(appId);
          }}
          onDelRole={roleId => {
            let data = roleList.find(o => roleId === o.roleId);
            this.delDialog(data);
          }}
          onSelect={roleId => {
            this.quickTag({ roleId: roleId, tab: 'roleSet' });
          }}
          handleMoveApp={list => {
            appManagementAjax
              .sortRoles({
                appId,
                roleIds: list.map(item => item.roleId),
              })
              .then(() => {
                getRoleSummary(appId);
                this.setState({
                  roleId,
                });
              });
          }}
          onAction={(o, data) => {
            switch (o.key) {
              case 10:
                this.quickTag({ roleId: data.roleId, tab: 'user' });
                break;
              case 0:
                this.setState({
                  copyData: data,
                });
                break;
              case 1:
                this.copyRoleToPortal({
                  roleId: data.roleId,
                  roleName: data.name,
                });
                break;
              case 3:
                this.delDialog(data);
                break;
            }
          }}
        />
        {showDeleRoleByMoveUser && (
          <DeleRoleDialog
            roleList={roleList.filter(item => !sysRoleType.includes(item.roleType) && item.roleId !== roleId)}
            onOk={data => {
              this.onRemoveRole({ ...roleList.find(o => o.roleId === roleId), resultRoleId: data });
            }}
            onCancel={() => {
              this.setState({
                showDeleRoleByMoveUser: false,
              });
            }}
          />
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  appRole: state.appRole,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Con);
