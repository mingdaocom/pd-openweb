import React, { Component, Fragment } from 'react';
import { Icon, LoadDiv, UpgradeIcon, Tooltip } from 'ming-ui';
import VerifyDel from 'src/pages/AppHomepage/components/VerifyDel';
import homeAppApi from 'api/homeApp';
import { APP_CONFIGS } from './config';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum';
import appConfigWidgets from './appConfigWidgets';
import { getAppConfig } from './util';
import { getFeatureStatus, buriedUpgradeVersionDialog, setFavicon, getTranslateInfo } from 'src/util';
import cx from 'classnames';
import './index.less';
import { navigateTo } from 'src/router/navigateTo';
import Beta from './components/Beta';

function UpgradeCom({ projectId, featureId }) {
  return <Fragment>{buriedUpgradeVersionDialog(projectId, featureId, { dialogType: 'content' })}</Fragment>;
}

class AppSettings extends Component {
  constructor(props) {
    super(props);
    const type = localStorage.getItem('appManageMenu');
    this.state = {
      currentConfigType: _.get(props, 'match.params.navTab') || type || 'options',
      loading: true,
      data: {},
      delAppConfirmVisible: false,
      collapseAppManageNav: localStorage.getItem('collapseAppManageNav') === 'true' ? true : false,
    };
  }

