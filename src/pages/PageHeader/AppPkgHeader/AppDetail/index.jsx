import React, { Component, Fragment } from 'react';
import { func, oneOf } from 'prop-types';
import { Motion, spring } from 'react-motion';
import color from 'color';
import cx from 'classnames';
import DocumentTitle from 'react-document-title';
import { Icon, Menu, MenuItem } from 'ming-ui';
import { connect } from 'react-redux';
import RcDialog from 'rc-dialog';
import 'rc-dialog/assets/index.css';
import { navigateTo } from 'src/router/navigateTo';
import SelectIcon from 'src/pages/AppHomepage/components/SelectIcon';
import VerifyDel from 'src/pages/AppHomepage/components/VerifyDel';
import CopyApp from 'src/pages/AppHomepage/components/CopyApp';
import Trigger from 'rc-trigger';
import SvgIcon from 'src/components/SvgIcon';
import { changeAppColor, syncAppDetail } from 'src/pages/PageHeader/redux/action';
import api from 'api/homeApp';
import { Drawer, Modal } from 'antd';
import HomepageIcon from '../../components/HomepageIcon';
import IndexSide from '../../components/IndexSide';
import CommonUserHandle from '../../components/CommonUserHandle';
import { APP_CONFIG, ADVANCE_AUTHORITY } from '../config';
import ExportApp from 'src/pages/Admin/appManagement/modules/ExportApp';
import AppItemTrash from 'src/pages/worksheet/common/Trash/AppItemTrash';
import { getIds, compareProps, getItem, setItem, isCanEdit } from '../../util';
import EditAppIntro from './EditIntro';
import AppGroup from '../AppGroup';
import AllOptionList from './AllOptionList';
import AppNavStyle from './AppNavStyle';
import AppFixStatus from './AppFixStatus';
import './index.less';
import { getAppFeaturesVisible, getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import EditPublishSetDialog from './EditpublishSet';
import CreateAppBackupDialog from './appBackupRestore/CreateAppBackupDialog';
import ManageBackupFilesDialog from './appBackupRestore/ManageBackupFilesDialog';
import AppAnalytics from 'src/pages/Admin/useAnalytics/components/AppAnalytics';

const mapStateToProps = ({ sheet, sheetList, appPkg: { appStatus } }) => ({ sheet, sheetList, appStatus });
const mapDispatchToProps = dispatch => ({
  syncAppDetail: detail => dispatch(syncAppDetail(detail)),
  updateColor: color => dispatch(changeAppColor(color)),
});

let mousePosition = { x: 139, y: 23 };
@connect(mapStateToProps, mapDispatchToProps)
export default class AppInfo extends Component {
  static propTypes = {
    appStatus: oneOf([0, 1, 2, 3, 4, 5]),
    updateColor: func,
    syncAppDetail: func,
  };
  static defaultProps = {
    appStatus: 0,
    updateColor: _.noop,
    syncAppDetail: _.noop,
  };

  constructor(props) {
    super(props);
    const { appId } = getIds(props);
    const openedApps = getItem('openedApps');
    this.state = {
      indexSideVisible: false,
      appConfigVisible: false,
      modifyAppIconAndNameVisible: false,
      editAppIntroVisible: false,
      isEditing: false,
      editAppFixStatusVisible: false,
      exportAppVisible: false,
      isShowAppIntroFirst: !_.includes(openedApps, appId),
      delAppConfirmVisible: false,
      optionListVisible: false,
      copyAppVisible: false,
      data: {},
      hasChange: false,
      showEditPublishSetDialog: false,
      createBackupVisisble: false,
      manageBackupFilesVisible: false,
      noUseBackupRestore: false,
      appAnalyticsVisible: false,
    };
  }

  componentDidMount() {
    this.ids = getIds(this.props);
    this.getData();
    const openedApps = getItem('openedApps') || [];
    const { appId } = this.ids;
    if (!_.includes(openedApps, appId)) {
      setItem('openedApps', openedApps.concat(appId));
    }
  }

  componentWillReceiveProps(nextProps) {
    this.ids = getIds(nextProps);
    if (compareProps(nextProps.match.params, this.props.match.params, ['appId'])) {
      this.getData();
    }
    if (!_.isEqual(this.props.location.search, nextProps.location.search)) {
      this.getData();
    } else if (nextProps.location.search === '?backup') {
      this.setState({
        manageBackupFilesVisible: true,
      });
    }
  }

  componentWillUnmount() {
    clearTimeout(this.clickTimer);
    $('[rel="icon"]').attr('href', '/favicon.png');
  }

  getData = () => {
    const { syncAppDetail } = this.props;
    const { appId } = this.ids;
    if (!appId) return;
    api.getAppDetail({ appId }, { silent: true }).then(data => {
      // 同步应用信息至工作表
      syncAppDetail(
        _.pick(data, [
          'iconColor',
          'iconUrl',
          'projectId',
          'name',
          'id',
          'fixed',
          'fixRemark',
          'fixAccount',
          'permissionType',
          'appDisplay',
          'webMobileDisplay',
          'pcDisplay',
        ]),
      );
      const { tb } = getAppFeaturesVisible();
      const isNormalApp = _.includes([1, 5], data.appStatus);
      if (location.href.indexOf('backup') > -1 && isNormalApp && isCanEdit(data.permissionType, data.isLock) && tb) {
        if (this.state.manageBackupFilesVisible) {
          this.setState({ manageBackupFilesKey: Date.now() });
        } else {
          this.setState({
            manageBackupFilesVisible: true,
          });
        }
      }

      this.setState({ data });
      window.appInfo = data;
      this.dataCache = _.pick(data, ['icon', 'iconColor', 'name']);
      this.buildFavicon(data);
    });
  };

  buildFavicon({ iconUrl, iconColor }) {
    fetch(iconUrl)
      .then(res => res.text())
      .then(data => {
        data = btoa(data.replace(/fill=\".*?\"/g, '').replace(/\<svg/, `<svg fill="${iconColor}"`));
        $('[rel="icon"]').attr('href', `data:image/svg+xml;base64,${data}`);
      });
  }

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
    const { appId } = this.ids;
    const current = _.pick(this.state.data, ['projectId', 'iconColor', 'icon', 'description', 'name']);
    if (!obj.name) obj = _.omit(obj, 'name');
    const para = { ...current, ...obj };
    api.editAppInfo({ appId, ...para }).then(({ data }) => {
      this.dataCache = _.pick(para, ['icon', 'iconColor', 'name']);
      if (data) this.updateData(obj);
    });
  };
  // 编辑应用详情
  handleEditApp = (type, obj) => {
    this.switchVisible({ [type]: false, isShowAppIntroFirst: false });
    this.updateAppDetail(obj);
  };

  handleDelApp = () => {
    const { appId } = this.ids;
    const { data: { projectId } = { projectId: '' } } = this.state;
    this.setState({ delAppConfirmVisible: false });
    api.deleteApp({ appId, projectId, isHomePage: true }).then(res => {
      navigateTo('/app/my');
    });
  };

  handleModify = obj => {
    if (obj.name === '') {
      obj = { ...obj, name: this.dataCache.name };
    }
    if (obj.iconColor) {
      this.props.updateColor(obj.iconColor);
    }
    this.updateData(obj);
  };

  handleAppNameClick = e => {
    e.stopPropagation();
    const { location, sheet, sheetList } = this.props;
    if (/row|role|workflow/.test(location.pathname)) {
      const { appId } = getIds(this.props);
      navigateTo(`/app/${appId}`);
      return;
    }
    const { base, views } = sheet;
    const { data, isCharge } = sheetList;
    const { worksheetId, viewId, appId, groupId } = base;
    const { workSheetId: firstSheetId } = _.head(isCharge ? data : data.filter(item => item.status === 1)) || {};

    if (worksheetId !== firstSheetId) {
      navigateTo(`/app/${appId}/${groupId}/${firstSheetId}`);
      return;
    }
    const { viewId: firstViewId } = _.head(views) || {};
    if (worksheetId === firstSheetId && viewId !== firstViewId) {
      navigateTo(`/app/${appId}/${groupId}/${firstSheetId}/${firstViewId}`);
    }
  };

  renderMenu = ({ type, icon, text, action, ...rest }) => {
    const { data } = this.state;
    const { projectId } = this.state.data;
    if (rest.featureId) {
      const featureType = getFeatureStatus(projectId, rest.featureId);
      if (!featureType) return;
    }
    if (
      _.includes(['createBackup', 'restore', 'export', 'appItemTrash'], type) &&
      !getFeatureStatus(projectId, rest.featureId)
    )
      return;
    if (!projectId && _.includes(['ding', 'weixin', 'worksheetapi'], type)) {
      return '';
    } else {
      if (_.includes(['del', 'export', 'createBackup'], type)) {
        return (
          <React.Fragment>
            <div style={{ width: '100%', margin: '6px 0', borderTop: '1px solid #EAEAEA' }} />
            {this.renderMenuHtml({ type, icon, text, action, ...rest })}
          </React.Fragment>
        );
      }

      if (type === 'editAppNavStyle') {
        return (
          <Trigger
            action={['hover']}
            popupAlign={{ points: ['tl', 'tr'], offset: [0, -20] }}
            popup={
              <AppNavStyle
                data={data}
                onChangeData={data => {
                  this.setState({ data });
                }}
              />
            }
            getPopupContainer={() => document.querySelector('.appConfigIcon .editAppNavStyle .Item-content')}
          >
            <div>{this.renderMenuHtml({ type, icon, text, action, ...rest })}</div>
          </Trigger>
        );
      }

      if (type === 'editAppFixStatus') {
        return this.renderMenuHtml({ type, icon, text: rest.getText(data.fixed), action, ...rest });
      }

      if (type === 'appManageMenu') {
        return (
          <Fragment>
            <div style={{ width: '100%', margin: '6px 0', borderTop: '1px solid #EAEAEA' }} />
            <Trigger
              action={['hover']}
              popupAlign={{ points: ['tl', 'tr'], offset: [0, -6] }}
              popup={
                <div className="appManageMenuWrap">
                  {(rest.subMenuList || []).map(it => this.renderMenu({ ...it }))}
                </div>
              }
              getPopupContainer={() => document.querySelector('.appConfigIcon .appManageMenu .Item-content')}
            >
              {this.renderMenuHtml({ type, icon, text, action, ...rest })}
            </Trigger>
          </Fragment>
        );
      }
      return this.renderMenuHtml({ type, icon, text, action, ...rest });
    }
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

  renderMenuHtml = ({ type, icon, text, action, subMenuList = [], ...rest }) => {
    const { appId } = this.ids;
    const { projectId } = this.state.data;
    const featureType = getFeatureStatus(projectId, rest.featureId);

    return (
      <MenuItem
        key={type}
        className={cx('appConfigItem', type)}
        icon={<Icon className="appConfigItemIcon Font18" icon={icon} />}
        onClick={e => {
          e.stopPropagation();

          if (
            _.includes(
              ['createBackup', 'restore', 'export', 'appItemTrash', 'appAnalytics', 'appItemTrash', 'worksheetapi'],
              type,
            ) &&
            getFeatureStatus(projectId, rest.featureId) === '2'
          ) {
            buriedUpgradeVersionDialog(projectId, rest.featureId);
            return;
          }

          if (type === 'appAnalytics') {
            window.open(`/analytics/${projectId}/${appId}`, '__blank');
            return;
          }

          if (type === 'publishSettings') {
            this.setState({ showEditPublishSetDialog: true, appConfigVisible: false });
            return;
          }

          if (type === 'worksheetapi') {
            window.open(`/worksheetapi/${appId}`);
            return;
          }

          if (type === 'export') {
            this.handleAppConfigClick(action);
            return;
          }
          if (type === 'appItemTrash') {
            this.setState({ appItemTrashVisible: true, appConfigVisible: false });
          }

          this.handleAppConfigClick(action);
        }}
        {...rest}
      >
        <span>{text}</span>
        {type === 'appItemTrash' && featureType === '2' && (
          <icon className="icon-auto_awesome Font16 mLeft6" style={{ color: '#fcb400' }} />
        )}
        {type === 'editAppNavStyle' && <Icon className="rightArrow Font20" icon="navigate_next" />}
        {type === 'appManageMenu' && <Icon className="rightArrow Font20" icon="navigate_next" />}
      </MenuItem>
    );
  };

  changeIndexVisible = (visible = true) => {
    this.timer = setTimeout(() => {
      this.setState({ indexSideVisible: visible });
    }, 100);
  };

  render() {
    const { appStatus, ...props } = this.props;
    const {
      indexSideVisible,
      appConfigVisible,
      editAppIntroVisible,
      isEditing,
      editAppFixStatusVisible,
      optionListVisible,
      exportAppVisible,
      isShowAppIntroFirst,
      delAppConfirmVisible,
      modifyAppIconAndNameVisible,
      copyAppVisible,
      data,
      showEditPublishSetDialog,
      createBackupVisisble,
      manageBackupFilesVisible,
      isAutofucus,
      appItemTrashVisible,
      appAnalyticsVisible,
    } = this.state;
    const {
      id: appId,
      iconColor = '#616161',
      name,
      icon,
      iconUrl,
      description,
      permissionType,
      isLock,
      projectId,
      fixed,
      pcDisplay,
    } = data;
    const isNormalApp = _.includes([1, 5], appStatus);
    const isAuthorityApp = permissionType >= ADVANCE_AUTHORITY;
    const list = APP_CONFIG[permissionType] || [];

    if ((_.find(md.global.Account.projects, o => o.projectId === projectId) || {}).cannotCreateApp) {
      _.remove(list, o => o.type === 'copy');
    }

    // 获取url参数
    const { s, tb } = getAppFeaturesVisible();

    return (
      <div
        className="appPkgHeaderWrap"
        style={{
          backgroundColor: color(iconColor).darken(0.07),
        }}
      >
        <DocumentTitle title={name} />
        <div className="appInfoWrap">
          {window.isPublicApp || !s ? (
            <div className="mLeft16" />
          ) : (
            <div
              className="homepageIconWrap"
              onClick={this.changeIndexVisible}
              onMouseEnter={this.changeIndexVisible}
              onMouseLeave={() => clearTimeout(this.timer)}
            >
              <HomepageIcon />
            </div>
          )}
          {tb && (
            <div
              className={cx('appDetailWrap pointer')}
              onDoubleClick={e => {
                e.stopPropagation();
                if (isCanEdit(permissionType, isLock) && isNormalApp) {
                  this.setState({ modifyAppIconAndNameVisible: true });
                }
              }}
            >
              <div className="appIconAndName pointer" onClick={this.handleAppNameClick}>
                <div className="appIconWrap">
                  <SvgIcon url={iconUrl} fill="#fff" />
                </div>
                <span className="appName overflow_ellipsis">{name}</span>
              </div>
            </div>
          )}
          {!(pcDisplay && !isAuthorityApp) && fixed && <div className="appFixed">{_l('维护中')}</div>}
          {isNormalApp && isCanEdit(permissionType, isLock) && tb && (
            <div
              className="appConfigIcon pointer"
              onClick={() => {
                this.setState({ appConfigVisible: true });
              }}
            >
              <Icon icon="expand_more" className="Font18" style={{ lineHeight: 'inherit' }} />
              {appConfigVisible && (
                <Menu
                  style={{ top: '45px', width: '220px', padding: '6px 0' }}
                  onClickAway={() => this.setState({ appConfigVisible: false })}
                >
                  {list.map(({ type, icon, text, action, ...rest }) => {
                    return this.renderMenu({ type, icon, text, action, ...rest });
                  })}
                </Menu>
              )}
            </div>
          )}
          {description && isNormalApp && (
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
              {..._.pick(data, ['icon', 'iconColor', 'name'])}
              className="modifyAppInfo"
              onNameInput={this.handleNameInput}
              onModify={this.handleModify}
              onChange={this.handleAppIconAndNameChange}
              onClose={() => this.switchVisible({ selectIconVisible: false })}
              onClickAway={() => this.switchVisible({ modifyAppIconAndNameVisible: false })}
            />
          )}
        </div>
        {!(fixed && !isAuthorityApp) && !(pcDisplay && !isAuthorityApp) && (
          <AppGroup appStatus={appStatus} {...props} {..._.pick(data, ['permissionType', 'isLock'])} />
        )}

        {/* 当应用状态正常且应用描述有值且第一次进入此应用会弹出编辑框 */}
        <RcDialog
          className="appIntroDialog"
          wrapClassName="appIntroDialogWrapCenter"
          visible={editAppIntroVisible || (!window.isPublicApp && isShowAppIntroFirst && description && isNormalApp)}
          onClose={() => this.switchVisible({ editAppIntroVisible: false, isShowAppIntroFirst: false })}
          animation="zoom"
          style={{ width: '800px' }}
          maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          bodyStyle={{ padding: 0 }}
          maskAnimation="fade"
          mousePosition={mousePosition}
          closeIcon={<Icon icon="close" />}
        >
          <EditAppIntro
            cacheKey="appIntroDescription"
            description={description}
            permissionType={permissionType}
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
              this.switchVisible({ editAppIntroVisible: false, isShowAppIntroFirst: false, hasChange: false });
            }}
            onCancel={() =>
              this.switchVisible({ editAppIntroVisible: false, isShowAppIntroFirst: false, hasChange: false })
            }
          />
        </RcDialog>
        {delAppConfirmVisible && (
          <VerifyDel
            name={name}
            onOk={this.handleDelApp}
            onCancel={() => this.switchVisible({ delAppConfirmVisible: false })}
          />
        )}
        {copyAppVisible && (
          <CopyApp title={name} para={{ appId }} onCancel={() => this.switchVisible({ copyAppVisible: false })} />
        )}
        <Drawer
          bodyStyle={{ display: 'flex', flexDirection: 'column', padding: '0' }}
          width={1100}
          title={null}
          visible={optionListVisible}
          closeIcon={null}
          onClose={() => this.switchVisible({ optionListVisible: false })}
          placement="right"
        >
          <AllOptionList
            {...getIds(props)}
            visible={optionListVisible}
            onClose={() => this.switchVisible({ optionListVisible: false })}
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
        <CommonUserHandle type="appPkg" {...props} />
        {exportAppVisible && (
          <ExportApp appIds={[appId]} closeDialog={() => this.setState({ exportAppVisible: false })} />
        )}
        {editAppFixStatusVisible && (
          <AppFixStatus
            isAutofucus={isAutofucus}
            appId={appId}
            projectId={projectId}
            fixed={manageBackupFilesVisible ? false : data.fixed}
            fixRemark={data.fixRemark}
            onChangeStatus={obj => {
              this.setState({
                data: {
                  ...data,
                  ...obj,
                },
              });
            }}
            onCancel={() => this.setState({ editAppFixStatusVisible: false })}
          />
        )}
        {showEditPublishSetDialog && (
          <EditPublishSetDialog
            showEditPublishSetDialog={showEditPublishSetDialog}
            projectId={projectId}
            appId={appId}
            data={data}
            appName={name}
            onChangeFixStatus={() => this.setState({ editAppFixStatusVisible: true, isAutofucus: true })}
            onChangePublish={obj =>
              this.setState({
                data: {
                  ...data,
                  ...obj,
                },
              })
            }
            onClose={() => {
              this.setState({
                showEditPublishSetDialog: false,
              });
            }}
          />
        )}

        {createBackupVisisble && (
          <CreateAppBackupDialog
            projectId={projectId}
            appId={appId}
            appName={name}
            openManageBackupDrawer={() => {
              this.setState({
                manageBackupFilesVisible: true,
              });
            }}
            closeDialog={() => {
              this.setState({ createBackupVisisble: false });
            }}
          />
        )}

        {manageBackupFilesVisible && (
          <ManageBackupFilesDialog
            visible={manageBackupFilesVisible}
            fixed={data.fixed}
            onChangeFixStatus={flag => this.setState({ editAppFixStatusVisible: flag, isAutofucus: true })}
            projectId={projectId}
            appId={appId}
            appName={name}
            manageBackupFilesKey={this.state.manageBackupFilesKey}
            onClose={() => {
              this.setState({
                manageBackupFilesVisible: false,
              });
            }}
            onChangeStatus={obj => {
              this.setState({
                data: {
                  ...data,
                  ...obj,
                },
              });
            }}
          />
        )}

        {appItemTrashVisible && (
          <AppItemTrash
            appId={appId}
            projectId={projectId}
            onCancel={() => this.setState({ appItemTrashVisible: false })}
          />
        )}

        {appAnalyticsVisible && (
          <AppAnalytics
            currentAppInfo={{ appId, name, iconColor, iconUrl }}
            projectId={projectId}
            onCancel={() => {
              this.setState({ appAnalyticsVisible: false });
            }}
          />
        )}
      </div>
    );
  }
}
