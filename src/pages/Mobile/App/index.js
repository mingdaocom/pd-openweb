import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { List, Flex, ActionSheet, Modal, ActivityIndicator, Accordion, Switch, TabBar } from 'antd-mobile';
import { Icon, WaterMark } from 'ming-ui';
import cx from 'classnames';
import * as actions from './redux/actions';
import { ROLE_TYPES } from 'src/pages/Role/config.js';
import Back from '../components/Back';
import guideImg from './img/guide.png';
import DocumentTitle from 'react-document-title';
import { AppPermissionsInfo } from '../components/AppPermissions';
import RecordList from 'mobile/RecordList';
import CustomPage from 'mobile/CustomPage';
import './index.less';
import SvgIcon from 'src/components/SvgIcon';
import FixedPage from './FixedPage';
import PortalUserSet from 'src/pages/PageHeader/components/PortalUserSet/index.jsx';
import WorksheetUnNormal from 'mobile/RecordList/State';
import { isHaveCharge } from 'src/pages/worksheet/redux/actions/util';
import MoreAction from './MoreAction';
import _ from 'lodash';
const Item = List.Item;
let modal = null;

class App extends Component {
  constructor(props) {
    super(props);
    const { match, history } = props;
    const { hash } = history.location;
    const isHideTabBar = hash.includes('hideTabBar') || !!sessionStorage.getItem('hideTabBar');
    this.state = {
      isHideTabBar,
      selectedTab: match.params.worksheetId || 'more',
      expandGroupKeys: [],
      viewHideNavi: false,
    };
    if (isHideTabBar) {
      sessionStorage.setItem('hideTabBar', true);
    }
  }

  componentDidMount() {
    const { params } = this.props.match;
    this.props.dispatch(actions.getAppDetail(params.appId, this.detectionUrl));
    $('html').addClass('appListMobile');
    const { viewHideNavi } = _.get(this.props, 'appDetail.detail') || {};
    this.setState({ viewHideNavi });
  }

  componentWillReceiveProps(nextProps) {
    const nextWorksheetId = nextProps.match.params.worksheetId;
    const appNaviStyle = _.get(nextProps, 'appDetail.detail.appNaviStyle');
    if (nextWorksheetId !== this.props.match.params.worksheetId) {
      this.setState({
        selectedTab: nextWorksheetId ? nextWorksheetId : 'more',
      });
      if (appNaviStyle === 2 && nextWorksheetId) {
        safeLocalStorageSetItem('currentNavWorksheetId', nextWorksheetId);
      }
    }
    if (!_.isEqual(this.props.appDetail, nextProps.appDetail)) {
      const { appSection = [] } = _.get(nextProps, 'appDetail') || {};
      const { viewHideNavi } = _.get(nextProps, 'appDetail.detail') || {};
      this.setState({ expandGroupKeys: appSection.map(item => item.appSectionId), viewHideNavi });
    }
  }

  componentWillUnmount() {
    $('html').removeClass('appListMobile');
    sessionStorage.removeItem('detectionUrl');
    if (modal) {
      modal.close();
    } else {
      modal = null;
    }
    ActionSheet.close();
    this.setState({ appMoreActionVisible: false });
  }

  navigateTo(url) {
    url = (window.subPath || '') + url;

    if (window.isPublicApp && !new URL('http://z.z' + url).hash) {
      url = url + '#publicapp' + window.publicAppAuthorization;
    }
    this.props.history.push(url);
  }

  detectionUrl = ({ appRoleType, isLock, appNaviStyle, appSectionDetail }) => {
    const { params } = this.props.match;
    if (appNaviStyle === 2 && !params.worksheetId && !sessionStorage.getItem('detectionUrl')) {
      const isCharge = isHaveCharge(appRoleType, isLock);
      const { appSectionId } = appSectionDetail[0];
      const workSheetInfo = this.getWorksheetList(appSectionDetail);
      const { workSheetId } = isCharge
        ? workSheetInfo[0]
        : workSheetInfo.filter(o => o.status === 1 && !o.navigateHide)[0];
      window.mobileNavigateTo(`/mobile/app/${params.appId}/${appSectionId}/${workSheetId}`);
    }
  };

  handleOpenSheet = (data, item) => {
    const { params } = this.props.match;
    localStorage.removeItem('currentNavWorksheetId');
    if (item.type === 0) {
      const storage = localStorage.getItem(`mobileViewSheet-${item.workSheetId}`);
      let viewId = storage || '';
      this.navigateTo(
        `/mobile/recordList/${params.appId}/${data.appSectionId}/${item.workSheetId}${viewId ? `/${viewId}` : ''}`,
      );
    }
    if (item.type === 1) {
      this.navigateTo(`/mobile/customPage/${params.appId}/${data.appSectionId}/${item.workSheetId}`);
    }
  };

