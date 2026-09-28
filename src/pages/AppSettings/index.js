import React, { Component, Fragment, lazy, Suspense } from 'react';
import homeAppApi from 'api/homeApp';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv, Support, UpgradeIcon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { buriedUpgradeVersionDialog, upgradeVersionDialog } from 'src/components/upgradeVersion';
import VerifyDel from 'src/pages/AppHomepage/components/VerifyDel';
import { navigateTo } from 'src/router/navigation/navigateTo';
import {
  isAppSandboxInProduction,
  isSandboxEnvironment,
  isSandboxFeatureEnvironment,
  isSandboxSupportedProject,
} from 'src/utils/domain/app/sandbox';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { APP_ROLE_TYPE } from 'src/utils/domain/worksheet/constants';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { getTranslateInfo } from 'src/utils/services/app';
import { setFavicon } from 'src/utils/services/app';
import { getFeatureStatus } from 'src/utils/services/project';
import { FEATURE_PERMISSION, hasFeaturePermission } from 'src/utils/services/security/permission';
import { routerConfigs } from './routerConfig';
import { getAppConfig } from './util';
import './index.less';

const SANDBOX_PRODUCTION_HIDDEN_TYPES = ['lock', 'upgrade', 'del'];
const LAZY_SETTING_COMPONENTS = new Map(routerConfigs.map(config => [config.type, lazy(config.component)]));

