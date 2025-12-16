import React, { PureComponent } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Ajax from 'src/api/appManagement';
import externalPortalAjax from 'src/api/externalPortal';
import { PERMISSION_WAYS } from 'src/pages/Role/config.js';
import { sysRoleType } from 'src/pages/Role/config.js';
import SettingForm from './SettingForm';
import { Wrap } from './style';
import { fillTranslateInfo } from './util';

export default class RoleSet extends PureComponent {
  static propTypes = {
    appId: PropTypes.string,
    roleId: PropTypes.string,
    show: PropTypes.bool.isRequired, // 是否显示弹层
    editCallback: PropTypes.func.isRequired, // 编辑创建的回调
  };

  state = {
    loading: false,
    roleDetail: undefined,
    hasChange: false,
    saveLoading: false,
    roleDetailCache: undefined,
  };
  static defaultRoleName = '';

  componentDidMount() {
    this.props.onRef(this);
    this.fetchRoleDetail();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.roleId !== this.props.roleId) {
      this.fetchRoleDetail(nextProps);
    }
  }

  abortRequest() {
    if (this.promise && this.promise.abort) {
      this.promise.abort();
    }
  }

  fetchRoleDetail(props = this.props) {
    let { roleId, appId, roleList, isForPortal } = props;
    roleId = roleId === 'new' ? '' : roleId;
    const data = roleList.find(o => o.roleId === roleId) || {};

    if (sysRoleType.includes(data.roleType)) {
      return;
    }
    this.abortRequest();
    this.setState({ loading: true });

    let promise;

    if (roleId) {
      this.promise = Ajax.getRoleDetail({
        roleId,
        appId,
        isPortal: isForPortal,
      });

      promise = this.promise;
    } else {
      this.promise = Ajax.getAddRoleTemplate({
        appId,
        isPortal: isForPortal,
      });

      promise = this.promise.then(roleDetail => {
        // 兼容默认模板没有description
        roleDetail.permissionWay = PERMISSION_WAYS.ViewAllAndManageSelfRecord;
        return {
          ...roleDetail,
          description: '',
          name: _l('新角色'),
        };
      });
    }

    promise
      .then(
        roleDetail => {
          fillTranslateInfo(appId, roleDetail);
          this.setState({
            roleDetail,
            roleDetailCache: roleDetail,
            hasChange: !roleId,
          });
          this.defaultRoleName = roleDetail.name;
        },
        () => {},
      )
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  }

  updateRoleDetail = payload => {
    const { roleId } = this.props;
    let details = {
      ...this.state.roleDetail,
      ...payload,
    };
    this.setState({
      roleDetail: details,
      hasChange: !roleId ? true : !_.isEqual(details, this.state.roleDetailCache),
    });
  };

  onFormat = () => {
    this.props.onFormat();
  };

  onSave = isConfirm => {
    let { appId, roleId, editCallback, isForPortal, projectId } = this.props;
    roleId = roleId === 'new' ? '' : roleId;
    if (!roleId) {
      // 创建
      const {
        roleDetail: { ...params },
      } = this.state;
      let param = {
        appId,
        ...params,
        name: params.name.trim() || this.defaultRoleName,
        sheets: params.permissionWay === PERMISSION_WAYS.CUSTOM ? params.sheets : undefined,
      };
      let promiseAjax = null;
      this.setState({
        saveLoading: true,
      });
      if (isForPortal) {
        promiseAjax = externalPortalAjax.addExRole({ ...param, projectId });
      } else {
        promiseAjax = Ajax.addRole(param);
      }
      promiseAjax.then(res => {
        if (res.resultCode === 1) {
          this.setState({
            hasChange: false,
            saveLoading: false,
          });
          editCallback(res.roleId, isConfirm);
          alert(_l('创建成功'));
        } else if (res.resultCode === 2) {
          alert(_l('角色名称重复，请重新命名'), 3);
          this.setState({ saveLoading: false });
        } else {
          alert(_l('创建失败'), 2);
          this.setState({ saveLoading: false });
        }
      });
    } else {
      // 编辑  内部和外部门户同一个接口
      const { roleDetail = {} } = this.state;
      this.setState({
        saveLoading: true,
      });
      let promiseAjax = null;
      let param = {
        projectId: roleDetail.projectId,
        appId,
        roleId,
        appRoleModel: {
          ...roleDetail,
          name: (roleDetail.name || '').trim() || this.defaultRoleName,
          sheets: roleDetail.permissionWay === PERMISSION_WAYS.CUSTOM ? roleDetail.sheets : undefined,
        },
      };
      if (isForPortal) {
        promiseAjax = externalPortalAjax.editAppExRole(param);
      } else {
        promiseAjax = Ajax.editAppRole(param);
      }
      return promiseAjax.then(res => {
        if (res === 1) {
          this.setState({
            hasChange: false,
            saveLoading: false,
            roleDetailCache: roleDetail,
          });
          editCallback(roleId, isConfirm);
          alert(_l('保存成功'));
        } else if (res === 2) {
          alert(_l('角色名称重复，请重新命名'), 3);
          this.setState({ saveLoading: false });
        } else {
          alert(_l('编辑失败'), 2);
          this.setState({ saveLoading: false });
        }
      });
    }
  };

  render() {
    let { roleId, isForPortal, showRoleSet, projectId, appId, setQuickTag, onDelRole, handleChangePage, canEditUser } =
      this.props;
    roleId = roleId === 'new' ? '' : roleId;
    const { roleDetail, loading, saveLoading, roleDetailCache } = this.state;
    const formProps = {
      canEditUser,
      setQuickTag,
      showRoleSet,
      isForPortal,
      roleDetail,
      loading: loading || roleDetail === undefined,
      saveLoading,
      onChange: this.updateRoleDetail,
      onSave: this.onSave,
      projectId,
      appId,
      roleDetailCache,
      onDel: () => {
        this.setState(
          {
            hasChange: false,
          },
          () => {
            roleId
              ? this.setState({
                  roleDetail: roleDetailCache,
                })
              : onDelRole(roleId);
          },
        );
      },
      handleChangePage: handleChangePage,
    };

    return (
      <Wrap>
        <SettingForm {...formProps} />
      </Wrap>
    );
  }
}
