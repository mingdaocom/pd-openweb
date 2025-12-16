import React, { createRef, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _, { get } from 'lodash';
import moment from 'moment';
import { Icon, PullToRefreshWrapper, SvgIcon, WaterMark } from 'ming-ui';
import webCache from 'src/api/webCache';
import MobileChart from 'mobile/CustomPage/ChartContent';
import { RecordInfoModal } from 'mobile/Record';
import { loadSDK } from 'src/components/Form/core/utils';
import TextScanQRCode from 'src/components/Form/MobileForm/components/TextScanQRCode';
import BulletinBoard from 'src/pages/AppHomepage/Dashboard/BulletinBoard';
import { MODULE_TYPES } from 'src/pages/AppHomepage/Dashboard/utils';
import RegExpValidator from 'src/utils/expression';
import { addBehaviorLog, getCurrentProject, handlePushState, handleReplaceState } from 'src/utils/project';
import * as appActions from '../App/redux/actions';
import SelectProject from '../components/SelectProject';
import TabBar from '../components/TabBar';
import AppGroupSkeleton from './components/AppGroupSkeleton';
import ApplicationList from './components/ApplicationBox';
import ApplicationItem from './components/ApplicationItem';
import EmptyStatus from './components/EmptyStatus';
import Process from './components/Process';
import arrowLeftImg from './img/arrowLeft.png';
import arrowRightImg from './img/arrowRight.png';
import * as actions from './redux/actions';
import './index.less';

class AppHome extends React.Component {
  constructor(props) {
    super(props);

    // 处理底部导航缓存内容过多localStorage溢出问题
    Object.keys(localStorage).forEach(key => {
      if (key.indexOf('currentNavWorksheetInfo') > -1) {
        localStorage.removeItem(key);
      }
    });

    this.state = {
      width: document.documentElement.clientWidth,
      guideStep: 0,
      recentType: 'app',
    };
    this.contentRef = createRef();
    this.handleScroll = _.debounce(this.handleScroll.bind(this), 300);
    this.isSetScrollTop = false;
  }
  componentDidMount() {
    const maturityTime = moment(md.global.Account.createTime).add(7, 'day').format('YYYY-MM-DD');
    const isAdmin = md.global.Account.projects[0]
      ? md.global.Account.projects[0].createAccountId === md.global.Account.accountId
      : false;
    const isMaturity = moment().isBefore(maturityTime);
    $('html').addClass('appHomeMobile');
    this.getProject();
    if (window.isWxWork && isAdmin && isMaturity) {
      this.getWebCache();
    }
    window.addEventListener('popstate', this.closePage);
    loadSDK();
    window.addEventListener('popstate', this.onQueryChange);

    // 清除工作表滚动条高度
    this.props.updateAppScrollY(0);
  }
  componentWillUnmount() {
    $('html').removeClass('appHomeMobile');
    // 异步延迟执行，确保 popstate 优先执行
    setTimeout(() => {
      window.removeEventListener('popstate', this.closePage);
    }, 0);
    window.removeEventListener('popstate', this.onQueryChange);
  }

  componentDidUpdate() {
    const { isHomeLoading, appHomeScrollY } = this.props;

    if (
      !this.isSetScrollTop &&
      !isHomeLoading > 0 &&
      appHomeScrollY > 0 &&
      this.contentRef &&
      this.contentRef.current
    ) {
      this.contentRef.current.scrollTop = appHomeScrollY;
      this.isSetScrollTop = true;
    }
  }

  handleScroll = e => {
    this.props.updateAppHomeScrollY(e.target.scrollTop);
  };

  onQueryChange = () => {
    handleReplaceState('page', 'collectRecord', () => this.setState({ collectRecord: {} }));
  };

  getProject = (isPullRefresh = false) => {
    const projectObj = getCurrentProject(
      localStorage.getItem('currentProjectId') || (md.global.Account.projects[0] || {}).projectId,
    );
    const currentProject = !_.isEmpty(projectObj) ? projectObj : { projectId: 'external', companyName: _l('外部协作') };
    const projectId = currentProject ? currentProject.projectId : null;
    if (projectId === 'external') {
      this.props.getMyApp(isPullRefresh);
      this.props.clearAllCollectCharts();
      return;
    }
    this.props.myPlatform(projectId, isPullRefresh);
    this.props.getHomePlatformSetting(projectId);
    this.props.getAllFavorites(projectId);
    this.props.getAllCollectCharts(projectId);
  };
  closePage = () => {
    window.close();
  };
  getWebCache = () => {
    webCache
      .get({
        key: 'workwxFirstEnter',
      })
      .then(res => {
        if (!get(res, 'data')) {
          this.setState({ guideStep: 1 });
        }
      });
  };
  addWebCache = () => {
    webCache
      .add(
        {
          key: 'workwxFirstEnter',
          value: 'true',
        },
        {
          silent: true,
        },
      )
      .then(() => {});
  };
  filterSearchResult = (apps = [], keyWords) => {
    return apps.filter(
      app =>
        [app.enName, app.name].filter(_.identity).join('').toLowerCase().indexOf(keyWords.trim().toLowerCase()) > -1,
    );
  };

  renderSearchApp = () => {
    let { searchValue } = this.state;
    const { myPlatformData = {} } = this.props;
    const { apps = [], externalApps = [], aloneApps = [] } = myPlatformData;

    return (
      <div className="flexRow">
        <div className="appSearchWrapper flex">
          <Icon icon="h5_search" className="Font16 mRight8 searchIcon" />
          <form
            action="#"
            className="flex"
            onSubmit={e => {
              e.preventDefault();
            }}
          >
            <input
              type="search"
              className="pAll0 Border0 w100 Font14"
              placeholder={_l('搜索应用')}
              value={searchValue}
              onChange={e => {
                const { value } = e.target;
                let searchResult = [
                  ...this.filterSearchResult(apps, value),
                  ...this.filterSearchResult(externalApps, value),
                  ...this.filterSearchResult(aloneApps, value),
                ];
                this.setState({ searchValue: value, searchResult });
              }}
            />
          </form>
          {searchValue && (
            <Icon
              className="Gray_bd mLeft8"
              icon="workflow_cancel"
              onClick={() => {
                this.setState({ searchValue: '', searchResult: [] });
              }}
            />
          )}
        </div>
        <div className="textScanQRCodeWrap">
          <TextScanQRCode
            projectId={localStorage.getItem('currentProjectId') || (md.global.Account.projects[0] || {}).projectId}
            onChange={value => {
              if (RegExpValidator.isURL(value)) {
                if (window.isIphone) {
                  location.href = value;
                } else {
                  window.open(value);
                }
                return;
              }
              let searchResult = [
                ...this.filterSearchResult(apps, value),
                ...this.filterSearchResult(externalApps, value),
                ...this.filterSearchResult(aloneApps, value),
              ];
              this.setState({ searchValue: value, searchResult });
            }}
          />
        </div>
      </div>
    );
  };
  renderSearchResult = () => {
    const { myPlatformLang } = this.props;
    const { searchResult = [] } = this.state;
    if (_.isEmpty(searchResult)) {
      return (
        <div className="flexColumn emptyWrap flex alignItemsCenter justifyContentCenter Gray_9e">
          <Icon icon="h5_search" className="Font50" />
          <div className="Gray_bd Font17 Bold">{_l('没有搜索结果')}</div>
        </div>
      );
    }
    return (
      <div className="h100" style={{ overflow: 'auto' }}>
        <div className="appCon flexRow alignItemsCenter">
          {_.map(searchResult, item => {
            return <ApplicationItem data={item} myPlatformLang={myPlatformLang} />;
          })}
        </div>
      </div>
    );
  };

  renderGuide() {
    const { guideStep } = this.state;
    if (guideStep == 1) {
      return (
        <div className="guideWrapper">
          <div className="guide guide1" />
          <img className="guideImg Absolute" src={arrowLeftImg} />
          <div className="text Absolute Font18 White bold">
            {_l('感谢你尝试安装！我们精心挑选了两个初始应用，供您体验。')}
          </div>
          <div
            className="ok Absolute Font18 White bold"
            onClick={() => {
              this.addWebCache();
              this.setState({ guideStep: 2 });
            }}
          >
            {_l('知晓了')}
          </div>
        </div>
      );
    } else {
      return (
        <div className="guideWrapper">
          <div className="guide guide2" />
          <img className="guide2Img Absolute" src={arrowRightImg} />
          <div className="text2 Absolute Font18 White bold">{_l('您也可从模板库添加一个应用')}</div>
          <div
            className="ok2 Absolute Font18 White bold"
            onClick={() => {
              this.setState({ guideStep: 0 });
            }}
          >
            {_l('知晓了')}
          </div>
        </div>
      );
    }
  }

  // 应用收藏/最近使用/记录收藏 title
  renderTitle = ({ type = 'collectAppList', wrapTitle, icon, showMore, moreText, iconClass }) => {
    const projectObj = getCurrentProject(
      localStorage.getItem('currentProjectId') || (md.global.Account.projects[0] || {}).projectId,
    );

    return (
      <div className="groupHeader mBottom16">
        <div className="title flex ellipsis">{wrapTitle}</div>
        {showMore && (
          <div
            className="expand Hand flexRow alignItemsCenter"
            onClick={() => {
              switch (type) {
                case 'recentList':
                  this.setState({ recentType: this.state.recentType === 'app' ? 'appItem' : 'app' });
                  break;
                case 'collectAppList':
                  window.mobileNavigateTo(`/mobile/appfav/${projectObj.projectId}`);
                  break;
                case 'chartCollect':
                  window.mobileNavigateTo(`/mobile/chartsfav/${projectObj.projectId}`);
                  break;
                case 'recordCollectList':
                  window.mobileNavigateTo(`/mobile/recordfav/${projectObj.projectId}`);
                  break;
                default:
              }
            }}
          >
            <span className="Gray_75 mRight2 Font15 bold500 TxtMiddle">{moreText}</span>
            <Icon icon={icon} className={`Gray_9e Font18 bold500 ${iconClass}`} />
          </div>
        )}
      </div>
    );
  };

  // 应用收藏
  renderCollectAppList = () => {
    const { myPlatformData, myPlatformLang } = this.props;
    let { markedAppItems = [] } = myPlatformData;
    markedAppItems = markedAppItems.filter(o => o && !o.webMobileDisplay);
    if (_.isEmpty(markedAppItems)) return;

    return (
      <Fragment>
        {this.renderTitle({
          type: 'collectAppList',
          wrapTitle: _l('应用收藏'),
          icon: 'navigate_next',
          moreText: _l('更多'),
          showMore: markedAppItems.length > 6,
        })}
        <div className="groupCon">
          {markedAppItems.slice(0, 6).map((item, index) => {
            return (
              <ApplicationItem
                className="collectAppList"
                direction="horizontal"
                index={index}
                radius={40}
                iconSize={26}
                data={item}
                myPlatformLang={myPlatformLang}
              />
            );
          })}
        </div>
        <div className="spaceBottom"></div>
      </Fragment>
    );
  };

  // 最近使用
  renderRecent = () => {
    const { myPlatformData, myPlatformLang } = this.props;
    const { recentType } = this.state;
    const { recentAppIds = [], recentAppItems, apps } = myPlatformData;
    const recentApps = recentAppIds
      .slice(0, 6)
      .map(item => _.filter(apps, it => item === it.id)[0])
      .filter(_.identity);

    if (_.isEmpty(recentAppIds) && _.isEmpty(recentAppItems)) return;
    let list = recentType === 'app' ? recentApps.filter(o => o && !o.webMobileDisplay) : recentAppItems;
    list = _.isEmpty(list)
      ? list
      : list.concat([{ id: 'empty' }, { id: 'empty' }, { id: 'empty' }, { id: 'empty' }, { id: 'empty' }]);

    return (
      <Fragment>
        {this.renderTitle({
          type: 'recentList',
          wrapTitle: _l('最近使用'),
          icon: 'unfold_more',
          moreText: recentType === 'app' ? _l('应用') : _l('应用项'),
          showMore: true,
          iconClass: 'recentIcon',
        })}
        <div className="groupCon">
          {_.isEmpty(list) ? (
            <EmptyStatus emptyType="recent" emptyTxt={_l('没有最近使用')} />
          ) : (
            list.slice(0, 6).map((item, index) => {
              return (
                <ApplicationItem
                  className={cx('recentList', { empty: item.id === 'empty' })}
                  direction="horizontal"
                  index={index}
                  radius={40}
                  iconSize={26}
                  data={item}
                  myPlatformLang={myPlatformLang}
                />
              );
            })
          )}
        </div>
        <div className="spaceBottom"></div>
      </Fragment>
    );
  };

  // 记录收藏
  renderCollectRecords = () => {
    const { collectRecord = {} } = this.state;
    const { collectRecords = [] } = this.props;
    if (_.isEmpty(collectRecords)) return;

    const projectObj = getCurrentProject(
      localStorage.getItem('currentProjectId') || (md.global.Account.projects[0] || {}).projectId,
    );

    return (
      <Fragment>
        {this.renderTitle({
          type: 'recordCollectList',
          wrapTitle: _l('记录收藏'),
          icon: 'navigate_next',
          moreText: _l('更多'),
          showMore: collectRecords.length > 5,
        })}
        <div className="pLeft16 pRight10 pBottom4">
          {collectRecords.slice(0, 5).map(item => {
            const { favoriteId, title, appIcon, appColor, appIconUrl, worksheetId, rowId } = item;
            return (
              <div
                key={favoriteId}
                className="flexRow mBottom14 alignItemsCenter"
                onClick={() => {
                  handlePushState('page', 'collectRecord');
                  addBehaviorLog('worksheetRecord', worksheetId, { rowId });
                  this.setState({ collectRecord: item });
                }}
              >
                <div className="recordIconWrap mRight10" style={{ backgroundColor: appColor }}>
                  {appIconUrl ? (
                    <SvgIcon url={appIconUrl} fill="#fff" size={14} addClassName="mTop5" />
                  ) : (
                    <Icon icon={appIcon} className="Font18" />
                  )}
                </div>
                <div className="flex Font14 ellipsis">{title}</div>
              </div>
            );
          })}
        </div>
        <div className="spaceBottom"></div>

        {!!collectRecord.rowId && (
          <RecordInfoModal
            className="full"
            visible={!!collectRecord.rowId}
            appId={collectRecord.appId}
            worksheetId={collectRecord.worksheetId}
            viewId={collectRecord.viewId}
            rowId={collectRecord.rowId}
            onClose={() => this.setState({ collectRecord: {} })}
            refreshCollectRecordList={() => this.props.getAllFavorites(projectObj.projectId)}
          />
        )}
      </Fragment>
    );
  };

  // 图表收藏
  renderCollectCharts = () => {
    const { collectCharts } = this.props;
    if (_.isEmpty(collectCharts)) return;

    return (
      <Fragment>
        {this.renderTitle({
          type: 'chartCollect',
          wrapTitle: _l('图表收藏'),
          icon: 'navigate_next',
          moreText: _l('更多'),
          showMore: collectCharts.length > 3,
        })}
        <div className="pLeft16 pRight16">
          {collectCharts.slice(0, 3).map((item, index) => {
            const isLast = index === collectCharts.slice(0, 3).length - 1;

            return (
              <div
                className={cx('chartItemWrap flexColumn', { pTop0: index === 0, Border0: isLast })}
                key={item.favoriteId}
              >
                <MobileChart
                  isHorizontal={false}
                  reportId={item.reportId}
                  pageId={item.pageId}
                  viewId={item.viewId}
                  filters={[]}
                />
              </div>
            );
          })}
        </div>
        <div className="spaceBottom"></div>
      </Fragment>
    );
  };

  renderContent = () => {
    const {
      isHomeLoading,
      platformSetting = {},
      myPlatformData = {},
      myPlatformLang,
      projectGroupsNameLang = [],
    } = this.props;
    const { homeSetting = {} } = myPlatformData;
    const {
      displayCommonApp,
      displayMark,
      rowCollect,
      todoDisplay,
      reportAutoRefreshTimer,
      displayApp,
      sortItems = [],
    } = homeSetting;
    const { boardSwitch } = platformSetting;
    const projectObj = getCurrentProject(
      localStorage.getItem('currentProjectId') || (md.global.Account.projects[0] || {}).projectId,
    );
    const currentProject = !_.isEmpty(projectObj) ? projectObj : { projectId: 'external', companyName: _l('外部协作') };
    const isExternal = currentProject.projectId === 'external';
    let sortModuleTypes = sortItems.map(item => item.moduleType);
    sortModuleTypes = _.isEmpty(sortModuleTypes) ? [0, 1, 2, 3] : sortModuleTypes;

    if (isHomeLoading) {
      return <AppGroupSkeleton />;
    }

    return (
      <div ref={this.contentRef} className="content flexColumn" onScroll={this.handleScroll}>
        <PullToRefreshWrapper onRefresh={() => this.getProject(true)}>
          {!boardSwitch && <div className="spaceBottom"></div>}
          {/* 宣传栏 */}
          {boardSwitch && !isExternal ? (
            <Fragment>
              <BulletinBoard loading={false} platformSetting={platformSetting} height={150} />
              <div className="spaceBottom"></div>
            </Fragment>
          ) : (
            ''
          )}

          {/* 流程待办 */}
          <Process todoDisplay={todoDisplay} projectId={currentProject.projectId} />
          <div className="spaceBottom"></div>

          <Fragment>
            {sortModuleTypes.map(moduleType => {
              switch (moduleType) {
                case MODULE_TYPES.APP_COLLECTION:
                  // 应用收藏
                  return displayMark && !isExternal ? this.renderCollectAppList() : '';
                case MODULE_TYPES.RECENT:
                  // 最近使用
                  return displayCommonApp && !isExternal ? this.renderRecent() : '';
                case MODULE_TYPES.ROW_COLLECTION:
                  // 记录收藏
                  return rowCollect && !isExternal ? this.renderCollectRecords() : '';
                case MODULE_TYPES.CHART_COLLECTION:
                  // 图表收藏
                  return this.renderCollectCharts(currentProject.projectId, reportAutoRefreshTimer);
                default:
                  return null;
              }
            })}
          </Fragment>

          {/* 应用 */}
          {(displayApp || isExternal) && (
            <ApplicationList
              myAppData={myPlatformData}
              myPlatformLang={myPlatformLang}
              projectId={currentProject.projectId}
              projectGroupsNameLang={projectGroupsNameLang}
            />
          )}
        </PullToRefreshWrapper>
      </div>
    );
  };

  render() {
    const { guideStep, searchValue } = this.state;

    const projectObj = getCurrentProject(
      localStorage.getItem('currentProjectId') ||
        (md.global.Account.projects[0] || { projectId: 'external', companyName: _l('外部协作') }).projectId,
    );

    return (
      <WaterMark projectId={projectObj.projectId}>
        <div className="listConBox h100">
          <SelectProject changeProject={this.getProject} />
          {this.renderSearchApp()}
          {!searchValue && this.renderContent()}
          {searchValue && this.renderSearchResult()}
          <TabBar action="appHome" />
        </div>
        {guideStep ? this.renderGuide() : null}
      </WaterMark>
    );
  }
}

export default connect(
  state => {
    const {
      isHomeLoading,
      collectRecords,
      platformSetting,
      myPlatformData,
      myPlatformLang,
      collectCharts,
      projectGroupsNameLang,
      appHomeScrollY,
    } = state.mobile;
    return {
      isHomeLoading,
      collectRecords,
      platformSetting,
      myPlatformData,
      myPlatformLang,
      collectCharts,
      projectGroupsNameLang,
      appHomeScrollY,
    };
  },
  dispatch =>
    bindActionCreators(
      {
        ..._.pick(actions, [
          'markedGroup',
          'getAllFavorites',
          'getHomePlatformSetting',
          'myPlatform',
          'getMyApp',
          'getAllCollectCharts',
          'clearAllCollectCharts',
          'updateAppHomeScrollY',
        ]),
        ..._.pick(appActions, ['updateAppScrollY']),
      },
      dispatch,
    ),
)(AppHome);
