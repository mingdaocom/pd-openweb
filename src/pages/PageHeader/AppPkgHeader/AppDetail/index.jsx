import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import { Motion, spring } from 'react-motion';
import { generate } from '@ant-design/colors';
import { Drawer, Modal } from 'antd';
import api from 'api/homeApp';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import { func, oneOf } from 'prop-types';
import styled from 'styled-components';
import { Icon, Menu, MenuItem, Skeleton, SvgIcon, UpgradeIcon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import appManagementApi from 'src/api/appManagement';
import DragMask from 'worksheet/common/DragMask';
import { refreshSheetList } from 'worksheet/redux/actions/sheetList';
import ProductLicenseInfo from 'src/components/productLicenseInfo';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import AppAnalytics from 'src/pages/Admin/app/useAnalytics/components/AppAnalytics';
import CopyApp from 'src/pages/AppHomepage/components/CopyApp';
import SelectIcon from 'src/pages/AppHomepage/components/SelectIcon';
import { unlockAppLockPassword } from 'src/pages/AppSettings/components/LockApp/AppLockPasswordDialog';
import { pcNavList } from 'src/pages/PageHeader/AppPkgHeader/AppDetail/AppNavStyle';
import GlobalSearch from 'src/pages/PageHeader/components/GlobalSearch';
import PortalUserSet from 'src/pages/PageHeader/components/PortalUserSet';
import {
  changeAppColor,
  changeNavColor,
  clearAppDetail,
  setAppStatus,
  syncAppDetail,
} from 'src/pages/PageHeader/redux/action';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum';
import { canEditApp, canEditData, isHaveCharge } from 'src/pages/worksheet/redux/actions/util.js';
import { navigateTo } from 'src/router/navigateTo';
import { getAppFeaturesVisible, getTranslateInfo, setFavicon } from 'src/utils/app';
import { emitter } from 'src/utils/common';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import { getSheetListFirstId } from 'src/utils/worksheet';
import CommonUserHandle, { LeftCommonUserHandle } from '../../components/CommonUserHandle';
import HomepageIcon from '../../components/HomepageIcon';
import IndexSide from '../../components/IndexSide';
import MyProcessEntry from '../../components/MyProcessEntry';
import { compareProps, getAppConfig, getIds } from '../../util';
import AppGroup from '../AppGroup';
import { DROPDOWN_APP_CONFIG } from '../config';
import LeftAppGroup from '../LeftAppGroup';
import EditAppIntro from './EditIntro';
import NavigationConfig from './NavigationConfig';
import RoleSelect from './RoleSelect';
import './index.less';

const APP_STATUS_TEXT = {
  11: _l('还原中'),
  12: _l('迁移中'),
};

const Drag = styled.div(
  ({ left }) => `
  position: absolute;
  z-index: 2;
  left: ${left}px;
  width: 2px;
  height: 100%;
  cursor: ew-resize;
  &:hover {
    border-left: 1px solid #ddd;
  }
`,
);

const mapStateToProps = ({ sheet, sheetList, appPkg: { appStatus } }) => ({ sheet, sheetList, appStatus });
const mapDispatchToProps = dispatch => ({
  syncAppDetail: detail => dispatch(syncAppDetail(detail)),
  updateColor: color => dispatch(changeAppColor(color)),
  updateNavColor: color => dispatch(changeNavColor(color)),
  setAppStatus: data => dispatch(setAppStatus(data)),
  refreshSheetList: () => dispatch(refreshSheetList()),
  clearAppDetail: () => dispatch(clearAppDetail()),
});
const rowInfoReg = /\/app\/(.*)\/(.*)(\/(.*))?\/row\/(.*)|\/app\/(.*)\/newrecord\/(.*)\/(.*)/;
const workflowDetailReg = /\/app\/(.*)\/workflowdetail\/record\/(.*)\/(.*)/;
const checkRecordInfo = url => rowInfoReg.test(url) || workflowDetailReg.test(url);
const appCacheList = ['icon', 'iconUrl', 'iconColor', 'navColor', 'name', 'pcNaviStyle', 'currentPcNaviStyle'];

let mousePosition = { x: 139, y: 23 };
@connect(mapStateToProps, mapDispatchToProps)
export default class AppInfo extends Component {
  static propTypes = {
    appStatus: oneOf([0, 1, 2, 3, 4, 5]),
    updateColor: func,
    updateNavColor: func,
    syncAppDetail: func,
  };
  static defaultProps = {
    appStatus: 0,
    updateColor: _.noop,
    updateNavColor: _.noop,
    syncAppDetail: _.noop,
  };

  constructor(props) {
    super(props);
    const { appId } = getIds(props);
    const openedApps = safeParse(localStorage.getItem('openedApps'), 'array');
    const isRowInfo = checkRecordInfo(props.location.pathname);
    const appCacheData = localStorage.getItem(`appCache-${appId}`);
    this.state = {
      indexSideVisible: false,
      appConfigVisible: false,
      modifyAppIconAndNameVisible: false,
      editAppIntroVisible: false,
      isEditing: false,
      isShowAppIntroFirst: !_.includes(openedApps, appId) && !isRowInfo,
      navigationConfigVisible: false,
      copyAppVisible: false,
      data: appCacheData ? window.safeParse(appCacheData) : {},
      hasChange: false,
      noUseBackupRestore: false,
      appAnalyticsVisible: false,
      modifyAppLockPasswordVisible: false,
      lockAppVisisble: false,
      roleDebugVisible: false,
      navWidth: Number(localStorage.getItem(`appNavWidth-${appId}`)) || 240,
      dragMaskVisible: false,
    };
    appCacheData &&
      this.props.syncAppDetail({
        ..._.pick(this.state.data, ['currentPcNaviStyle', 'iconColor']),
      });
    this.checkNavigationStyle(_.get(this.state.data, 'currentPcNaviStyle'));
  }

  componentDidMount() {
    this.ids = getIds(this.props);
    this.getData();
    window.updateAppGroups = this.getData;
    const openedApps = safeParse(localStorage.getItem('openedApps'), 'array');
    const { appId } = this.ids;
    if (!_.includes(openedApps, appId)) {
      safeLocalStorageSetItem('openedApps', JSON.stringify(openedApps.concat(appId)));
    }
  }

  componentWillReceiveProps(nextProps) {
    this.ids = getIds(nextProps);
    const { data } = this.state;
    if (compareProps(nextProps.match.params, this.props.match.params, ['appId'])) {
      this.getData(nextProps);
    }
    if (data.id === getIds(this.props).appId) {
      const isRowInfo = checkRecordInfo(nextProps.location.pathname);
      const currentPcNaviStyle = isRowInfo ? 0 : data.pcNaviStyle;
      const appStatus = isRowInfo ? 0 : nextProps.appStatus;
      this.setState({
        data: {
          ...data,
          currentPcNaviStyle,
        },
      });
      this.props.syncAppDetail({ currentPcNaviStyle });
      this.props.setAppStatus(appStatus);
      this.checkNavigationStyle(currentPcNaviStyle);
    }
    if (
      this.ids.appId === getIds(this.props).appId &&
      compareProps(nextProps.match.params, this.props.match.params, ['worksheetId'])
    ) {
      const { currentPcNaviStyle } = this.state.data;
      currentPcNaviStyle === 2 && this.checkIsFull(nextProps.match.params.worksheetId);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.clickTimer);
    $('[rel="icon"]').attr('href', '/file/mdpic/ProjectLogo/favicon.png?t=' + Date.now());
    document.querySelector('body').classList.remove('leftNavigationStyleWrap');
    this.props.clearAppDetail();
    delete window.updateAppGroups;
  }

  checkIsFull = worksheetId => {
    if (worksheetId) {
      document.querySelector('#wrapper').classList.add('fullWrapper');
    } else {
      document.querySelector('#wrapper').classList.remove('fullWrapper');
    }
  };

  checkNavigationStyle = currentPcNaviStyle => {
    if ([1, 3].includes(currentPcNaviStyle)) {
      document.querySelector('body').classList.add('leftNavigationStyleWrap');
    } else {
      document.querySelector('body').classList.remove('leftNavigationStyleWrap');
    }
  };

  getThemeType = (iconColor = '#616161', navColor) => {
    const lightColor = generate(iconColor)[0];
    if ([lightColor, '#ffffff', '#f5f6f7'].includes(navColor)) {
      return 'light';
    }
    if ('#1b2025' === navColor) {
      return 'black';
    }
    return 'theme';
  };

  getData = async (props = this.props) => {
    const { syncAppDetail } = props;
    let { appId, worksheetId } = this.ids;

    if (!appId || appId === 'id') return;

    appId = md.global.Account.isPortal ? md.global.Account.appId : appId;
    const data = await api.getApp(
      {
        appId,
        getSection: true,
        getManager: window.isPublicApp ? false : true,
        getLang: true,
      },
      { silent: true },
    );
    emitter.emit('UPDATE_GLOBAL_STORE', 'appInfo', data);

    const { langInfo } = data;
    if (langInfo && langInfo.appLangId && langInfo.version !== window[`langVersion-${appId}`]) {
      const lang = await appManagementApi.getAppLangDetail({
        projectId: data.projectId,
        appId,
        appLangId: langInfo.appLangId,
      });
      window[`langData-${appId}`] = lang.items;
      window[`langVersion-${appId}`] = langInfo.version;
    }
    if (_.isEmpty(langInfo)) {
      window[`langData-${appId}`] = undefined;
      window[`langVersion-${appId}`] = undefined;
    }

    data.currentPcNaviStyle =
      checkRecordInfo(location.pathname) || !_.find(pcNavList, { value: data.pcNaviStyle }) ? 0 : data.pcNaviStyle;
    data.themeType = this.getThemeType(data.iconColor, data.navColor);
    data.needUpdate = Date.now();
    data.workflowAgentFeatureType = getFeatureStatus(data.projectId, VersionProductType.workflowAgent);
    this.props.setAppStatus(data.appStatus);

    this.setState({ data });
    // 同步应用信息至工作表
    const appDetail = _.pick(data, [
      'navColor',
      'iconColor',
      'lightColor',
      'iconUrl',
      'projectId',
      'name',
      'id',
      'fixed',
      'fixRemark',
      'fixAccount',
      'isLock',
      'permissionType',
      'appDisplay',
      'webMobileDisplay',
      'pcDisplay',
      'pcNaviStyle',
      'currentPcNaviStyle',
      'themeType',
      'viewHideNavi',
      'managers',
      'selectAppItmeType',
      'debugRole',
      'displayIcon',
      'goodsId',
      'license',
      'workflowAgentFeatureType',
    ]);
    window[`timeZone_${appId}`] = data.timeZone; //记录应用时区
    syncAppDetail(appDetail);
    this.checkNavigationStyle(data.currentPcNaviStyle);
    if (data.currentPcNaviStyle === 2) {
      this.checkIsFull(worksheetId);
    } else {
      document.querySelector('#wrapper').classList.remove('fullWrapper');
    }
    window.appInfo = data;
    this.dataCache = _.pick(data, appCacheList);
    safeLocalStorageSetItem(`appCache-${data.id}`, JSON.stringify(this.dataCache));
    setFavicon(data.iconUrl, data.iconColor);
  };

  switchVisible = (obj, cb) => {
    this.setState(obj, cb);
  };

  updateData = obj => {
    const { data } = this.state;
    const nextData = { ...data, ...obj };
    this.setState({ data: nextData });
  };

  handleAppConfigClick = type => {
    this.setState({ appConfigVisible: false, [type]: true });
  };

  handleAppIconAndNameChange = obj => {
    const isSame = this.dataCache && Object.keys(obj).every(key => obj[key] === this.dataCache[key]);
    if (!isSame) {
      this.updateAppDetail(obj);
    }
  };

  updateAppDetail = obj => {
    const { appId, groupId } = this.ids;
    const current = _.pick(this.state.data, [
      'projectId',
      'iconColor',
      'navColor',
      'icon',
      'description',
      'name',
      'shortDesc',
    ]);
    if (!obj.name) obj = _.omit(obj, 'name');
    const para = { ...current, ...obj };
    api.editAppInfo({ appId, ...para }).then(({ data }) => {
      this.dataCache = _.pick(para, appCacheList);
      safeLocalStorageSetItem(`appCache-${appId}`, JSON.stringify(this.dataCache));
      if (data) this.updateData(obj);
      if ('pcNaviStyle' in obj && obj.pcNaviStyle !== this.state.data.currentPcNaviStyle) {
        if (obj.pcNaviStyle === 2) {
          location.href = `/app/${appId}/${groupId || ''}`;
        } else {
          window.location.reload();
        }
      }
    });
  };
  // 编辑应用详情
  handleEditApp = (type, obj) => {
    this.switchVisible({ [type]: false, isShowAppIntroFirst: false });
    this.updateAppDetail(obj);
  };

  handleModify = obj => {
    if (obj.name === '') {
      obj = { ...obj, name: this.dataCache.name };
    }
    if (obj.iconColor) {
      this.props.updateColor(obj.iconColor);
    }
    if (obj.navColor) {
      this.props.updateNavColor(obj.navColor);
      obj.themeType = this.getThemeType(obj.iconColor, obj.navColor);
    }
    this.props.syncAppDetail(obj);
    this.updateData(obj);
  };

  handleAppNameClick = e => {
    e.stopPropagation();
    const { currentPcNaviStyle } = this.state.data;
    const { location, sheet, sheetList } = this.props;
    const { appId } = getIds(this.props);
    if (/row|role|workflow|newrecord/.test(location.pathname)) {
      navigateTo(`/app/${appId}`);
      return;
    }
    const { base, views, isCharge } = sheet;
    const { data, appSectionDetail } = sheetList;
    const { worksheetId, viewId, groupId = '' } = base;
    const firstSheetId =
      currentPcNaviStyle === 2
        ? ''
        : getSheetListFirstId([1, 3].includes(currentPcNaviStyle) ? appSectionDetail : data, isCharge) || '';

    if (appId && worksheetId !== firstSheetId) {
      navigateTo(`/app/${appId}/${groupId}/${firstSheetId}`);
      return;
    }
    const { viewId: firstViewId } = _.head(views) || {};
    if (appId && worksheetId === firstSheetId && viewId !== firstViewId) {
      navigateTo(`/app/${appId}/${groupId}/${firstSheetId}/${firstViewId}`);
    }
  };

  renderMenu = ({ type, icon, text, action, ...rest }) => {
    const { data } = this.state;
    const { projectId, isPassword, permissionType, license } = data;
    const canLock = _.includes(
      [
        APP_ROLE_TYPE.ADMIN_ROLE,
        APP_ROLE_TYPE.DEVELOPERS_ROLE,
        APP_ROLE_TYPE.RUNNER_DEVELOPERS_ROLE,
        APP_ROLE_TYPE.POSSESS_ROLE,
      ],
      permissionType,
    );

    if (type === 'unlockApp' && !(canLock && isPassword)) return;

    if (rest.featureId) {
      const featureType = getFeatureStatus(projectId, rest.featureId);
      if (!featureType) return;
    }

    if (_.includes(['appAnalytics', 'copy', 'worksheetapi', 'modifyAppLockPassword'], type)) {
      return (
        <React.Fragment>
          <div style={{ width: '100%', margin: '3px 0', borderTop: '1px solid #EAEAEA' }} />
          {this.renderMenuHtml({ type, icon, text, action, ...rest })}
        </React.Fragment>
      );
    }

    if ('appLicense' === type && license) {
      return (
        <ProductLicenseInfo license={license} data={_.pick(data, ['endTime', 'projectId', 'goodsId', 'id'])}>
          {this.renderMenuHtml({ type, icon, text, action, ...rest })}
        </ProductLicenseInfo>
      );
    }

    return this.renderMenuHtml({ type, icon, text, action, ...rest });
  };

  renderMenuHtml = ({ type, icon, text, action, ...rest }) => {
    const { appId } = this.ids;
    const { projectId, sourceType, permissionType, isPassword, isLock, license = {} } = this.state.data;
    const featureType = getFeatureStatus(projectId, rest.featureId);
    const isOwner = permissionType === APP_ROLE_TYPE.POSSESS_ROLE;

    return (
      <MenuItem
        key={type}
        data-event={type}
        className={cx('appConfigItem', type)}
        icon={<Icon className="appConfigItemIcon Font18" icon={icon} />}
        onClick={e => {
          e.stopPropagation();
          this.setState({ appConfigVisible: false });

          if (type === 'editIntro') {
            this.setState({ editAppIntroVisible: true, isEditing: true });
            return;
          }
          if (_.includes(['appAnalytics', 'appLogs'], type) && getFeatureStatus(projectId, rest.featureId) === '2') {
            buriedUpgradeVersionDialog(projectId, rest.featureId);
            return;
          }
          if (type === 'copyId') {
            copy(appId);
            alert(_l('复制成功'), 1);
            return;
          }
          if (type === 'appAnalytics') {
            window.open(`/app/${appId}/analytics/${projectId}`, '__blank');
            return;
          }
          if (type === 'appLogs') {
            window.open(`/app/${appId}/logs/${projectId}`, '__blank');
            return;
          }
          if (type === 'modifyAppLockPassword') {
            unlockAppLockPassword({
              appId,
              sourceType,
              isPassword,
              isOwner,
              isLock,
              refreshPage: () => {
                location.reload();
              },
            });
            return;
          }
          // API开发文档
          if (type === 'worksheetapi') {
            window.open(`/worksheetapi/${appId}`);
            return;
          }
          if (type === 'appManageMenu') {
            const appManageMenuType = localStorage.getItem('appManageMenu');
            const isMarketAstrict = sourceType === 60 ? (license.licenseType ? true : isLock) : false;
            navigateTo(
              `/app/${appId}/settings/${
                isMarketAstrict ? 'variables' : appManageMenuType ? appManageMenuType : 'options'
              }`,
            );
            return;
          }

          this.handleAppConfigClick(action);
        }}
        {...rest}
      >
        <span>{text}</span>
        {_.includes(['appAnalytics', 'appLogs'], type) && featureType === '2' && <UpgradeIcon />}
        {type === 'worksheetapi' && <Icon icon="launch" className="mLeft10 worksheetapiIcon" />}
        {type === 'appLicense' && (
          <Icon icon="arrow-right-tip" className="mLeft10" style={{ right: 10, left: 'auto' }} />
        )}
      </MenuItem>
    );
  };

  changeIndexVisible = (visible = true) => {
    this.timer = setTimeout(() => {
      if (window.disabledSideButton) return;
      this.setState({ indexSideVisible: visible });
    }, 100);
  };

  closeNavigationConfigVisible = () => {
    this.switchVisible({ navigationConfigVisible: false });
    window.updateAppGroups && window.updateAppGroups();
    this.props.refreshSheetList();
  };

  openGlobalSearch = () => {
    this.setState({ globalSearchVisible: true });
    GlobalSearch({
      match: this.props.match,
      onClose: () => this.setState({ globalSearchVisible: false }),
    });
  };

  renderAppInfoWrap = showName => {
    const { appStatus } = this.props;
    const { appConfigVisible, modifyAppIconAndNameVisible, data } = this.state;
    const {
      iconUrl,
      iconColor,
      description,
      permissionType,
      isLock,
      isPassword,
      projectId,
      fixed,
      pcDisplay,
      currentPcNaviStyle,
      themeType,
      sourceType,
      ssoAddress,
    } = data;
    const isUpgrade = _.includes([10, 11], appStatus);
    const isNormalApp = _.includes([1, 5], appStatus);
    const { s, ss, tb, td } = getAppFeaturesVisible();
    let list = getAppConfig(DROPDOWN_APP_CONFIG, permissionType) || [];
    const isAuthorityApp = canEditApp(permissionType, isLock);
    const canLock = _.includes(
      [
        APP_ROLE_TYPE.ADMIN_ROLE,
        APP_ROLE_TYPE.DEVELOPERS_ROLE,
        APP_ROLE_TYPE.RUNNER_DEVELOPERS_ROLE,
        APP_ROLE_TYPE.POSSESS_ROLE,
      ],
      permissionType,
    );

    if ((_.find(md.global.Account.projects, o => o.projectId === projectId) || {}).cannotCreateApp) {
      _.remove(list, o => o.type === 'copy');
    }
    // 加锁应用不限制 修改应用名称和外观、应用说明、使用说明、日志（8.2）
    if (isLock && isPassword && canLock) {
      list = _.filter(list, it =>
        _.includes(['modify', 'editIntro', 'appAnalytics', 'appLogs', 'modifyAppLockPassword'], it.type),
      );
    } else {
      list = _.filter(list, it => !_.includes(['modifyAppLockPassword'], it.type));
    }
    // 应用市场
    if (sourceType === 60) {
      _.remove(list, o => o.type === 'copy');
    } else {
      _.remove(list, o => o.type === 'appLicense');
    }
    // 应用市场，应用已过期
    if (appStatus === 20) {
      _.remove(list, o => ['modify', 'editNavigation', 'editIntro', 'appManageMenu'].includes(o.type));
    }

    const renderHomepageIconWrap = () => {
      if (window.backHomepageWay === 1) {
        return (
          <div
            className="homepageIconWrap"
            onClick={() => {
              if (md.global.Account.isSSO && ssoAddress) {
                location.href = ssoAddress;
                return;
              }
              navigateTo('/dashboard');
            }}
          >
            <div className="homepageIcon alignItemsCenter justifyContentCenter" style={{ flexWrap: 'nowrap' }}>
              <Icon className="Font20" icon="home_page" />
            </div>
          </div>
        );
      } else {
        return (
          <div
            className="homepageIconWrap"
            onClick={() => {
              window.disabledSideButton = false;
              this.changeIndexVisible();
            }}
            onMouseEnter={this.changeIndexVisible}
            onMouseLeave={() => {
              window.disabledSideButton = false;
              clearTimeout(this.timer);
            }}
          >
            <HomepageIcon />
          </div>
        );
      }
    };

    const renderAppDetailWrap = () => {
      const isMigrate = appStatus === 12;
      const isLeftAppStyle = [1, 3].includes(currentPcNaviStyle);
      return (
        <Fragment>
          {tb && (
            <div
              className={cx('appDetailWrap pointer overflowHidden')}
              onDoubleClick={e => {
                e.stopPropagation();
                this.setState({ editAppIntroVisible: true, isEditing: false });
              }}
            >
              <div
                className={cx('appIconAndName pointer', {
                  overflow_ellipsis: !isLeftAppStyle,
                  flexStart: isLeftAppStyle,
                })}
                onClick={this.handleAppNameClick}
              >
                <div className="appIconWrap">
                  <SvgIcon
                    url={iconUrl}
                    fill={['black', 'light'].includes(themeType) ? iconColor : '#FFF'}
                    size={isLeftAppStyle ? 28 : 24}
                  />
                </div>
                <span
                  className={cx('appName', { overflow_ellipsis: !isLeftAppStyle, leftAppStyleAppName: isLeftAppStyle })}
                >
                  {showName}
                </span>
              </div>
            </div>
          )}
          {!(pcDisplay && !isAuthorityApp) && (fixed || isUpgrade || isMigrate) && (
            <div className={cx({ appFixed: fixed || isMigrate, appUpgrade: isUpgrade })}>
              {isUpgrade || isMigrate ? APP_STATUS_TEXT[appStatus] || _l('升级中') : _l('维护中')}
            </div>
          )}

          {((isNormalApp && (canEditApp(permissionType, isLock) || canEditData(permissionType)) && tb) ||
            (isLock && canLock)) &&
            !isUpgrade && (
              <div
                className="appConfigIcon pointer"
                onClick={() => {
                  this.setState({ appConfigVisible: true });
                }}
              >
                <Icon icon="expand_more" className="Font18" style={{ lineHeight: 'inherit' }} />
                {appConfigVisible && (
                  <Menu
                    className="appOperate"
                    style={{ top: '45px', width: '220px', padding: '6px 0' }}
                    onClickAway={() => this.setState({ appConfigVisible: false })}
                    onClickAwayExceptions={['.appLicenseWrap', '.mui-dialog-container']}
                  >
                    {list.map(({ type, icon, text, action, ...rest }) => {
                      return this.renderMenu({ type, icon, text, action, ...rest });
                    })}
                  </Menu>
                )}
              </div>
            )}
          {(!isHaveCharge(permissionType) ? description : false) && (isNormalApp || isMigrate) && (
            <Tooltip title={_l('应用说明')}>
              <div
                className="appIntroWrap pointer"
                onClick={e => {
                  mousePosition = { x: e.pageX, y: e.pageY };
                  this.setState({ editAppIntroVisible: true, isEditing: false });
                }}
              >
                <Icon className="appIntroIcon Font16" icon="info" />
              </div>
            </Tooltip>
          )}
          {modifyAppIconAndNameVisible && (
            <SelectIcon
              projectId={projectId}
              {..._.pick(data, ['icon', 'iconColor', 'name', 'navColor'])}
              className="modifyAppInfo"
              onNameInput={this.handleNameInput}
              onModify={this.handleModify}
              onChange={this.handleAppIconAndNameChange}
              onClose={() => this.switchVisible({ selectIconVisible: false })}
              onClickAway={() => this.switchVisible({ modifyAppIconAndNameVisible: false })}
              onClickAwayExceptions={['.mui-dialog-container']}
              onShowNavigationConfig={
                canEditApp(permissionType, isLock)
                  ? () => {
                      this.setState({ navigationConfigVisible: true });
                    }
                  : null
              }
            />
          )}
        </Fragment>
      );
    };

    if ([1, 3].includes(currentPcNaviStyle)) {
      const renderContent = ({ count, waitingExamine }, onClick) => {
        return (
          <div className="flexRow alignItemsCenter pointer White backlogWrap" onClick={onClick}>
            <Icon icon="task_alt" className="Font18" />
            <div className="mLeft5 mRight5 bold">{_l('待办')}</div>
            {!!count && <div className="count">{count}</div>}
            {!!waitingExamine && !count && <div className="weakCount"></div>}
          </div>
        );
      };
      return (
        <div className="appInfoWrap flexColumn pLeft10 pRight10 mBottom8">
          <div className="flexRow alignItemsCenter pTop10">
            <div className="flex">
              {!(window.isPublicApp || !s || md.global.Account.isPortal) && renderHomepageIconWrap()}
            </div>
            {!window.isPublicApp && ss && !md.global.Account.isPortal && (
              <Tooltip title={_l('超级搜索')} shortcut="F">
                <div className="flexRow alignItemsCenter pointer White backlogWrap" onClick={this.openGlobalSearch}>
                  <Icon icon="search" className="Font18" />
                </div>
              </Tooltip>
            )}
            {!(md.global.Account.isPortal || window.isPublicApp) && td && (
              <MyProcessEntry type="appPkg" renderContent={renderContent} />
            )}
          </div>
          <div className="flexRow pTop10 Relative">{renderAppDetailWrap()}</div>
        </div>
      );
    } else {
      return (
        <div className="appInfoWrap flexRow alignItemsCenter">
          {window.isPublicApp || !s || md.global.Account.isPortal ? (
            <div className="mLeft16" />
          ) : (
            renderHomepageIconWrap()
          )}
          {renderAppDetailWrap()}
        </div>
      );
    }
  };

  render() {
    const { appStatus, ...props } = this.props;
    const {
      indexSideVisible,
      editAppIntroVisible,
      isEditing,
      navigationConfigVisible,
      isShowAppIntroFirst,
      copyAppVisible,
      data,
      appAnalyticsVisible,
      roleDebugVisible,
      navWidth,
      dragMaskVisible,
    } = this.state;
    const {
      id: appId,
      iconColor = '#616161',
      navColor = '#616161',
      iconUrl,
      description,
      permissionType,
      isLock,
      projectId,
      fixed,
      pcDisplay,
      currentPcNaviStyle,
      themeType,
      debugRole,
    } = data;
    const isUpgrade = appStatus === 10;
    const isNormalApp = _.includes([1, 5], appStatus);
    const isAuthorityApp = canEditApp(permissionType, isLock);
    const hasCharge = canEditApp(permissionType) || canEditData(permissionType);
    const AppGroupComponent = [1, 3].includes(currentPcNaviStyle) ? LeftAppGroup : AppGroup;
    const showName = getTranslateInfo(appId, null, appId).name || data.name;
    const canDebug = (debugRole || {}).canDebug || false;
    // 获取url参数
    const { s, tb, tr, ln } = getAppFeaturesVisible();
    // 当导航方式为经典或卡片时URL的隐藏参数全写上后，顶部色块应该隐藏
    if (_.includes([0, 2], currentPcNaviStyle) && !s && !tb && !tr) return null;

    // loading 不展示导航
    if (_.isEmpty(data)) {
      return null;
    }

    return (
      <Fragment>
        {[1, 3].includes(currentPcNaviStyle) && (
          <Fragment>
            {dragMaskVisible && (
              <DragMask
                value={navWidth}
                min={240}
                max={480}
                onChange={value => {
                  localStorage.setItem(`appNavWidth-${appId}`, value);
                  this.setState({
                    navWidth: value,
                    dragMaskVisible: false,
                  });
                }}
              />
            )}
            <Drag
              left={navWidth}
              className="appNavWidthDrag"
              onMouseDown={() => {
                this.setState({ dragMaskVisible: true });
              }}
            />
          </Fragment>
        )}
        <div
          className={cx('appPkgHeaderWrap', { hide: [1, 3].includes(currentPcNaviStyle) && !ln }, themeType)}
          style={{
            backgroundColor: navColor,
            width: [1, 3].includes(currentPcNaviStyle) ? navWidth : undefined,
          }}
        >
          <DocumentTitle title={showName} />
          {this.renderAppInfoWrap(showName)}
          {[1, 3].includes(currentPcNaviStyle) && (((pcDisplay || fixed) && !isAuthorityApp) || isUpgrade) && (
            <div className="LeftAppGroupWrap w100 h100">
              <Skeleton active={false} />
            </div>
          )}
          {((!(fixed && !hasCharge) && !(pcDisplay && !hasCharge)) || canDebug) && (
            <AppGroupComponent
              appStatus={appStatus}
              projectId={projectId}
              appPkg={data}
              roleSelectValue={(debugRole || {}).selectedRoles || []}
              roleDebugVisible={roleDebugVisible}
              {...props}
              {..._.pick(data, ['permissionType', 'isLock'])}
              showRoleDebug={() => {
                this.setState({ roleDebugVisible: !roleDebugVisible });
              }}
              otherAllShow={
                checkRecordInfo(location.pathname) ? false : !(fixed && !hasCharge) && !(pcDisplay && !hasCharge)
              }
            />
          )}
          {[1, 3].includes(currentPcNaviStyle) && (
            <Fragment>
              <div className="topRadius" style={{ color: navColor }} />
              <div className="bottomRadius" style={{ color: navColor }} />
              {themeType === 'light' && (
                <Fragment>
                  <svg className="topBorderRadius" width="14px" height="22px" viewBox="0 0 14 22" version="1.1">
                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                      <path
                        d="M0.5,22 L0.5,13.9851088 C0.503434088,13.8199063 0.5,13.6531791 0.5,13.4856816 C0.5,6.59003004 6.32029825,1 13.5,1"
                        stroke="#0000001a"
                      ></path>
                    </g>
                  </svg>
                  <div className="borderLine" />
                  <svg className="bottomBorderRadius" width="14px" height="22px" viewBox="0 0 14 22" version="1.1">
                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                      <path
                        d="M0.5,21 L0.5,12.9851088 C0.503434088,12.8199063 0.5,12.6531791 0.5,12.4856816 C0.5,5.59003004 6.32029825,0 13.5,0"
                        stroke="#0000001a"
                        transform="translate(7.000000, 10.500000) scale(1, -1) translate(-7.000000, -10.500000) "
                      ></path>
                    </g>
                  </svg>
                </Fragment>
              )}
            </Fragment>
          )}
          {/* 当应用状态正常且应用描述有值且第一次进入此应用会弹出编辑框 */}
          <Modal
            zIndex={1000}
            className="appIntroDialog"
            wrapClassName={cx('appIntroDialogWrapCenter', { preview: !isEditing })}
            visible={editAppIntroVisible || (!window.isPublicApp && isShowAppIntroFirst && description && isNormalApp)}
            onCancel={() => this.switchVisible({ editAppIntroVisible: false, isShowAppIntroFirst: false })}
            animation="zoom"
            width={800}
            footer={null}
            centered={true}
            maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            bodyStyle={{ padding: 0 }}
            maskAnimation="fade"
            mousePosition={mousePosition}
            closeIcon={<Icon icon="close" />}
          >
            <EditAppIntro
              cacheKey="appIntroDescription"
              data={data}
              description={isEditing ? description : getTranslateInfo(appId, null, appId).description || description}
              remark={data.shortDesc}
              permissionType={permissionType}
              isLock={isLock}
              // isEditing={!description && isAuthorityApp}
              isEditing={isEditing}
              changeEditState={isEditing => {
                this.setState({ isEditing });
              }}
              changeSetting={() => {
                this.setState({
                  hasChange: true,
                });
              }}
              onSave={data => {
                const value = data.description;
                const shortDesc = data.remark;
                this.handleEditApp('', {
                  description: !value ? (this.state.hasChange ? value : description) : value,
                  shortDesc,
                });
                this.setState({
                  hasChange: false,
                });
                this.switchVisible({ isShowAppIntroFirst: false, hasChange: false });
              }}
              onCancel={() =>
                this.switchVisible({ editAppIntroVisible: false, isShowAppIntroFirst: false, hasChange: false })
              }
            />
          </Modal>
          {copyAppVisible && (
            <CopyApp title={showName} para={{ appId }} onCancel={() => this.switchVisible({ copyAppVisible: false })} />
          )}

          <Drawer
            bodyStyle={{ display: 'flex', flexDirection: 'column', padding: '0' }}
            width={900}
            title={null}
            visible={navigationConfigVisible}
            destroyOnClose={true}
            closeIcon={null}
            onClose={this.closeNavigationConfigVisible}
            placement="right"
          >
            <NavigationConfig
              app={data}
              onChangeApp={value => {
                const result = { ...data, ...value };
                this.setState({
                  data: result,
                });
                this.updateAppDetail(value);
                this.props.syncAppDetail(result);
              }}
              visible={navigationConfigVisible}
              onClose={this.closeNavigationConfigVisible}
            />
          </Drawer>
          <Motion style={{ x: spring(indexSideVisible ? 0 : -352) }}>
            {({ x }) => (
              <IndexSide
                posX={x}
                visible={indexSideVisible}
                onClose={() => this.setState({ indexSideVisible: false })}
                onClickAway={() => indexSideVisible && this.setState({ indexSideVisible: false })}
              />
            )}
          </Motion>
          <Fragment>
            {md.global.Account.isPortal ? (
              <PortalUserSet
                appId={md.global.Account.appId}
                projectId={projectId}
                originalLang={data.originalLang}
                worksheetId={this.props.match.params.worksheetId}
                name={showName}
                iconColor={data.iconColor}
                currentPcNaviStyle={currentPcNaviStyle}
              />
            ) : [1, 3].includes(currentPcNaviStyle) ? (
              data.id && <LeftCommonUserHandle type="appPkg" isAuthorityApp={isAuthorityApp} data={data} {...props} />
            ) : (
              <CommonUserHandle type="appPkg" {...props} />
            )}
          </Fragment>
          {appAnalyticsVisible && (
            <AppAnalytics
              currentAppInfo={{ appId, name: showName, iconColor, iconUrl }}
              projectId={projectId}
              onCancel={() => {
                this.setState({ appAnalyticsVisible: false });
              }}
            />
          )}
          <Drawer
            title={null}
            visible={roleDebugVisible}
            destroyOnClose={true}
            closeIcon={null}
            onClose={() => this.setState({ roleDebugVisible: false })}
            placement="right"
          >
            <RoleSelect
              {..._.pick(data, ['permissionType', 'id'])}
              visible={roleDebugVisible}
              roleSelectValue={_.get(debugRole, 'selectedRoles') || []}
              appId={appId}
              handleClose={() => this.setState({ roleDebugVisible: false })}
              onClickAway={e => {
                if (!roleDebugVisible) return;
                const parent = document.querySelector('.roleSelectCon');
                if (parent && parent.contains(e)) return;
                this.setState({ roleDebugVisible: false });
              }}
            />
          </Drawer>
        </div>
      </Fragment>
    );
  }
}
