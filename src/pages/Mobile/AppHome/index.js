import React, { Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { Flex, ActionSheet, Modal } from 'antd-mobile';
import { Icon, WaterMark } from 'ming-ui';
import cx from 'classnames';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import webCache from 'src/api/webCache';
import TabBar from '../components/TabBar';
import SelectProject from '../components/SelectProject';
import BulletinBoard from 'src/pages/AppHomepage/Dashboard/BulletinBoard';
import Process from './components/Process';
import ApplicationItem from './components/ApplicationItem';
import ApplicationList from './components/ApplicationBox';
import EmptyStatus from './components/EmptyStatus';
import { RecordInfoModal } from 'mobile/Record';
import arrowRightImg from './img/arrowRight.png';
import arrowLeftImg from './img/arrowLeft.png';
import './index.less';
import SvgIcon from 'src/components/SvgIcon';
import AppGroupSkeleton from './components/AppGroupSkeleton';
import { getCurrentProject, addBehaviorLog } from 'src/util';
import TextScanQRCode from 'src/components/newCustomFields/components/TextScanQRCode';
import { loadSDK } from 'src/components/newCustomFields/tools/utils';
import RegExp from 'src/util/expression';
import _ from 'lodash';
import moment from 'moment';

const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');

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
  }
  componentDidMount() {
    const maturityTime = moment(md.global.Account.createTime).add(7, 'day').format('YYYY-MM-DD');
    const isAdmin = md.global.Account.projects[0]
      ? md.global.Account.projects[0].createAccountId === md.global.Account.accountId
      : false;
    const isMaturity = moment().isBefore(maturityTime);
    $('html').addClass('appHomeMobile');
    this.getProject();
    if (isWxWork && isAdmin && isMaturity) {
      this.getWebCache();
    }
    window.addEventListener('popstate', this.closePage);
    loadSDK();
  }
  componentWillUnmount() {
    $('html').removeClass('appHomeMobile');
    ActionSheet.close();
    // 异步延迟执行，确保 popstate 优先执行
    setTimeout(() => {
      window.removeEventListener('popstate', this.closePage);
    }, 0);
  }

  getProject = () => {
    const projectObj = getCurrentProject(
      localStorage.getItem('currentProjectId') || (md.global.Account.projects[0] || {}).projectId,
    );
    const currentProject = !_.isEmpty(projectObj) ? projectObj : { projectId: 'external', companyName: _l('外部协作') };
    const projectId = currentProject ? currentProject.projectId : null;
    if (projectId === 'external') {
      this.props.getMyApp();
      return;
    }
    this.props.myPlatform(projectId);
    this.props.getHomePlatformSetting(projectId);
    this.props.getAllFavorites(projectId);
  };
  closePage = () => {
    window.close();
  };
  getWebCache = () => {
    webCache
      .get({
        key: 'workwxFirstEnter',
      })
      .then(result => {
        if (!result) {
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
      .then(result => {});
  };

  showActionSheet = () => {
    const { hideTemplateLibrary } = md.global.SysSettings;
    const BUTTONS = [
      hideTemplateLibrary ? null : { name: _l('从模板库添加'), icon: 'application_library', iconClass: 'Font18' },
      { name: _l('自定义创建'), icon: 'add1', iconClass: 'Font18' },
    ].filter(item => item);
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
        if (hideTemplateLibrary) {
          buttonIndex = buttonIndex + 1;
        }
        if (buttonIndex === 0) {
          window.mobileNavigateTo(`/mobile/appBox`);
        }
        if (buttonIndex === 1) {
          const title = isWxWork ? _l('创建自定义应用请前往企业微信PC桌面端') : _l('创建自定义应用请前往PC端');
          Modal.alert(title, null, [{ text: _l('我知道了'), onPress: () => {} }]);
        }
      },
    );
  };
  filterSearchResult = (apps = [], keyWords) => {
    return apps.filter(
      item =>
        new RegExp((keyWords || '').trim().toUpperCase()).test(item.name) ||
        new RegExp((keyWords || '').trim().toUpperCase()).test((item.enName || '').toUpperCase()),
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
              if (RegExp.isURL(value)) {
                if (/iphone/gi.test(window.navigator.userAgent)) {
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
        <Flex align="center" wrap="wrap" className="appCon">
          {_.map(searchResult, (item, i) => {
            return <ApplicationItem data={item} />;
          })}
        </Flex>
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
              if (type === 'recentList') {
                this.setState({ recentType: this.state.recentType === 'app' ? 'appItem' : 'app' });
              } else if (type === 'collectAppList') {
                window.mobileNavigateTo(`/mobile/appfav/${projectObj.projectId}`);
              } else {
                window.mobileNavigateTo(`/mobile/recordfav/${projectObj.projectId}`);
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
    const { myPlatformData } = this.props;
    const { markedAppItems = [] } = myPlatformData;

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
    const { myPlatformData } = this.props;
    const { recentType } = this.state;
    const { recentAppIds = [], recentAppItems, apps } = myPlatformData;
    const recentApps = recentAppIds
      .slice(0, 6)
      .map(item => _.filter(apps, it => item === it.id)[0])
      .filter(_.identity);

    if (_.isEmpty(recentAppIds) && _.isEmpty(recentAppItems)) return;
    const list = recentType === 'app' ? recentApps : recentAppItems;

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
        <div className="groupCon" style={{ height: 210 }}>
          {_.isEmpty(list) ? (
            <EmptyStatus emptyType="recent" emptyTxt={_l('没有最近使用')} />
          ) : (
            list.slice(0, 6).map((item, index) => {
              return (
                <ApplicationItem
                  className="recentList"
                  direction="horizontal"
                  index={index}
                  radius={40}
                  iconSize={26}
                  data={item}
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
                <div className="flex Font15 ellipsis">{title}</div>
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

  renderContent = () => {
    const { isHomeLoading, platformSetting = {}, myPlatformData = {} } = this.props;
    const { homeSetting = {} } = myPlatformData;
    const { displayCommonApp, displayMark, rowCollect, todoDisplay } = homeSetting;
    const { boardSwitch } = platformSetting;
    const projectObj = getCurrentProject(
      localStorage.getItem('currentProjectId') || (md.global.Account.projects[0] || {}).projectId,
    );
    const currentProject = !_.isEmpty(projectObj) ? projectObj : { projectId: 'external', companyName: _l('外部协作') };
    const isExternal = currentProject.projectId === 'external';

    if (isHomeLoading) {
      return <AppGroupSkeleton />;
    }

    return (
      <div className="content flexColumn">
        {!boardSwitch && <div className="spaceBottom"></div>}
        {/* 宣传栏 */}
        {boardSwitch && !isExternal ? (
          <Fragment>
            <BulletinBoard loading={false} platformSetting={platformSetting} height={200} />
            <div className="spaceBottom"></div>
          </Fragment>
        ) : (
          ''
        )}

        {/* 流程待办 */}
        <Process todoDisplay={todoDisplay} projectId={currentProject.projectId} />
        <div className="spaceBottom"></div>

        {/* 应用收藏 */}
        {displayMark && !isExternal ? this.renderCollectAppList() : ''}

        {/* 最近使用 */}
        {displayCommonApp && !isExternal ? this.renderRecent() : ''}

        {/* 记录收藏 */}
        {rowCollect && !isExternal ? this.renderCollectRecords() : ''}

        {/* 应用 */}
        <ApplicationList myAppData={myPlatformData} projectId={currentProject.projectId} />
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
    const { isHomeLoading, collectRecords, platformSetting, myPlatformData } = state.mobile;
    return {
      isHomeLoading,
      collectRecords,
      platformSetting,
      myPlatformData,
    };
  },
  dispatch =>
    bindActionCreators(
      {
        ..._.pick(actions, ['markedGroup', 'getAllFavorites', 'getHomePlatformSetting', 'myPlatform', 'getMyApp']),
      },
      dispatch,
    ),
)(AppHome);