function UpgradeCom({ projectId, featureId }) {
  return (
    <Fragment>
      {buriedUpgradeVersionDialog(projectId, featureId, {
        dialogType: 'content',
      })}
    </Fragment>
  );
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
      allowDelete: true,
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

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.location.search === '?backup') {
        this.setState({
          manageBackupFilesVisible: true,
        });
      }

      if (_.get(prevProps, 'match.params.navTab') !== _.get(this.props, 'match.params.navTab')) {
        this.setState({
          currentConfigType: _.get(this.props, 'match.params.navTab'),
        });
      }
    }
  }

  getFilteredRouterConfigs = (routerConfigs, projectId, permissionType, sandboxStatus) => {
    const { hideRagEmbedFun } = md.global.SysSettings;
    const sandboxEnvironment = isSandboxEnvironment();
    const isSandboxProduction = isAppSandboxInProduction(sandboxStatus);
    const filtered = hideRagEmbedFun
      ? routerConfigs.filter(item => item.featureId !== VersionProductType.vectorKnowledgeBase)
      : routerConfigs;
    return getAppConfig(filtered, permissionType)
      .filter(item => !item.featureId || getFeatureStatus(projectId, item.featureId))
      .filter(item => item.type !== 'sandbox' || isSandboxFeatureEnvironment())
      .filter(item => !sandboxEnvironment || item.type !== 'knowledge')
      .filter(item => !isSandboxProduction || !SANDBOX_PRODUCTION_HIDDEN_TYPES.includes(item.type));
  };
  getData = () => {
    const { appId } = _.get(this.props, 'match.params');

    return homeAppApi
      .getApp({
        appId: md.global.Account.isPortal ? md.global.Account.appId : appId,
        getSection: true,
        getManager: window.isPublicApp ? false : true,
        getLang: true,
      })
      .then(data => {
        setFavicon(data.iconUrl, data.iconColor);
        const { permissionType, id, isLock, isPassword, projectId, sandboxStatus } = data;
        const list = this.getFilteredRouterConfigs(routerConfigs, projectId, permissionType, sandboxStatus);

        if (!permissionType || (isLock && isPassword) || _.isEmpty(list)) {
          navigateTo(`/app/${id}`); // 普通角色、加锁应用、无应用管理中特性时跳至应用首页

          return;
        }

        data.name = getTranslateInfo(id, null, id).name || data.name;
        this.setState(
          {
            data,
            loading: false,
          },
          () => {
            this.updateDeletePermission();
            this.getConfigList();
          },
        );

        return data;
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      });
  }; // 删除应用

  handleDelApp = () => {
    const { appId } = _.get(this.props, 'match.params');

    const {
      data: { projectId } = {
        projectId: '',
      },
    } = this.state;
    this.setState({
      delAppConfirmVisible: false,
    });
    homeAppApi
      .deleteApp({
        appId,
        projectId,
        isHomePage: true,
      })
      .then(() => {
        navigateTo('/dashboard');
      });
  };
  getConfigList = () => {
    const { data } = this.state;
    const { permissionType, isLock, isPassword, projectId, sourceType, id, sandboxStatus, license = {} } = data;
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

    const list = this.getFilteredRouterConfigs(routerConfigs, projectId, permissionType, sandboxStatus);
    const configList = list
      .filter(it => {
        if (it.type === 'lock') {
          if (canLock && data.isPassword) return true; // 管理员、开发者、运营者+开发者、拥有者对自己已解锁的应用有恢复锁定权限

          if (!(isOwner && isNormalApp && !isLock && !isPassword)) return false; // 仅普通应用的拥有者可锁定应用
        }

        return true;
      })
      .filter(it => {
        // 应用市场
        if (
          ['options', 'aggregations', 'relationship', 'export', 'recyclebin'].includes(it.type) &&
          sourceType === 60
        ) {
          if (['export'].includes(it.type)) {
            return data.exported;
          } // 模版应用

          if (license.goodsPushType === 1) {
            return true;
          } // 免费

          if (license.licenseType === 0) {
            return !isLock;
          } // 收费

          if (license.licenseType === 1) {
            return false;
          }
        }

        return true;
      });
    const type = _.get(this.props, 'match.params.navTab') || localStorage.getItem('appManageMenu');

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
      location.href = pathCompletion(`/app/${id}/settings/options`);
    }
  };
  updateDeletePermission = () => {
    const { data } = this.state;
    const { projectId } = data;

    this.setState({
      allowDelete: hasFeaturePermission(projectId, FEATURE_PERMISSION.DELETE_APP),
    });
  };

  render() {
    const {
      currentConfigType,
      data,
      loading,
      delAppConfirmVisible,
      configList = [],
      collapseAppManageNav,
      allowDelete,
    } = this.state;
    const {
      id: appId,
      name,
      permissionType,
      projectId,
      fixed,
      sandboxStatus: appSandboxStatus,
      sandboxRecordId,
    } = data;
    const isSandboxUpgradeRequired = !isSandboxSupportedProject(projectId);
    const featureId = (_.find(configList, it => it.type === currentConfigType) || {})['featureId'];
    const featureType = featureId && getFeatureStatus(projectId, featureId);
    const Component =
      LAZY_SETTING_COMPONENTS.get(currentConfigType) || LAZY_SETTING_COMPONENTS.get(routerConfigs[0].type);
    const componentProps = {
      ...this.props,
      data,
      projectId,
      appId,
      name,
      fixed,
      permissionType,
      appName: name,
      sandboxStatus: appSandboxStatus,
      sandboxRecordId,
      featureId: featureType && featureType === '2' ? featureId : undefined,
      onChangeData: obj =>
        this.setState(state => ({
          data: { ...state.data, ...obj },
        })),
    };
    return (
      <div className="manageAppWrap flexRow">
        <div
          className={cx('manageAppLeft', {
            collapseManageAppLeft: collapseAppManageNav,
          })}
        >
          <div className="flex">
            {configList
              .filter(v => (allowDelete ? true : v.type !== 'del'))
              .map(item => {
                const { type, icon, text } = item;
                return (
                  <Fragment>
                    {_.includes(['sandbox', 'language', 'recyclebin', 'appOfflineSubmit'], type) && (
                      <div className="line"></div>
                    )}
                    <div
                      key={type}
                      className={cx(`configItem ${type}`, {
                        active: type === currentConfigType,
                        collapseItem: collapseAppManageNav,
                      })}
                      onClick={() => {
                        // 删除应用
                        if (type === 'del') {
                          this.setState({
                            delAppConfirmVisible: true,
                          });
                          return;
                        }

                        safeLocalStorageSetItem('appManageMenu', type);
                        navigateTo(`/app/${appId}/settings/${type}`);
                        this.setState({
                          currentConfigType: type,
                        });
                      }}
                    >
                      {collapseAppManageNav ? (
                        <Tooltip
                          placement="right"
                          align={{
                            offset: [5, 0],
                          }}
                          title={text}
                        >
                          <Icon className="appConfigItemIcon Font18" icon={icon} />
                        </Tooltip>
                      ) : (
                        <Icon className="appConfigItemIcon Font18 mRight10" icon={icon} />
                      )}
                      {!collapseAppManageNav && (
                        <Fragment>
                          <span className="flex">{text}</span>
                          {((item.featureId &&
                            getFeatureStatus(projectId, item.featureId) === '2' &&
                            _.includes(
                              ['backup', 'recyclebin', 'variables', 'language', 'upgrade', 'aggregations', 'knowledge'],
                              type,
                            )) ||
                            (type === 'sandbox' && isSandboxUpgradeRequired)) && <UpgradeIcon />}
                        </Fragment>
                      )}
                    </div>
                  </Fragment>
                );
              })}
          </div>
          <div
            className={cx('collapseWrap TxtRight', {
              collapseHideWrap: collapseAppManageNav,
            })}
          >
            <Tooltip title={!collapseAppManageNav ? _l('收起') : _l('展开')}>
              <Icon
                icon={!collapseAppManageNav ? 'menu_left' : 'menu_right'}
                className="Font20 textTertiary pointer collapseWrapIcon"
                onClick={() => {
                  safeLocalStorageSetItem('collapseAppManageNav', !collapseAppManageNav);
                  this.setState({
                    collapseAppManageNav: !collapseAppManageNav,
                  });
                }}
              />
            </Tooltip>
          </div>
        </div>
        <div className={cx('manageAppRight flex flexColumn minHeight0', currentConfigType)}>
          <div
            className="flexColumn flex minHeight0"
            style={{
              minWidth: 800,
            }}
          >
            {loading ? (
              <LoadDiv />
            ) : (window.platformENV.isOverseas || window.platformENV.isLocal) &&
              !md.global.Config.EnableDataPipeline &&
              'aggregations' === currentConfigType ? (
              <div className="flexColumn alignItemsCenter justifyContentCenter h100">
                {upgradeVersionDialog({
                  hint: window.platformENV.isPlatform ? (
                    _l('数据集成服务未部署，暂不可用')
                  ) : (
                    <span>
                      {_l('数据集成服务未部署，请参考')}
                      <Support type={3} href="https://docs-pd.mingdao.com/faq/integrate/flink" text={_l('帮助')} />
                    </span>
                  ),
                  dialogType: 'content',
                })}
              </div>
            ) : featureType &&
              featureType === '2' &&
              !['variables', 'aggregations', 'knowledge'].includes(currentConfigType) ? (
              <UpgradeCom projectId={projectId} featureId={featureId} />
            ) : (
              <Suspense fallback={<LoadDiv className="mTop10" />}>
                <Component {...componentProps} />
              </Suspense>
            )}
          </div>
        </div>
        {delAppConfirmVisible && (
          <VerifyDel
            name={name}
            onOk={this.handleDelApp}
            onCancel={() =>
              this.setState({
                delAppConfirmVisible: false,
              })
            }
          />
        )}
      </div>
    );
  }
}

export default AppSettings;
