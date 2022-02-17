import React, { Component } from 'react';
import { func, oneOf } from 'prop-types';
import { Motion, spring } from 'react-motion';
import color from 'color';
import cx from 'classnames';
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
import { Drawer } from 'antd';
import HomepageIcon from '../../components/HomepageIcon';
import IndexSide from '../../components/IndexSide';
import CommonUserHandle from '../../components/CommonUserHandle';
import { APP_CONFIG, ADVANCE_AUTHORITY } from '../config';
import ExportApp from 'src/pages/Admin/appManagement/modules/ExportApp';
import { getIds, compareProps, getItem, setItem, isCanEdit } from '../../util';
import EditAppIntro from './EditIntro';
import AppGroup from '../AppGroup';
import AllOptionList from './AllOptionList';
import AppNavStyle from './AppNavStyle';
import AppFixStatus from './AppFixStatus';
import './index.less';
import { upgradeVersionDialog, getAppFeaturesVisible } from 'src/util';

const mapStateToProps = ({ sheet, sheetList, appPkg: { appStatus } }) => ({ sheet, sheetList, appStatus });
const mapDispatchToProps = dispatch => ({
  syncAppDetail: detail => dispatch(syncAppDetail(detail)),
  updateColor: color => dispatch(changeAppColor(color)),
});

let mousePosition = { x: 139, y: 23 };
@connect(
  mapStateToProps,
  mapDispatchToProps,
)
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
      editAppFixStatusVisible: false,
      exportAppVisible: false,
      isShowAppIntroFirst: !_.includes(openedApps, appId),
      delAppConfirmVisible: false,
      optionListVisible: false,
      copyAppVisible: false,
      data: {},
      hasChange: false,
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
        ]),
      );
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
    this.setState({ appConfigVisible: false, [type]: true });
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
    api.deleteApp({ appId, projectId }).then(res => {
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
    if (!this.state.data.projectId && (type === 'ding' || type === 'weixin' || type === 'worksheetapi')) {
      return '';
    } else {
      if (type === 'del' || type === 'worksheetapi') {
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
      return this.renderMenuHtml({ type, icon, text, action, ...rest });
    }
  };

  renderMenuHtml = ({ type, icon, text, action, ...rest }) => {
    const { appId } = this.ids;
    const { projectId } = this.state.data;
    return (
      <MenuItem
        key={type}
        className={cx('appConfigItem', type)}
        icon={<Icon className="appConfigItemIcon Font18" icon={icon} />}
        onClick={e => {
          e.stopPropagation();
          if (type === 'ding') {
            window.open(`/dingAppCourse/${projectId}/${appId}`);
            return;
          }
          if (type === 'weixin') {
            window.open(`/weixinAppCourse/${projectId}/${appId}`);
            return;
          }
          if (type === 'worksheetapi') {
            const licenseType = _.get(
              _.find(md.global.Account.projects, item => item.projectId === projectId) || {},
              'licenseType',
            );
            if (licenseType === 0) {
              upgradeVersionDialog({
                projectId,
                explainText: _l('请升级至付费版解锁开启'),
                isFree: true,
              });
              return;
            }
            window.open(`/worksheetapi/${appId}`);
            return;
          }
          if (type === 'export') {
            this.handleAppConfigClick(action);
            return;
          }
          this.handleAppConfigClick(action);
        }}
        {...rest}
      >
        <span>{text}</span>
        {type === 'editAppNavStyle' && <Icon className="rightArrow Font20" icon="navigate_next" />}
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
      editAppFixStatusVisible,
      optionListVisible,
      exportAppVisible,
      isShowAppIntroFirst,
      delAppConfirmVisible,
      modifyAppIconAndNameVisible,
      copyAppVisible,
      data,
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
          {fixed && <div className="appFixed">{_l('维护中')}</div>}
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
                this.setState({ editAppIntroVisible: true });
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
        {!(fixed && !isAuthorityApp) && (
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
          bodyStyle={{ minHeight: '480px', padding: 0 }}
          maskAnimation="fade"
          mousePosition={mousePosition}
          closeIcon={<Icon icon="close" />}
        >
          <EditAppIntro
            description={description}
            permissionType={permissionType}
            isEditing={!description && isAuthorityApp}
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
          <AllOptionList visible={optionListVisible} {...getIds(props)} />
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
            appId={appId}
            projectId={projectId}
            fixed={data.fixed}
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
      </div>
    );
  }
}
