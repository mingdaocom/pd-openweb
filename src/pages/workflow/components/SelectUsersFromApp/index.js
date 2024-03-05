import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import ajaxRequest from 'src/api/appManagement';
import { Dialog, LoadDiv, Dropdown, Button, MultipleDropdown } from 'ming-ui';
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
          text: selectAppId === appId ? appName + _l('（本应用）') : appName,
          label: appName,
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
          label: name,
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
    const appName = appList.find(item => item.value === selectAppId).label;
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
    const label = selectRoleIds.map(id => roles.find(item => item.value === id).label);

    return (
      <Fragment>
        <div className="formItem flexRow mTop10">
          <div className="label">{_l('应用')}</div>
          <div className="content">
            <Dropdown
              isAppendToBody
              border
              openSearch
              className="w100"
              placeholder={_l('请选择')}
              noData={_l('没有可选的应用')}
              value={selectAppId}
              data={appList}
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
            <MultipleDropdown
              className={label.length ? '' : 'noSelectRoles'}
              value={selectRoleIds}
              options={roles}
              multipleSelect={multiChoose}
              label={label.length ? label.join('、') : _l('选择角色')}
              multipleLevel={false}
              multipleHideDropdownNav
              filter
              filterHint={_l('搜索')}
              onChange={(evt, ids) => this.setState({ selectRoleIds: multiChoose ? ids : [ids] })}
            />
          </div>
        </div>
        <div className="btns TxtRight mTop20">
          <Button type="link" onClick={onCancel}>
            {_l('取消')}
          </Button>
          <Button disabled={!selectAppId || !selectRoleIds.length} onClick={this.onOk}>
            {_l('确定')}
          </Button>
        </div>
      </Fragment>
    );
  }

  render() {
    const { appList } = this.state;

    return (
      <Dialog
        className="selectUserFromAppDialog"
        visible
        title={_l('选择应用下角色')}
        footer={null}
        onCancel={this.props.onCancel}
      >
        {appList === null ? <LoadDiv /> : this.renderContent()}
      </Dialog>
    );
  }
}