  componentDidMount() {
    this.getData();
    if (this.props.location.search === '?backup') {
      this.setState({
        currentConfigType: 'backup',
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search === '?backup') {
      this.setState({
        manageBackupFilesVisible: true,
      });
    }
    if (_.get(this.props, 'match.params.navTab') !== _.get(nextProps, 'match.params.navTab')) {
      this.setState({ currentConfigType: _.get(nextProps, 'match.params.navTab') });
    }
  }

  getData = () => {
    const { appId } = _.get(this.props, 'match.params');
    homeAppApi
      .getApp({
        appId: md.global.Account.isPortal ? md.global.Account.appId : appId,
        getSection: true,
        getManager: window.isPublicApp ? false : true,
        getLang: true,
      })
      .then(data => {
        setFavicon(data.iconUrl, data.iconColor);
        const { permissionType, id, isLock, isPassword, projectId } = data;
        const list = getAppConfig(APP_CONFIGS, permissionType).filter(
          it => !it.featureId || getFeatureStatus(projectId, it.featureId),
        );
        if (!permissionType || (isLock && isPassword) || _.isEmpty(list)) {
          navigateTo(`/app/${id}`); // 普通角色、加锁应用、无应用管理中特性时跳至应用首页
          return;
        }
        data.name = getTranslateInfo(id, id).name || data.name;
        this.setState({ data, loading: false }, this.getConfigList);
      })
      .catch(err => {
        this.setState({ loading: false });
      });
  };

  // 删除应用
  handleDelApp = () => {
    const { appId } = _.get(this.props, 'match.params');
    const { data: { projectId } = { projectId: '' } } = this.state;
    this.setState({ delAppConfirmVisible: false });
    homeAppApi.deleteApp({ appId, projectId, isHomePage: true }).then(res => {
      navigateTo('/dashboard');
    });
  };

  getConfigList = () => {
    const { data } = this.state;
    const { permissionType, isLock, isPassword, projectId, sourceType, id } = data;
    const isNormalApp = sourceType === 1;
    const isOwner = permissionType === APP_ROLE_TYPE.POSSESS_ROLE; // 拥有者
    const canLock = _.includes(
      [
        APP_ROLE_TYPE.ADMIN_ROLE,
        APP_ROLE_TYPE.DEVELOPERS_ROLE,
        APP_ROLE_TYPE.RUNNER_DEVELOPERS_ROLE,
        APP_ROLE_TYPE.POSSESS_ROLE,
      ],
      permissionType,
    );
    const configList = getAppConfig(APP_CONFIGS, permissionType)
      .filter(it => !it.featureId || getFeatureStatus(projectId, it.featureId))
      .filter(it => {
        if (it.type === 'lock') {
          if (canLock && data.isPassword) return true; // 管理员、开发者、运营者+开发者、拥有者对自己已解锁的应用有恢复锁定权限
          if (!(isOwner && isNormalApp && !isLock && !isPassword)) return false; // 仅普通应用的拥有者可锁定应用
        }
        return true;
      });

    const type = localStorage.getItem('appManageMenu');
    const hasMenu = _.includes(
      configList.map(v => v.type),
      type,
    );
    this.setState({
      configList,
      currentConfigType: type && hasMenu ? type : 'options',
    });
    if (type && !hasMenu) {
      safeLocalStorageSetItem('appManageMenu', 'options');
      location.href = `/app/${id}/settings/options`;
    }
  };

  render() {
    const {
      currentConfigType,
      data,
      loading,
      delAppConfirmVisible,
      configList = [],
      collapseAppManageNav,
    } = this.state;
    const { id: appId, name, permissionType, projectId, fixed } = data;
    const featureId = (_.find(configList, it => it.type === currentConfigType) || {})['featureId'];
    const featureType = featureId && getFeatureStatus(projectId, featureId);
    const Component =
      featureType && featureType === '2' && !['variables', 'aggregation'].includes(currentConfigType)
        ? UpgradeCom
        : appConfigWidgets[currentConfigType] || appConfigWidgets['options'];

    const componentProps = {
      ...this.props,
      data,
      projectId,
      appId,
      name,
      fixed,
      permissionType,
      appName: name,
      featureId: featureType && featureType === '2' ? featureId : undefined,
      onChangeData: obj =>
        this.setState({
          data: {
            ...data,
            ...obj,
          },
        }),
    };

    return (
      <div className="manageAppWrap flexRow">
        <div className={cx('manageAppLeft', { collapseManageAppLeft: collapseAppManageNav })}>
          <div className="flex">
            {configList.map(item => {
              const { type, icon, text } = item;
              return (
                <Fragment>
                  {_.includes(['publish', 'recyclebin'], type) && <div className="line"></div>}
                  <div
                    key={type}
                    className={cx(`configItem ${type}`, {
                      active: type === currentConfigType,
                      collapseItem: collapseAppManageNav,
                    })}
                    onClick={() => {
                      // 删除应用
                      if (type === 'del') {
                        this.setState({ delAppConfirmVisible: true });
                        return;
                      }
                      safeLocalStorageSetItem('appManageMenu', type);
                      navigateTo(`/app/${appId}/settings/${type}`);
                      this.setState({ currentConfigType: type });
                    }}
                  >
                    {collapseAppManageNav ? (
                      <Tooltip popupPlacement="right" popupAlign={{ offset: [5, 0] }} text={<span>{text}</span>}>
                        <Icon className="appConfigItemIcon Font18" icon={icon} />
                      </Tooltip>
                    ) : (
                      <Icon className="appConfigItemIcon Font18 mRight10" icon={icon} />
                    )}
                    {!collapseAppManageNav && (
                      <Fragment>
                        <span className="flex">
                          {text}
                          {['aggregation', 'relationship'].includes(type) && <Beta className="mRight15" />}
                        </span>
                        {item.featureId &&
                          getFeatureStatus(projectId, item.featureId) === '2' &&
                          _.includes(
                            ['backup', 'recyclebin', 'variables', 'language', 'upgrade', 'aggregation'],
                            type,
                          ) && <UpgradeIcon />}
                      </Fragment>
                    )}
                  </div>
                </Fragment>
              );
            })}
          </div>
          <div className={cx('collapseWrap TxtRight', { collapseHideWrap: collapseAppManageNav })}>
            <Tooltip text={<span>{!collapseAppManageNav ? _l('收起') : _l('展开')}</span>}>
              <Icon
                icon={!collapseAppManageNav ? 'menu_left' : 'menu_right'}
                className="Font20 Gray_9e pointer collapseWrapIcon"
                onClick={() => {
                  safeLocalStorageSetItem('collapseAppManageNav', !collapseAppManageNav);
                  this.setState({ collapseAppManageNav: !collapseAppManageNav });
                }}
              />
            </Tooltip>
          </div>
        </div>
        <div className={cx('manageAppRight flex flexColumn', currentConfigType)}>
          {loading ? <LoadDiv /> : <Component {...componentProps} />}
        </div>
        {delAppConfirmVisible && (
          <VerifyDel
            name={name}
            onOk={this.handleDelApp}
            onCancel={() => this.setState({ delAppConfirmVisible: false })}
          />
        )}
      </div>
    );
  }
}

export default AppSettings;