  handleSwitchSheet = (item, data) => {
    const { params } = this.props.match;
    const { appSectionId } = item;
    this.navigateTo(`/mobile/app/${params.appId}/${appSectionId}/${item.workSheetId}`);
    safeLocalStorageSetItem('currentNavWorksheetId', item.workSheetId);
  };

  renderList(data, level) {
    const { viewHideNavi } = this.state;
    const { appDetail } = this.props;
    const { detail } = appDetail;
    const { childSections = [], workSheetInfo = [] } = data;

    return workSheetInfo
      .filter(item => (viewHideNavi ? true : item.status !== 2))
      .map(item => {
        if (item.type !== 2) {
          return (
            <Item
              className={cx({ pLeft40: level === 'level2' })}
              multipleLine
              key={item.workSheetId}
              thumb={<SvgIcon url={item.iconUrl} fill={detail.iconColor} size={22} />}
              extra={item.status === 2 ? <Icon icon="public-folder-hidden" /> : null}
              onClick={e => {
                if (_.includes(e.target.classList, 'icon-public-folder-hidden')) {
                  return;
                }
                this.handleOpenSheet(data, item);
              }}
            >
              <span className="Font15 Gray LineHeight40">{item.workSheetName}</span>
            </Item>
          );
        }
        const groupItem = _.assign(item, _.find(childSections, v => v.appSectionId === item.workSheetId) || {});

        return (
          <Accordion defaultActiveKey={[]}>
            <Accordion.Panel header={this.renderHeader(groupItem, 'level2')} key={item.worksheetId}>
              {this.renderList(groupItem, 'level2')}
            </Accordion.Panel>
          </Accordion>
        );
      });
  }

  renderSudoku(data) {
    const { viewHideNavi } = this.state;
    const { appDetail } = this.props;
    const { detail } = appDetail;
    const { childSections = [], workSheetInfo = [] } = data;
    const otherData = workSheetInfo.filter(it => it.type !== 2) || [];

    let groupData = workSheetInfo
      .filter(item => item.type === 2)
      .map(item => ({ ..._.assign(item, _.find(childSections, v => v.appSectionId === item.workSheetId) || {}) }));

    groupData.push({
      workSheetId: 'other',
      name: _.isEmpty(groupData) ? '' : _l('其他'),
      type: 2,
      workSheetInfo: otherData,
    });

    return groupData
      .filter(item => (viewHideNavi ? true : item.status !== 2))
      .map(v => {
        if (v.workSheetId === 'other' && _.isEmpty(v.workSheetInfo)) return;
        return (
          <Fragment key={v.workSheetId}>
            {this.renderHeader(v, 'level2')}
            <Flex className="sudokuWrapper" wrap="wrap">
              {v.workSheetInfo
                .filter(v => (viewHideNavi ? true : v.status !== 2))
                .map(v => (
                  <div key={v.workSheetId} className="sudokuItemWrapper">
                    <div
                      className="sudokuItem flexColumn valignWrapper"
                      onClick={() => {
                        this.handleOpenSheet(data, v);
                      }}
                    >
                      {v.status === 2 && <Icon icon="public-folder-hidden" />}
                      <SvgIcon addClassName="mTop20" url={v.iconUrl} fill={detail.iconColor} size={30} />
                      <div className="name">{v.workSheetName}</div>
                    </div>
                  </div>
                ))}
            </Flex>
          </Fragment>
        );
      });
  }

  renderHeader(data, level) {
    const { appDetail } = this.props;
    const { appNaviStyle } = appDetail.detail;
    const { expandGroupKeys = [] } = this.state;
    if (level == 'level1') {
      return (
        <div className="accordionHeaderWrap appSectionHeader">
          <div className="Bold flex ellipsis">{data.name}</div>
          {_.includes(expandGroupKeys, data.appSectionId) ? (
            <Icon icon="minus" className="appSectionIcon" />
          ) : (
            <Icon icon="plus" className="appSectionIcon" />
          )}
        </div>
      );
    }
    if (appNaviStyle === 1) {
      return <div className={cx('Gray_75 Font14 pLeft15 ellipsis mTop8', { mBottom12: data.name })}>{data.name}</div>;
    }
    return (
      <div className="accordionHeaderWrap">
        <div className="flexRow mLeft5">
          <SvgIcon url={data.iconUrl} fill={data.iconColor} size={22} className="mRight12" />
          <div className="flex ellipsis Font15 Bold">{data.name}</div>
        </div>
        <Icon icon="expand_more" className="Gray_75" />
      </div>
    );
  }

