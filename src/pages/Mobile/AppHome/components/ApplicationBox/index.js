import React, { Component, Fragment } from 'react';
import { Flex, ActionSheet, Modal } from 'antd-mobile';
import { Icon, Button, SvgIcon } from 'ming-ui';
import ApplicationItem from '../ApplicationItem';
import { generateRandomPassword, getCurrentProject, addBehaviorLog } from 'src/util';
import styled from 'styled-components';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';

const GroupIcon = styled(SvgIcon)`
  font-size: 0px;
  margin-right: 10px;
`;

export default class ApplicationList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: document.documentElement.clientWidth,
    };
  }

  componentDidMount() {
    const dashboardHideGroup = localStorage.getItem(`dashboardExpandGroup_${md.global.Account.accountId}`);
    if (dashboardHideGroup) {
      this.setState({ dashboardHideGroup: dashboardHideGroup.split(',') });
    }
  }

  renderErr() {
    const isApp = window.isWxWork || window.isWeLink || window.isDingTalk;
    const cannotCreateApp = isApp ? _.get(md.global.Account.projects[0], ['cannotCreateApp']) : true;
    const { externalApps } = this.props.myAppData || {};

    const projects = _.get(md, ['global', 'Account', 'projects']);
    if (_.isEmpty(projects)) {
      return (
        <Fragment>
          <div
            className={cx('noNetworkBox flexColumn', {
              flex: _.isEmpty(externalApps),
              'mTop80 mBottom72': !_.isEmpty(externalApps),
            })}
          >
            <div className="noNetworkBoxBG" />
            <div className="Font17 bold mTop40">{_l('创建或申请加入一个组织，开始创建应用')}</div>
            <div className="flexRow mTop28">
              <button
                type="button"
                className="joinNetwork ThemeBGColor3 ThemeHoverBGColor2 mRight20"
                onClick={() => window.open('/enterpriseRegister?type=add', '__blank')}
              >
                {_l('加入组织')}
              </button>
              <button
                type="button"
                className="createNetwork ThemeBGColor3 ThemeBorderColor3 ThemeColor3"
                onClick={() => window.open('/enterpriseRegister?type=create', '__blank')}
              >
                {_l('创建组织')}
              </button>
            </div>
          </div>
          {!_.isEmpty(externalApps) ? (
            <Fragment>
              <div className="spaceBottom"></div>
              {this.renderGroupDetail({
                type: 'externalApps',
                name: _l('外部协作'),
                icon: 'h5_external',
                apps: externalApps,
              })}
            </Fragment>
          ) : (
            ''
          )}
        </Fragment>
      );
    }

    return (
      <div className="flexColumn flex valignWrapper justifyContentCenter">
        <p className="Gray_75 mTop25 TxtCenter Gray Font17 errPageCon">
          {cannotCreateApp
            ? _l('暂无任何应用，请选择从应用库添加应用开始使用')
            : _l('您暂无权限添加应用，请联系管理员进行添加使用')}
        </p>
        {cannotCreateApp && (
          <Button className="addApp bold Font17" onClick={this.showActionSheet}>
            {_l('添加应用')}
          </Button>
        )}
      </div>
    );
  }

  // 添加应用
  showActionSheet = () => {
    const BUTTONS = [
      { name: _l('从模板库添加'), icon: 'application_library', iconClass: 'Font18' },
      { name: _l('自定义创建'), icon: 'add1', iconClass: 'Font18' },
    ];

    ActionSheet.showActionSheetWithOptions(
      {
        options: BUTTONS.map(item => (
          <Fragment>
            <Icon className={cx('mRight10 Gray_9e', item.iconClass)} icon={item.icon} />
            <span className="Bold">{item.name}</span>
          </Fragment>
        )),
        message: (
          <div className="flexRow header">
            <span className="Font13">{_l('添加应用')}</span>
            <div
              className="closeIcon"
              onClick={() => {
                ActionSheet.close();
              }}
            >
              <Icon icon="close" />
            </div>
          </div>
        ),
      },
      buttonIndex => {
        if (buttonIndex === -1) return;
        if (buttonIndex === 0) {
          window.mobileNavigateTo(`/mobile/appBox`);
        }
        if (buttonIndex === 1) {
          const title = window.isWxWork ? _l('创建自定义应用请前往企业微信PC桌面端') : _l('创建自定义应用请前往PC端');
          Modal.alert(title, null, [{ text: _l('我知道了'), onPress: () => {} }]);
        }
      },
    );
  };

  forTitle = ({ type, name, icon, iconUrl, showExpandIcon = true }) => {
    const { dashboardHideGroup = [] } = this.state;

    if (_.includes(['apps', 'externalApps'], type)) {
      return (
        <div
          className="flexRow alignItemsCenter w100"
          onClick={() => {
            const temp = _.includes(dashboardHideGroup, type)
              ? dashboardHideGroup.filter(v => v !== type)
              : dashboardHideGroup.concat(type);
            this.setState({
              dashboardHideGroup: temp,
            });
            safeLocalStorageSetItem(`dashboardExpandGroup_${md.global.Account.accountId}`, temp);
          }}
        >
          <div className="flex">
            <Icon icon={icon} className="mRight10 TxtMiddle Gray_9e Font20" />
            <span className={cx('Gray Font17 Bold', { TxtMiddle: type !== 'groupApps' })}>{name}</span>
          </div>
          {showExpandIcon && (
            <Icon icon={_.includes(dashboardHideGroup, type) ? 'plus' : 'minus'} className="Gray_9e" />
          )}
        </div>
      );
    }
    return (
      <div className="flexRow alignItemsCenter">
        {iconUrl ? (
          <GroupIcon url={iconUrl} fill="#9e9e9e" size={20} />
        ) : (
          <Icon icon={icon} className="mRight10 TxtMiddle Gray_9e Font20" />
        )}
        <span className={cx('Gray Font17 Bold', { TxtMiddle: type !== 'groupApps' })}>{name}</span>
      </div>
    );
  };

  renderGroupDetail = ({ canCreateApp, apps = [], type, name, icon, iconUrl, showExpandIcon }) => {
    let appList = apps.filter(o => o && !o.webMobileDisplay); //排除webMobileDisplay h5未发布
    const distance = ((this.state.width - 12) / 4 - 56) / 2;
    const { dashboardHideGroup = [] } = this.state;

    return (
      <div className="groupDetail" key={`${type}-${generateRandomPassword(16)}`}>
        <div
          className={cx('flexRow pTop16', {
            pBottom16: type === 'apps' && _.includes(dashboardHideGroup, 'apps'),
          })}
          style={{ paddingLeft: `${distance}px`, paddingRight: `${distance}px` }}
        >
          {this.forTitle({ type, name, icon, iconUrl, showExpandIcon })}
        </div>
        {type === 'externalApps' && _.isEmpty(apps) ? (
          <div className="Gray_bd bold mLeft30 mTop20" style={{ paddingLeft: `${distance}px` }}>
            {_l('暂无外部协作者的应用')}
          </div>
        ) : _.includes(dashboardHideGroup, type) ? null : (
          <Flex align="center" wrap="wrap" className="appCon">
            {_.map(appList, (item, i) => {
              return <ApplicationItem data={item} />;
            })}
            {canCreateApp && (
              <ApplicationItem
                data={{
                  id: 'add',
                  iconColor: '#F5F5F5',
                  icon: 'plus',
                  name: _l('添加应用'),
                  onClick: this.showActionSheet,
                }}
              />
            )}
          </Flex>
        )}
      </div>
    );
  };

  render() {
    const { myAppData = {}, projectId } = this.props;
    const {
      markedGroup = [],
      projectGroups = [],
      personalGroups = [],
      apps = [],
      externalApps = [],
      aloneApps = [],
      homeSetting = {},
      markedGroupIds = [],
    } = myAppData;
    const { isAllAndProject, exDisplay } = homeSetting;
    const projectObj = getCurrentProject(
      localStorage.getItem('currentProjectId') || (md.global.Account.projects[0] || {}).projectId,
    );
    const currentProject = !_.isEmpty(projectObj) ? projectObj : { projectId: 'external', companyName: _l('外部协作') };
    const distance = ((this.state.width - 12) / 4 - 56) / 2;
    const canCreateApp =
      projectId !== 'external' &&
      !(_.find(md.global.Account.projects, item => item.projectId === projectId) || {}).cannotCreateApp;

    // 无网络 &&（ 无任何应用 || 有外协）
    if (
      _.isEmpty(md.global.Account.projects) &&
      ((_.isEmpty(markedGroup) && _.isEmpty(apps) && _.isEmpty(externalApps) && _.isEmpty(aloneApps)) ||
        !_.isEmpty(externalApps))
    ) {
      return this.renderErr();
    }

    // 外协
    if (currentProject.projectId === 'external') {
      return (
        <Fragment>
          {this.renderGroupDetail({
            type: 'externalApps',
            name: _l('外部协作'),
            icon: 'h5_external',
            apps: externalApps,
            showExpandIcon: _.isEmpty(externalApps) ? false : true,
          })}
        </Fragment>
      );
    }

    const groups = isAllAndProject ? [...projectGroups, ...markedGroup] : markedGroup;
    const hasGroupApps =
      _.some(groups, item =>
        _.some(item.appIds, v =>
          _.includes(
            apps.map(v => v.id),
            v,
          ),
        ),
      ) ||
      (!_.isEmpty(groups) && canCreateApp);

    return (
      <Fragment>
        {/* 标星分组 */}
        {markedGroup.map(item => {
          if ((!item || !item.apps || _.isEmpty(item.apps)) && !canCreateApp) return;
          return (
            <Fragment>
              {this.renderGroupDetail({
                data: item,
                type: 'markedGroup',
                name: item.name,
                icon: item.icon,
                iconUrl: item.iconUrl,
                apps: item.apps,
                canCreateApp,
              })}
            </Fragment>
          );
        })}
        {/* 组织分组 */}
        {isAllAndProject &&
          projectGroups
            .filter(v => !_.includes(markedGroupIds, v.id))
            .map(item => {
              const currentApps = _.filter(apps, v => _.includes(item.appIds || [], v.id));
              // if (_.isEmpty(currentApps)) return;

              return (
                <Fragment>
                  {this.renderGroupDetail({
                    type: 'groupApps',
                    name: item.name,
                    icon: item.icon,
                    iconUrl: item.iconUrl,
                    apps: currentApps,
                    canCreateApp,
                  })}
                </Fragment>
              );
            })}

        {/* 应用分组入口（个人分组、组织分组） */}
        {(!_.isEmpty(markedGroup) || !_.isEmpty(personalGroups) || !_.isEmpty(projectGroups)) && (
          <Fragment>
            {isAllAndProject && hasGroupApps && <div className="spaceBottom" />}
            <div
              className="appGroupEntry flexRow"
              style={{ paddingLeft: `${distance}px` }}
              onClick={() => {
                window.mobileNavigateTo('/mobile/appGroupList');
              }}
            >
              <span>
                <Icon icon="table_rows" className="mRight10 TxtMiddle Gray_9e Font20" />
                <span className="Gray Font17 Bold TxtMiddle">{_l('应用分组')}</span>
              </span>
              <Icon icon="navigate_next" className="Gray_9e Font18" />
            </div>
            <div className="spaceBottom"></div>
          </Fragment>
        )}

        {/* 全部应用 */}
        {currentProject &&
          this.renderGroupDetail({
            type: 'apps',
            name: _l('全部应用'),
            icon: 'workbench',
            apps,
            canCreateApp,
          })}
        {exDisplay && !_.isEmpty(externalApps) && <div className="spaceBottom"></div>}
        {/* 外协应用 */}
        {exDisplay &&
          !_.isEmpty(externalApps) &&
          this.renderGroupDetail({
            type: 'externalApps',
            name: _l('外部协作'),
            icon: 'h5_external',
            apps: externalApps,
          })}
      </Fragment>
    );
  }
}
