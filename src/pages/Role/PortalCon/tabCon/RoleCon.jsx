import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { Dialog, LoadDiv } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';
import externalPortalAjax from 'src/api/externalPortal';
import RoleTem from 'src/pages/Role/component/RolePermissions';
import CopyRoleDialog from 'src/pages/Role/PortalCon/components/CopyRoleDialog';
import * as actions from 'src/pages/Role/PortalCon/redux/actions';

class Con extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roleId: '',
      roleList: [],
      defaultRoleId: '',
      copyData: null,
    };
  }
  componentDidMount() {
    const { portal = {}, canEditUser } = this.props;
    const { roleList = [] } = portal;
    this.setState({
      roleId: portal.roleId
        ? ['all', 'pendingReview', 'apply', 'outsourcing'].includes(portal.roleId)
          ? (roleList[0] || {}).roleId
          : portal.roleId
        : (roleList[0] || {}).roleId,
      roleList: roleList,
      defaultRoleId: (roleList.find(o => o.isDefault) || {}).roleId,
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
          text: _l('复制到常规'),
          key: 1,
        },
        {
          text: _l('设为默认'),
          key: 2,
        },
        {
          text: _l('删除'),
          type: 'err',
          key: 3,
        },
      ].filter(o => (canEditUser ? true : o.key !== 10)),
    });
  }

  componentWillReceiveProps(nextProps) {
    const { portal = {} } = this.props;
    const { roleList = [] } = portal;
    if (!_.isEqual(nextProps.portal.roleList, roleList)) {
      this.setState({
        roleList: nextProps.portal.roleList,
        defaultRoleId: (nextProps.portal.roleList.find(o => o.isDefault) || {}).roleId,
      });
    }
  }

  delDialog = data => {
    const { roleList = [] } = this.state;
    return Dialog.confirm({
      title: <span className="Red">{_l('你确认删除此角色吗？')}</span>,
      buttonType: 'danger',
      description: '',
      onOk: () => {
        externalPortalAjax
          .removeExRole({
            appId: this.props.appId,
            roleId: data.roleId,
          })
          .then(res => {
            if (res) {
              let list = roleList.filter(o => o.roleId !== data.roleId);
              this.setState({
                roleList: list,
                roleId: (list[0] || {}).roleId,
              });
              this.props.setPortalRoleList(list);
              this.props.setQuickTag({ roleId: 'all', tab: 'roleSet' });
              alert(_l('删除成功'));
            } else {
              alert(_l('删除失败，请稍后重试'), 2);
            }
          });
      },
    });
  };
  // 复制外部门户角色到内部
  copyRoleToInternal = ({ roleId, roleName }) => {
    const { appId } = this.props;
    appManagementAjax
      .copyExternalRolesToInternal({
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
  quickTag = data => {
    const { setQuickTag, setFastFilters, setFastFiltersData } = this.props;
    setQuickTag(data);
    if (data.roleId) {
      if (data.tab !== 'user') {
        setFastFiltersData({
          controlId: 'portal_role',
          values: [data.roleId],
          dataType: 44,
          spliceType: 1,
          filterType: 2, //等于
          DateRange: 0,
          DateRangeType: 1,
        });
      } else {
        setFastFilters({
          controlId: 'portal_role',
          values: [data.roleId],
          dataType: 44,
          spliceType: 1,
          filterType: 2, //等于
          DateRange: 0,
          DateRangeType: 1,
        });
      }
      this.setState({ roleId: data.roleId });
    }
  };
  render() {
    const { getPortalRoleList, setPortalRoleList, portal, showRoleSet, appId, projectId, editType } = this.props;
    const { loading } = portal;
    const { roleList = [], dataList = [], roleId, copyData } = this.state;
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
              this.setState({
                roleList: [...roleList, { ...copyData, roleId: id }],
                roleId: id,
              });
              getPortalRoleList(appId);
            }}
          />
        )}
        <RoleTem
          {...this.props}
          setQuickTag={data => {
            this.quickTag(data);
          }}
          projectId={projectId}
          showRoleSet={showRoleSet}
          key={this.state.roleId}
          roleId={this.state.roleId}
          roleList={roleList}
          isForPortal={true}
          dataList={dataList}
          appId={appId}
          editCallback={roleId => {
            getPortalRoleList(appId, roleId);
          }}
          onDelRole={roleId => {
            let data = roleList.find(o => roleId === o.roleId);
            this.delDialog(data);
          }}
          handleMoveApp={list => {
            appManagementAjax
              .sortRoles({
                appId,
                roleIds: list.map(item => item.roleId),
              })
              .then(() => {
                getPortalRoleList(appId);
                this.setState({
                  roleId,
                });
              });
          }}
          onSelect={roleId => {
            this.quickTag({ roleId: roleId, tab: 'roleSet' });
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
                this.copyRoleToInternal({
                  roleId: data.roleId,
                  roleName: data.name,
                });
                break;
              case 2:
                externalPortalAjax.editDefaultExRole({ appId: appId, defaultRoleId: data.roleId }).then(() => {
                  let newRoleList = this.state.roleList.map(o => {
                    if (o.roleId === data.roleId) {
                      return { ...o, isDefault: true };
                    } else {
                      return { ...o, isDefault: false };
                    }
                  });
                  setPortalRoleList(newRoleList);
                  this.setState({
                    roleId: data.roleId,
                  });
                });
                break;
              case 3:
                this.delDialog(data);
                break;
            }
          }}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Con);