  renderAppHeader() {
    const { isHideTabBar } = this.state;
    const { appDetail, match } = this.props;
    const { appName, detail, processCount } = appDetail;
    const { params } = match;
    const { fixed, permissionType, webMobileDisplay } = detail;
    const isAuthorityApp = permissionType >= ROLE_TYPES.ADMIN;
    if (md.global.Account.isPortal) {
      return (
        <PortalUserSet
          appId={params.appId}
          isMobile={true}
          name={appName}
          iconUrl={detail.iconUrl}
          iconColor={detail.iconColor}
        />
      );
    }
    if (detail.appNaviStyle === 2 && !((fixed && !isAuthorityApp) || webMobileDisplay)) {
      return (
        <div className="flexRow valignWrapper appNaviStyle2Header">
          <div
            className={cx('flex flexRow valignWrapper Gray_75 process Relative', { hide: window.isPublicApp })}
            onClick={() => {
              this.navigateTo(`/mobile/processMatters?appId=${params.appId}`);
            }}
          >
            <Icon className="Font17" icon="knowledge_file" />
            <div className="mLeft5 Font14">{_l('流程事项')}</div>
            {!!processCount && (
              <div className="flexRow valignWrapper processCount">{processCount > 99 ? '99+' : processCount}</div>
            )}
          </div>
          <div
            className={cx('flex flexRow valignWrapper Gray_75 ')}
            onClick={() => this.setState({ appMoreActionVisible: true })}
          >
            <Icon className="Font17" icon="more_horiz" />
            <div className="mLeft5 Font14">{_l('更多操作')}</div>
          </div>
        </div>
      );
    }
    return (
      <div className="appName flexColumn pLeft15 pRight20">
        <div className="content flex White flexRow valignWrapper">
          <div className="Font24 flex WordBreak overflow_ellipsis appNameTxt">
            <span className="Gray">{appName}</span>
          </div>
          {!webMobileDisplay && (
            <React.Fragment>
              <div className={cx('Relative flexRow valignWrapper', { hide: window.isPublicApp })}>
                <Icon
                  icon="knowledge_file"
                  className="Font26 Gray_bd"
                  onClick={() => {
                    this.navigateTo(`/mobile/processMatters?appId=${params.appId}`);
                  }}
                />
                {!!processCount && (
                  <div className="flexRow valignWrapper processCount">{processCount > 99 ? '99+' : processCount}</div>
                )}
              </div>
              <Icon
                icon="more_horiz"
                className="mLeft16 Font26 Gray_9e"
                onClick={() => this.setState({ appMoreActionVisible: true })}
              />
            </React.Fragment>
          )}
        </div>
      </div>
    );
  }

  renderSection(data, level) {
    const { appDetail } = this.props;
    const { appNaviStyle } = appDetail.detail;

    return (
      <Accordion.Panel header={this.renderHeader(data, level)} key={data.appSectionId}>
        {[0, 2].includes(appNaviStyle) && this.renderList(data, level)}
        {appNaviStyle === 1 && <div className="sudokuSectionWrap">{this.renderSudoku(data, level)}</div>}
      </Accordion.Panel>
    );
  }

  renderModal = () => {
    return (
      <Modal
        visible={!this.props.isQuitSuccess}
        transparent
        maskClosable={false}
        title={_l('无法退出通过部门加入的应用')}
        footer={[
          {
            text: _l('确认'),
            onPress: () => {
              this.props.dispatch({ type: 'MOBILE_QUIT_FAILED_CLOSE' });
            },
          },
        ]}
      >
        <div style={{ overflow: 'scroll' }}>{_l('您所在的部门被加入了此应用，只能由应用管理员进行操作')}</div>
      </Modal>
    );
  };

  renderGuide = () => {
    const { params } = this.props.match;
    return (
      <div className="guideWrapper">
        <div className="guide" />
        <img className="guideImg Absolute" src={guideImg} />
        <div className="text Absolute Font18 White bold">
          {_l('新应用仅您自己可见，请在“人员设置”将角色分配给协作者，再开始使用。')}
        </div>
        <div
          className="ok Absolute Font18 White bold"
          onClick={() => {
            this.navigateTo(`/mobile/app/${params.appId}`);
          }}
        >
          {_l('知晓了')}
        </div>
      </div>
    );
  };

