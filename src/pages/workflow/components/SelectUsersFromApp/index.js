import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { LoadDiv } from 'ming-ui';
import { Button, Modal, Select } from 'ming-ui/antd-components';
import ajaxRequest from 'src/api/appManagement';
import { getTranslateInfo } from 'src/utils/services/app';
import './index.less';

export default class SelectUsersFromApp extends Component {
  static propTypes = {
    appId: PropTypes.string,
    companyId: PropTypes.string.isRequired,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    multiChoose: PropTypes.bool,
  };
  static defaultProps = {
    appId: '',
    onOk: () => {},
    onCancel: () => {},
    multiChoose: true,
  };

  constructor(props) {
    super(props);

    this.state = {
      selectAppId: props.appId,
      selectRoleIds: [],
      appList: null,
      roles: [],
    };
  }

  componentDidMount() {
    const { selectAppId } = this.state;

    this.getAppList();

    if (selectAppId) {
      this.getRolesByApp(selectAppId);
    }
  }

  /**
   * 获取所有的应用
   */
  getAppList() {
    const { selectAppId } = this.state;

    ajaxRequest.getManagerApps({ projectId: this.props.companyId }).then(result => {
      result = result.map(({ appId, appName }) => {
        return {
          value: appId,
          label: selectAppId === appId ? appName + _l('（本应用）') : appName,
          name: appName,
        };
      });

      this.setState({ appList: result });

      if (!selectAppId && result.length) {
        this.setState({ selectAppId: result[0].value });
        this.getRolesByApp(result[0].value);
      }
    });
  }

  /**
   * 根据应用获取角色
   */
  getRolesByApp(appId) {
    ajaxRequest.getRolesWithUsers({ appId }).then(res => {
      res = res.map(({ roleId, name, users, departmentsInfos }) => {
        return {
          value: roleId,
          label: getTranslateInfo(appId, null, roleId).name || name,
          count: users.length + departmentsInfos.length,
        };
      });

      this.setState({ roles: res });
    });
  }

  /**
   * 确认事件
   */
  onOk = () => {
    const { selectAppId, selectRoleIds, appList, roles } = this.state;
    const appName = appList.find(item => item.value === selectAppId).name;
    const rolesList = selectRoleIds.map(roleId => {
      const singleRole = roles.find(item => item.value === roleId);
      return {
        roleId,
        roleName: singleRole.label,
        count: singleRole.count,
      };
    });

    this.props.onOk({
      appId: selectAppId,
      appName,
      roles: rolesList,
    });
  };

  /**
   * 渲染内容
   */
  renderContent() {
    const { onCancel, multiChoose } = this.props;
    const { selectAppId, selectRoleIds, appList, roles } = this.state;

    return (
      <Fragment>
        <div className="formItem flexRow mTop10">
          <div className="label">{_l('应用')}</div>
          <div className="content">
            <Select
              showSearch
              optionFilterProp="label"
              className="w100"
              placeholder={_l('请选择')}
              notFoundContent={_l('没有可选的应用')}
              value={selectAppId || undefined}
              options={appList}
              onChange={id => {
                this.setState({ selectAppId: id, selectRoleIds: [] });
                this.getRolesByApp(id);
              }}
            />
          </div>
        </div>
        <div className="formItem flexRow mTop15">
          <div className="label">{_l('角色')}</div>
          <div className="content">
            <Select
              className="w100"
              mode={multiChoose ? 'multiple' : undefined}
              value={multiChoose ? selectRoleIds : selectRoleIds[0]}
              options={roles}
              placeholder={_l('选择角色')}
              notFoundContent={_l('没有可选的角色')}
              showSearch
              optionFilterProp="label"
              maxTagCount={multiChoose ? 'responsive' : undefined}
              onChange={ids => this.setState({ selectRoleIds: multiChoose ? ids : [ids] })}
            />
          </div>
        </div>
        <div className="btns TxtRight mTop20">
          <Button color="primary" variant="link" onClick={onCancel}>
            {_l('取消')}
          </Button>
          <Button type="primary" disabled={!selectAppId || !selectRoleIds.length} onClick={this.onOk}>
            {_l('确定')}
          </Button>
        </div>
      </Fragment>
    );
  }

  render() {
    const { appList } = this.state;

    return (
      <Modal
        className="selectUserFromAppDialog"
        open
        title={_l('选择应用下角色')}
        footer={null}
        onCancel={this.props.onCancel}
      >
        {appList === null ? <LoadDiv /> : this.renderContent()}
      </Modal>
    );
  }
}
