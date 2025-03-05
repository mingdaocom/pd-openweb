import React, { Component, Fragment } from 'react';
import { func, oneOf } from 'prop-types';
import { Motion, spring } from 'react-motion';
import { generate } from '@ant-design/colors';
import cx from 'classnames';
import DocumentTitle from 'react-document-title';
import { Icon, Menu, MenuItem, Skeleton, UpgradeIcon, SvgIcon, Tooltip, LoadDiv, Dialog, Input } from 'ming-ui';
import { connect } from 'react-redux';
import { navigateTo } from 'src/router/navigateTo';
import SelectIcon from 'src/pages/AppHomepage/components/SelectIcon';
import CopyApp from 'src/pages/AppHomepage/components/CopyApp';
import { changeAppColor, changeNavColor, setAppStatus, syncAppDetail } from 'src/pages/PageHeader/redux/action';
import { refreshSheetList } from 'worksheet/redux/actions/sheetList';
import api from 'api/homeApp';
import { Drawer, Modal } from 'antd';
import HomepageIcon from '../../components/HomepageIcon';
import IndexSide from '../../components/IndexSide';
import CommonUserHandle, { LeftCommonUserHandle } from '../../components/CommonUserHandle';
import PortalUserSet from 'src/pages/PageHeader/components/PortalUserSet';
import MyProcessEntry from '../../components/MyProcessEntry';
import { DROPDOWN_APP_CONFIG } from '../config';
import { getIds, compareProps, getAppConfig } from '../../util';
import EditAppIntro from './EditIntro';
import AppGroup from '../AppGroup';
import LeftAppGroup from '../LeftAppGroup';
import NavigationConfig from './NavigationConfig';
import './index.less';
import { getAppFeaturesVisible, getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { getSheetListFirstId } from 'worksheet/util';
import AppAnalytics from 'src/pages/Admin/app/useAnalytics/components/AppAnalytics';
import { unlockAppLockPassword } from 'src/pages/AppSettings/components/LockApp/AppLockPasswordDialog';
import _ from 'lodash';
import { isHaveCharge, canEditApp, canEditData } from 'src/pages/worksheet/redux/actions/util.js';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum';
import { setFavicon, getTranslateInfo } from 'src/util';
import { pcNavList } from 'src/pages/PageHeader/AppPkgHeader/AppDetail/AppNavStyle';
import RoleSelect from './RoleSelect';
import GlobalSearch from 'src/pages/PageHeader/components/GlobalSearch';
import appManagementApi from 'src/api/appManagement';
import marketplacePaymentApi from 'src/api/marketplacePayment';
import marketplaceApi from 'src/api/marketplace';
import copy from 'copy-to-clipboard';

const APP_STATUS_TEXT = {
  11: _l('还原中'),
  12: _l('迁移中'),
};

const mapStateToProps = ({ sheet, sheetList, appPkg: { appStatus } }) => ({ sheet, sheetList, appStatus });
const mapDispatchToProps = dispatch => ({
  syncAppDetail: detail => dispatch(syncAppDetail(detail)),
  updateColor: color => dispatch(changeAppColor(color)),
  updateNavColor: color => dispatch(changeNavColor(color)),
  setAppStatus: data => dispatch(setAppStatus(data)),
  refreshSheetList: () => dispatch(refreshSheetList()),
});
const rowInfoReg = /\/app\/(.*)\/(.*)(\/(.*))?\/row\/(.*)|\/app\/(.*)\/newrecord\/(.*)\/(.*)/;
const workflowDetailReg = /\/app\/(.*)\/workflowdetail\/record\/(.*)\/(.*)/;
const checkRecordInfo = url => rowInfoReg.test(url) || workflowDetailReg.test(url);

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
    this.state = {
      indexSideVisible: false,
      appConfigVisible: false,
      modifyAppIconAndNameVisible: false,
      editAppIntroVisible: false,
      isEditing: false,
      isShowAppIntroFirst: !_.includes(openedApps, appId),
      navigationConfigVisible: false,
      copyAppVisible: false,
      data: {},
      hasChange: false,
      noUseBackupRestore: false,
      appAnalyticsVisible: false,
      modifyAppLockPasswordVisible: false,
      lockAppVisisble: false,
      roleDebugVisible: false,
      createOrderLoading: false,
      updateSocketVisible: false,
      socket: '',
    };
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
    $('[rel="icon"]').attr('href', '/favicon.png');
    document.querySelector('body').classList.remove('leftNavigationStyleWrap');
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
    this.dataCache = _.pick(data, ['icon', 'iconColor', 'name']);
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
    this.setState({ appConfigVisible: false, [type]: true, isEditing: true });
  };

  handleAppIconAndNameChange = obj => {
    const isSame = this.dataCache && Object.keys(obj).every(key => obj[key] === this.dataCache[key]);
    if (!isSame) {
      this.updateAppDetail(obj);
    }
  };

  updateAppDetail = obj => {
    const { appId, groupId } = this.ids;
    const current = _.pick(this.state.data, ['projectId', 'iconColor', 'navColor', 'icon', 'description', 'name']);
    if (!obj.name) obj = _.omit(obj, 'name');
    const para = { ...current, ...obj };
    api.editAppInfo({ appId, ...para }).then(({ data }) => {
      this.dataCache = _.pick(para, ['icon', 'iconColor', 'navColor', 'name']);
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
    const { data } = this.state;
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

  handleCreateOrder = () => {
    const { data, createOrderLoading } = this.state;
    if (createOrderLoading) {
      return;
    }

    if (md.global.Config.IsLocal) {
      alert(_l('请前往市场操作续订'), 3);
      return;
    }

    const createOrder = () => {
      marketplacePaymentApi
        .createOrder({
          projectId: data.projectId,
          environmentType: 1,
          licenseId: data.license.licenseId,
          purchaseRecordId: data.license.id,
          productId: data.goodsId,
          productType: 0,
          buyTypeEnum: 1,
        })
        .then(res => {
          if (res && res.excuteStatus) {
            window.open(`${md.global.Config.MarketUrl}/orderDetail/${res.orderId}`);
          }
        })
        .finally(() => this.setState({ createOrderLoading: false }));
    };
    this.setState({ createOrderLoading: true });
    marketplacePaymentApi
      .checkUnpayOrderByPurchaseRecordId({
        purchaseRecordId: data.license.id,
      })
      .then(data => {
        if (data.hasUnpayOrder) {
          this.setState({ createOrderLoading: false });
          window.open(`${md.global.Config.MarketUrl}/orderDetail/${data.orderId}`);
        } else {
          createOrder();
        }
      });
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
          <div style={{ width: '100%', margin: '6px 0', borderTop: '1px solid #EAEAEA' }} />
          {this.renderMenuHtml({ type, icon, text, action, ...rest })}
        </React.Fragment>
      );
    }

    if ('appLicense' === type && license) {
      const planTypes = {
        0: _l('免费'),
        1: _l('试用'),
        2: _l('固定价格'),
        3: _l('按使用人数订阅'),
      };
      return (
        <Tooltip
          popupAlign={{ points: ['tr', 'br'], offset: [5, -50], overflow: { adjustX: true, adjustY: true } }}
          action={['hover']}
          popup={
            <div className="Menu ming flexColumn pAll20 appLicenseWrap" style={{ minWidth: 300 }}>
              <div className="flexRow mBottom10">
                <div className="Gray_75 mRight15 nowrap">{_l('开发者')}</div>
                <div className="ellipsis">{license.developName}</div>
              </div>
              <div className="flexRow mBottom10">
                <div className="Gray_75 mRight15 nowrap">{_l('订购计划')}</div>
                <div className="ellipsis">{planTypes[license.planType]}</div>
              </div>
              <div className="flexRow mBottom10">
                <div className="Gray_75 mRight15 nowrap">{_l('周期')}</div>
                <div className="ellipsis">
                  {data.endTime ? (
                    <Fragment>
                      <span>{license.day ? _l('剩余%0天', license.day) : ''}</span>
                      <span className="mLeft10">{_l('%0 到期', data.endTime)}</span>
                    </Fragment>
                  ) : (
                    _l('永久有效')
                  )}
                </div>
              </div>
              <div className="flexRow mBottom10">
                <div className="Gray_75 mRight15 nowrap">{_l('人数限制')}</div>
                <div className="ellipsis">{license.personCount || _l('不限制')}</div>
              </div>
              <div className="flexRow mBottom10">
                <div className="Gray_75 mRight15 nowrap">{_l('版本号')}</div>
                <div className="ellipsis">{license.versionNo}</div>
              </div>
              <div className="flexRow alignItemsCenter">
                <div className="Gray_75 mRight15 nowrap">{_l('状态')}</div>
                <div className={cx('licenseStatus', { valid: data.isGoodsStatus })}>
                  {data.isGoodsStatus ? _l('生效中') : _l('已过期')}
                </div>
                {license.projectType === 2 && (
                  <div
                    className="ThemeColor ThemeHoverColor2 pointer mLeft8"
                    onClick={() => {
                      this.setState({ updateSocketVisible: true });
                      setTimeout(() => {
                        this.setState({ appConfigVisible: false });
                      }, 0);
                    }}
                  >
                    {_l('更新密钥')}
                  </div>
                )}
              </div>
              {[2, 3].includes(license.planType) && data.isGoodsStatus && data.endTime && (
                <div
                  className="renewal mTop10 pointer flexRow alignItemsCenter justifyContentCenter"
                  onClick={this.handleCreateOrder}
                >
                  {this.state.createOrderLoading && <LoadDiv className="mLeft0 mRight5" size={16} />}
                  {_l('立即续订')}
                </div>
              )}
            </div>
          }
        >
          {this.renderMenuHtml({ type, icon, text, action, ...rest })}
        </Tooltip>
      );
    }

    return this.renderMenuHtml({ type, icon, text, action, ...rest });
  };

  toSetEnterpirse = () => {
    const { projectId } = this.state.data;
    navigateTo(`/admin/workwxapp/${projectId}`);
    this.setState({ noIntegratedWechat: false });
  };
  submitApply = () => {
    const { projectId, appId } = this.state.data;
    editWorkWXAlternativeAppStatus({
      projectId,
      appId,
    }).then(res => {
      if (res) {
        alert(_l('提交申请成功'));
      } else {
        alert(_l('提交申请失败'), 2);
      }
    });
    this.setState({ integratedWechat: false });
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
        {type === 'worksheetapi' && <Icon icon="external_collaboration" className="mLeft10 worksheetapiIcon" />}
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
    const { data } = this.state;
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
    const { appStatus, ...props } = this.props;
    const { appConfigVisible, modifyAppIconAndNameVisible, data, updateSocketVisible, socket } = this.state;
    const {
      id: appId,
      iconUrl,
      navColor,
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
      license = {},
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
    // 加锁应用不限制 修改应用名称和外观、编辑应用说明、使用说明、日志（8.2）
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

      return (
        <Fragment>
          {tb && (
            <div
              className={cx('appDetailWrap pointer overflowHidden')}
              onDoubleClick={e => {
                e.stopPropagation();
                if (canEditApp(permissionType, isLock) && isNormalApp) {
                  this.setState({ modifyAppIconAndNameVisible: true });
                }
              }}
            >
              <div className="appIconAndName pointer overflow_ellipsis" onClick={this.handleAppNameClick}>
                <div className="appIconWrap">
                  <SvgIcon
                    url={iconUrl}
                    fill={['black', 'light'].includes(themeType) ? iconColor : '#FFF'}
                    size={[1, 3].includes(currentPcNaviStyle) ? 28 : 24}
                  />
                </div>
                <span className="appName overflow_ellipsis">{showName}</span>
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
                    onClickAwayExceptions={['.appLicenseWrap']}
                  >
                    {list.map(({ type, icon, text, action, ...rest }) => {
                      return this.renderMenu({ type, icon, text, action, ...rest });
                    })}
                  </Menu>
                )}
              </div>
            )}
          {(isHaveCharge(permissionType, isLock) ? description : true) && (isNormalApp || isMigrate) && (
            <div
              className="appIntroWrap pointer"
              data-tip={_l('应用说明')}
              onClick={e => {
                mousePosition = { x: e.pageX, y: e.pageY };
                this.setState({ editAppIntroVisible: true, isEditing: false });
              }}
            >
              <Icon className="appIntroIcon Font16" icon="info" />
            </div>
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
          {updateSocketVisible && (
            <Dialog
              visible={true}
              width={480}
              title={_l('更新密钥')}
              showCancel={false}
              overlayClosable={false}
              onCancel={() => this.setState({ updateSocketVisible: false, socket: '' })}
              onOk={() => {
                if (!socket) {
                  alert(_l('密钥不能为空'), 3);
                  return;
                }
                marketplaceApi.setSecretKeyForApp({ key: socket, appId }).then(data => {
                  const alertMessage = {
                    1: _l('更新成功'),
                    2: _l('密钥错误'),
                    3: _l('应用已删除'),
                    4: _l('安装的应用和授权的应用不一致'),
                    5: _l('授权密钥组织不匹配'),
                    6: _l('授权已更新'),
                  };
                  alert(alertMessage[data], data === 1 ? 1 : 2);
                  if (data === 1) {
                    this.setState({ updateSocketVisible: false, socket: '' });
                    location.reload();
                  }
                });
              }}
            >
              <div className="mBottom16 Font14">{_l('密钥')}</div>
              <Input
                className="w100"
                placeholder={_l('通过填入密钥更新授权信息，密钥可在应用详情中查看')}
                value={socket}
                onChange={socket => this.setState({ socket })}
              />
            </Dialog>
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
            {ss && (
              <Tooltip text={_l('超级搜索(F)')}>
                <div className="flexRow alignItemsCenter pointer White backlogWrap" onClick={this.openGlobalSearch}>
                  <Icon icon="search" className="Font18" />
                </div>
              </Tooltip>
            )}
            {!(md.global.Account.isPortal || window.isPublicApp) && td && (
              <MyProcessEntry type="appPkg" renderContent={renderContent} />
            )}
          </div>
          <div className="flexRow alignItemsCenter pTop10 Relative">{renderAppDetailWrap()}</div>
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
      isAutofucus,
      appAnalyticsVisible,
      roleDebugVisible,
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
    const { s, tb, tr } = getAppFeaturesVisible();
    // 当导航方式为经典或卡片时URL的隐藏参数全写上后，顶部色块应该隐藏
    if (_.includes([0, 2], currentPcNaviStyle) && !s && !tb && !tr) return null;

    // loading 不展示导航
    if (_.isEmpty(data)) {
      return null;
    }

    return (
      <div
        className={cx('appPkgHeaderWrap', themeType)}
        style={{
          backgroundColor: navColor,
          width: [1, 3].includes(currentPcNaviStyle) ? 240 : undefined,
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
            onSave={value => {
              this.handleEditApp('', { description: !value ? (this.state.hasChange ? value : description) : value });
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
            <LeftCommonUserHandle type="appPkg" isAuthorityApp={isAuthorityApp} data={data} {...props} />
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
        <Motion style={{ x: spring(roleDebugVisible ? 0 : 400) }}>
          {({ x }) => (
            <RoleSelect
              {..._.pick(data, ['permissionType', 'id'])}
              visible={roleDebugVisible}
              roleSelectValue={_.get(debugRole, 'selectedRoles') || []}
              posX={x}
              appId={appId}
              handleClose={() => this.setState({ roleDebugVisible: false })}
              onClickAway={e => {
                if (!roleDebugVisible) return;
                const parent = document.querySelector('.roleSelectCon');
                if (parent && parent.contains(e)) return;
                this.setState({ roleDebugVisible: false });
              }}
            />
          )}
        </Motion>
      </div>
    );
  }
}