  renderContent() {
    const { appDetail, match } = this.props;
    let { appName, detail, appSection, status } = appDetail;
    const { fixed, webMobileDisplay, fixAccount, fixRemark, permissionType } = detail;
    const isAuthorityApp = permissionType >= ROLE_TYPES.ADMIN;
    appSection = isAuthorityApp
      ? appSection
      : appSection
          .map(item => {
            return {
              ...item,
              workSheetInfo: item.workSheetInfo.filter(o => o.status === 1 && !o.navigateHide),
            };
          })
          .filter(o => o.workSheetInfo && o.workSheetInfo.length > 0);
    const { isHideTabBar, appMoreActionVisible, viewHideNavi } = this.state;
    const { params } = match;

    const isEmptyAppSection = appSection.length === 1 && !appSection[0].name;
    if (!detail || detail.length <= 0) {
      return <AppPermissionsInfo appStatus={2} appId={params.appId} />;
    } else if (status === 4) {
      return <AppPermissionsInfo appStatus={4} appId={params.appId} />;
    } else {
      return (
        <Fragment>
          {appName && <DocumentTitle title={appName} />}
          {params.isNewApp && this.renderGuide()}
          <div
            className="flexColumn h100"
            style={(fixed && permissionType !== ROLE_TYPES.ADMIN) || webMobileDisplay ? { background: '#fff' } : {}}
          >
            {this.renderAppHeader()}
            {(fixed && !isAuthorityApp) || webMobileDisplay ? (
              <FixedPage fixAccount={fixAccount} fixRemark={fixRemark} isNoPublish={webMobileDisplay} />
            ) : (
              <div className="appSectionCon flex">
                {status === 5 ||
                (detail.permissionType === ROLE_TYPES.MEMBER &&
                  appSection.length <= 1 &&
                  (appSection.length <= 0 || appSection[0].workSheetInfo.length <= 0)) ? (
                  // 应用无权限||成员身份 且 无任何数据
                  <AppPermissionsInfo appStatus={5} appId={params.appId} />
                ) : appSection.length <= 1 &&
                  (appSection.length <= 0 || appSection[0].workSheetInfo.length <= 0) &&
                  [ROLE_TYPES.OWNER, ROLE_TYPES.ADMIN].includes(detail.permissionType) ? (
                  // 管理员身份 且 无任何数据
                  <AppPermissionsInfo appStatus={1} appId={params.appId} />
                ) : (
                  <Fragment>
                    <Accordion
                      className={cx({ emptyAppSection: isEmptyAppSection })}
                      defaultActiveKey={appSection.map(item => item.appSectionId)}
                      onChange={key => {
                        this.setState({ expandGroupKeys: key });
                      }}
                    >
                      {appSection.map(item => this.renderSection(item, 'level1'))}
                    </Accordion>
                  </Fragment>
                )}
              </div>
            )}
          </div>
          {((!isHideTabBar &&
            !window.isPublicApp &&
            !md.global.Account.isPortal &&
            detail.appNaviStyle !== 2 &&
            !fixed) ||
            (fixed && isAuthorityApp)) && (
            <Back
              style={{ bottom: detail.appNaviStyle == 2 && location.href.includes('mobile/app') ? '78px' : '20px' }}
              className="low"
              onClick={() => {
                let currentGroupInfo =
                  localStorage.getItem('currentGroupInfo') && JSON.parse(localStorage.getItem('currentGroupInfo'));
                if (_.isEmpty(currentGroupInfo)) {
                  this.navigateTo('/mobile/appHome');
                } else {
                  history.back();
                }
              }}
            />
          )}
          {!this.props.isQuitSuccess && this.renderModal()}
          {appMoreActionVisible && (
            <MoreAction
              visible={appMoreActionVisible}
              detail={detail}
              viewHideNavi={viewHideNavi}
              onClose={() => this.setState({ appMoreActionVisible: false })}
              dealMarked={isMarked => {
                this.props.dispatch(actions.updateAppMark(params.appId, detail.projectId, isMarked));
                this.setState({ appMoreActionVisible: false });
              }}
              dealViewHideNavi={val => {
                this.props.dispatch(
                  actions.editAppInfo(val, () => {
                    this.setState({ viewHideNavi: val });
                  }),
                );
              }}
            />
          )}
        </Fragment>
      );
    }
  }

