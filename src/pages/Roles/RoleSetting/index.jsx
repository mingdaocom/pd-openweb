import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import cx from 'classnames';
import { Icon } from 'ming-ui';
import CSSTransitionGroup from 'react-addons-css-transition-group';

import Ajax from 'src/api/appManagement';

import SettingForm from './SettingForm';
import { PERMISSION_WAYS } from '../config';
import styles from './style.less?module';

export default class RoleSetting extends PureComponent {
  static propTypes = {
    appId: PropTypes.string,
    roleId: PropTypes.string,
    show: PropTypes.bool.isRequired, // 是否显示弹层
    closePanel: PropTypes.func.isRequired, // 关闭弹层
    editCallback: PropTypes.func.isRequired, // 编辑创建的回调
  };

  state = {
    loading: false,
    roleDetail: undefined,
  };

  static defaultRoleName = '';

  componentWillReceiveProps(nextProps) {
    if (nextProps.show && !this.props.show) {
      this.fetchRoleDetail(nextProps);
    }
  }

  abortRequest() {
    if (this.promise && this.promise.state() === 'pending' && this.promise.abort) {
      this.promise.abort();
    }
  }

  fetchRoleDetail(props = this.props) {
    const { roleId, appId } = props;

    this.abortRequest();
    this.setState({ loading: true });

    let promise;

    if (roleId) {
      this.promise = Ajax.getRoleDetail({
        roleId,
        appId,
      });

      promise = this.promise;
    } else {
      this.promise = Ajax.getAddRoleTemplate({
        appId,
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
          this.setState({
            roleDetail,
          });
          this.defaultRoleName = roleDetail.name;
        },
        () => {}
      )
      .always(() => {
        this.setState({
          loading: false,
        });
      });
  }

  updateRoleDetail = payload => {
    this.setState(({ roleDetail }) => ({
      roleDetail: {
        ...roleDetail,
        ...payload,
      },
    }));
  };

  onSave = () => {
    const { appId, roleId, editCallback, closePanel } = this.props;

    if (!roleId) {
      // 创建
      const {
        roleDetail: { roleId: useless, ...params },
      } = this.state;
      return Ajax.addRole({
        appId,
        ...params,
        name: params.name.trim() || this.defaultRoleName,
        sheets: params.permissionWay === PERMISSION_WAYS.CUSTOM ? params.sheets : undefined,
      }).then(res => {
        if (res) {
          editCallback();
          closePanel();
          this.setState({
            roleDetail: undefined,
          });
        } else {
          alert(_l('创建失败'), 2);
        }
      });
    } else {
      // 编辑
      const { roleDetail } = this.state;
      return Ajax.editAppRole({
        projectId: roleDetail.projectId,
        appId,
        roleId,
        appRoleModel: {
          ...roleDetail,
          name: roleDetail.name.trim() || this.defaultRoleName,
          sheets: roleDetail.permissionWay === PERMISSION_WAYS.CUSTOM ? roleDetail.sheets : undefined,
        },
      }).then(res => {
        if (res) {
          editCallback();
          closePanel();
          this.setState({
            roleDetail: undefined,
          });
        } else {
          alert(_l('编辑失败'), 2);
        }
      });
    }
  };

  render() {
    const { roleId, show, closePanel } = this.props;
    const { roleDetail, loading } = this.state;

    const formProps = {
      roleDetail,
      loading: loading || roleDetail === undefined,
      closePanel,
      onChange: this.updateRoleDetail,
      onSave: this.onSave,
    };

    return (
      <CSSTransitionGroup
        component={'div'}
        transitionName={'roleSettingSlide'}
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
      >
        {show ? (
          <div className={styles.roleSetting}>
            <div className={styles.header + ' Font17 clearfix'}>
              {roleId ? <span>{_l('设置角色')}</span> : <span>{_l('添加角色')}</span>}
              <Icon icon="close" className="Right LineHeight25 Gray_9 Hand Font22 ThemeHoverColor3" onClick={closePanel} />
            </div>
            <SettingForm {...formProps} />
          </div>
        ) : null}
      </CSSTransitionGroup>
    );
  }
}