  renderRecordList(data) {
    if (!data) {
      return <WorksheetUnNormal type="sheet" />; //应用项无权限或者已删除
    }
    const { type } = data;
    const { detail = {}, appSection } = this.props.appDetail;
    const { appNaviStyle } = detail;
    if (type === 0) {
      return <RecordList now={Date.now()} />;
    }
    if (type === 1) {
      return (
        <div className="flex">
          <CustomPage
            pageTitle={data.workSheetName}
            now={Date.now()}
            appNaviStyle={appNaviStyle}
            appSection={appSection}
          />
        </div>
      );
    }
  }

  getWorksheetList = (appSection = []) => {
    let worksheetList = _.flatten(
      appSection.map(item => {
        let childData = [];
        item.workSheetInfo.forEach(sheet => {
          sheet.appSectionId = item.appSectionId;
          if (sheet.type === 2) {
            let temp = (_.find(item.childSections, v => v.appSectionId === sheet.workSheetId) || {}).workSheetInfo;
            (temp || []).forEach(it => {
              childData.push(it);
            });
          }
          childData.push(sheet);
        });
        return childData;
      }),
    );
    return worksheetList;
  };

  renderBody() {
    const { appSection = {}, detail } = this.props.appDetail;
    const { fixed, permissionType, webMobileDisplay } = detail;
    const isAuthorityApp = permissionType >= ROLE_TYPES.ADMIN;
    const { batchOptVisible } = this.props;

    if ([0, 1].includes(detail.appNaviStyle) || (fixed && !isAuthorityApp) || webMobileDisplay) {
      return this.renderContent();
    }

    const { selectedTab, isHideTabBar, appMoreActionVisible } = this.state;

    const sheetList = this.getWorksheetList(appSection)
      .filter(v => v.type !== 2)
      .filter(item => (isAuthorityApp ? true : item.status === 1 && !item.navigateHide)) //左侧列表状态为1 且 角色权限没有设置隐藏
      .slice(0, 4);

    const data = _.find(sheetList, { workSheetId: selectedTab });
    const isHideNav = detail.permissionType < ROLE_TYPES.ADMIN && sheetList.length === 1 && !!data;
    return (
      <div className="flexColumn h100">
        <div className={cx('flex overflowHidden flexColumn', { recordListWrapper: !isHideNav })}>
          {/* 外部门户显示头部导航 */}
          {selectedTab !== 'more' && md.global.Account.isPortal && this.renderAppHeader()}
          {selectedTab === 'more' ? this.renderContent() : this.renderRecordList(data)}
        </div>
        {sheetList.length > 0 && !batchOptVisible && (
          <TabBar
            unselectedTintColor="#949494"
            tintColor={detail.iconColor}
            barTintColor="white"
            hidden={isHideNav}
            noRenderContent={true}
          >
            {sheetList.map((item, index) => (
              <TabBar.Item
                title={item.workSheetName}
                key={item.workSheetId}
                icon={<SvgIcon url={item.iconUrl} fill="#757575" size={20} />}
                selectedIcon={<SvgIcon url={item.iconUrl} fill={detail.iconColor} size={20} />}
                selected={selectedTab === item.workSheetId}
                onPress={() => {
                  this.handleSwitchSheet(item, data);
                }}
              />
            ))}
            <TabBar.Item
              title={_l('更多')}
              key="more"
              icon={<Icon className="Font20" icon="menu" />}
              selectedIcon={<Icon className="Font20" icon="menu" />}
              selected={selectedTab === 'more'}
              onPress={() => {
                const { params } = this.props.match;
                this.navigateTo(`/mobile/app/${params.appId}`);
                sessionStorage.setItem('detectionUrl', 1);
              }}
            />
          </TabBar>
        )}
      </div>
    );
  }

  render() {
    const { isAppLoading, appDetail } = this.props;

    if (isAppLoading) {
      return (
        <Flex justify="center" align="center" className="h100">
          <ActivityIndicator size="large" />
        </Flex>
      );
    }

    const { detail } = appDetail;

    return <WaterMark projectId={detail.projectId}>{this.renderBody()}</WaterMark>;
  }
}

export default connect(state => {
  const { appDetail, isAppLoading, isQuitSuccess, batchOptVisible } = state.mobile;
  // status: null, // 0: 加载中 1:正常 2:关闭 3:删除 4:不是应用成员 5:是应用成员但未分配视图
  return {
    appDetail,
    isAppLoading,
    isQuitSuccess,
    batchOptVisible,
  };
})(App);
