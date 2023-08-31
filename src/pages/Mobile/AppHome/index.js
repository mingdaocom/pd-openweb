import React, { Fragment } from 'react';
import { Flex, ActionSheet, Modal } from 'antd-mobile';
import { Icon, Button } from 'ming-ui';
import cx from 'classnames';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import webCache from 'src/api/webCache';
import TabBar from '../components/TabBar';
import AppStatus from 'src/pages/AppHomepage/AppCenter/components/AppStatus';
import { getTodoCount } from 'src/pages/workflow/MyProcess/Entry';
import arrowRightImg from './img/arrowRight.png';
import arrowLeftImg from './img/arrowLeft.png';
import './index.less';
import SvgIcon from 'src/components/SvgIcon';
import AppGroupSkeleton from './AppGroupSkeleton';
import { getRandomString, getCurrentProject, addBehaviorLog } from 'src/util';
import { transferExternalLinkUrl } from 'src/pages/AppHomepage/AppCenter/utils';
import TextScanQRCode from 'src/components/newCustomFields/components/TextScanQRCode';
import { loadSDK } from 'src/components/newCustomFields/tools/utils';
import RegExp from 'src/util/expression';
import styled from 'styled-components';
import _ from 'lodash';
import moment from 'moment';

const GroupIcon = styled(SvgIcon)`
  font-size: 0px;
  margin-right: 10px;
`;

const GroupTitle = styled.div`
  display: flex;
  align-items: center;
`;

function loadLinkStyle(url) {
  const head = document.getElementsByTagName('head')[0];
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = url;
  link.media = 'all';
  head.appendChild(link);
}

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
      countData: {},
      guideStep: 0,
    };
  }
  componentDidMount() {
    const currentProject = !_.isEmpty(getCurrentProject(localStorage.getItem('currentProjectId')))
      ? getCurrentProject(localStorage.getItem('currentProjectId'))
      : getCurrentProject((md.global.Account.projects[0] || { projectId: 'external' }).projectId);
    const maturityTime = moment(md.global.Account.createTime).add(7, 'day').format('YYYY-MM-DD');
    const isAdmin = md.global.Account.projects[0]
      ? md.global.Account.projects[0].createAccountId === md.global.Account.accountId
      : false;
    const isMaturity = moment().isBefore(maturityTime);
    this.props.dispatch(actions.getAppList());
    this.props.dispatch(actions.getMyApp(currentProject ? currentProject.projectId : null));
    $('html').addClass('appHomeMobile');
    this.getTodoCount();
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
  componentWillReceiveProps(nextProps) {
    if (_.isEmpty(nextProps.countData)) return;
    if (nextProps.countData.myProcessCount !== this.props.countData.myProcessCount) {
      this.setState({
        countData: nextProps.countData,
      });
    }
  }
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
  getTodoCount = () => {
    const { action } = this.props;
    getTodoCount().then(countData => {
      const { updateCountData } = this.props;
      this.setState({
        countData,
      });
      updateCountData && updateCountData(countData);
    });
  };
  showActionSheet = () => {
    const { hideTemplateLibrary } = md.global.SysSettings;
    const BUTTONS = [
      hideTemplateLibrary ? null : { name: _l('从模板库添加'), icon: 'application_library', iconClass: 'Font18' },
      { name: _l('自定义创建'), icon: 'add', iconClass: 'Font22' },
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
          const title = _l('创建自定义应用请前往%0。', isWxWork ? _l('企业微信PC桌面端') : _l('PC端'));
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
    const { myAppData = {} } = this.props;
    const { apps = [], externalApps = [], aloneApps = [] } = myAppData;

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
              if (RegExp.isUrl(value)) {
                window.open(value);
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
        <div className="flexColumn emptyWrap">
          <Icon icon="h5_search" className="Font50" />
          <div className="Gray_bd Font17 Bold">{_l('没有搜索结果')}</div>
        </div>
      );
    }
    return (
      <div className=" h100">
        <Flex align="center" wrap="wrap" className="appCon">
          {_.map(searchResult, (item, i) => {
            return this.renderItem(item);
          })}
        </Flex>
      </div>
    );
  };
  renderProcess() {
    const { countData } = this.state;
    const waitingDispose = countData.waitingDispose > 99 ? '99+' : countData.waitingDispose;
    const waitingExamine = countData.waitingExamine > 99 ? '99+' : countData.waitingExamine;
    return (
      <Fragment>
        <div className="processWrapper flexRow">
          <div
            className="processItem flex valignWrapper"
            onClick={() => {
              window.mobileNavigateTo('/mobile/processMatters');
            }}
          >
            <Icon icon="knowledge_file" className="Font20 mRight5" />
            <span className="bold">{_l('流程事项')}</span>
            {waitingDispose ? <span className="count">{waitingDispose}</span> : null}
          </div>
          <div
            className="processNotice flex valignWrapper"
            onClick={() => {
              window.mobileNavigateTo('/mobile/processInform');
            }}
          >
            <div className="Relative">
              <Icon icon="notifications_11" className="Font20 mRight5" />
              {waitingExamine ? <span className="waitingExamineSign" /> : null}
            </div>
            <span className="bold">{_l('流程通知')}</span>
          </div>
        </div>
        {this.renderSearchApp()}
      </Fragment>
    );
  }
  renderItem(data) {
    const iconColor = data.iconColor || '#2196f3';
    const black = '#1b2025' === data.navColor;
    const light = [data.lightColor, '#ffffff', '#f5f6f7'].includes(data.navColor);

    return (
      <div className="myAppItemWrap InlineBlock" key={`${data.id}-${getRandomString()}`}>
        <div
          className="myAppItem mTop24"
          onClick={e => {
            if (data.id !== 'add') {
              addBehaviorLog('app', data.id); // 埋点
            }
            if (data.createType === 1) {
              e.stopPropagation();
              e.preventDefault();
              window.open(transferExternalLinkUrl(data.urlTemplate, data.projectId, data.id));
              return;
            }
            localStorage.removeItem('currentNavWorksheetId');
            safeLocalStorageSetItem('currentGroupInfo', JSON.stringify({}));
            data.onClick ? data.onClick() : window.mobileNavigateTo(`/mobile/app/${data.id}`);
          }}
        >
          <div
            className="myAppItemDetail TxtCenter Relative"
            style={{ backgroundColor: data.navColor || data.iconColor }}
          >
            {data.iconUrl ? (
              <SvgIcon url={data.iconUrl} fill={black || light ? iconColor : '#fff'} size={32} addClassName="mTop12" />
            ) : (
              <Icon icon={data.icon} className="Font30" />
            )}
            {data.id === 'add' || !data.fixed ? null : (
              <AppStatus isGoodsStatus={data.isGoodsStatus} isNew={data.isNew} fixed={data.fixed} />
            )}
          </div>
          <span className="breakAll LineHeight16 Font13 mTop10 contentText" style={{ WebkitBoxOrient: 'vertical' }}>
            {data.name}
          </span>
        </div>
      </div>
    );
  }
  forTitle({ data, type, name, icon }) {
    if (type) {
      return (
        <span>
          {icon &&
            (type === 'groupApps' || type === 'markedGroup' ? (
              <SvgIcon url={icon} size={18} fill="#9e9e9e" className="InlineBlock mRight10" />
            ) : (
              <Icon icon={icon} className="Gray_9e TxtMiddle mRight10 Font20" />
            ))}
          <span className={cx('Gray Font17 Bold', { TxtMiddle: type !== 'groupApps' })}>{name}</span>
        </span>
      );
    }
    return (
      <GroupTitle>
        {data.iconUrl ? (
          <GroupIcon url={data.iconUrl} fill="#9e9e9e" size={20} />
        ) : (
          <Icon icon={data.icon} className="mRight10 TxtMiddle Gray_9e Font20" />
        )}
        <span className="Gray Font17 Bold TxtTop">{data.name}</span>
      </GroupTitle>
    );
  }
  renderList({ data, type, name, icon }) {
    const { myAppData = {} } = this.props;
    const { homeSetting } = myAppData;
    const currentProject = getCurrentProject(localStorage.getItem('currentProjectId')) || {};
    if (data.length <= 0 && type !== 'apps') {
      return;
    } else {
      let list = type === 'markedGroup' ? data.apps : data;
      list = list.filter(o => o && !o.webMobileDisplay); //排除webMobileDisplay h5未发布
      const distance = ((this.state.width - 12) / 4 - 56) / 2;
      return (
        <div className="groupDetail" key={`${type}-${getRandomString()}`}>
          <div className="pTop16 flexRow" style={{ paddingLeft: `${distance}px`, paddingRight: `${distance}px` }}>
            {this.forTitle({ data, type, name, icon })}
            {type !== 'recentApps' && (
              <span className="mLeft10 Gray_9e Font17 TxtMiddle">{!_.isEmpty(list) && list.length}</span>
            )}
            {type === 'markedApps' && homeSetting.markedAppDisplay ? (
              <span className="allOrg mLeft12 Gray_9e Font13 TxtMiddle InlineBlock Bold">{_l('所有组织')}</span>
            ) : (
              ''
            )}
          </div>
          <Flex align="center" wrap="wrap" className="appCon">
            {_.map(list, (item, i) => {
              return this.renderItem(item);
            })}
            {(type === 'apps' || type === 'markedGroup') &&
              !currentProject.cannotCreateApp &&
              this.renderItem({
                id: 'add',
                iconColor: '#F5F5F5',
                icon: 'plus',
                name: _l('添加应用'),
                onClick: this.showActionSheet,
              })}
          </Flex>
        </div>
      );
    }
  }
  renderExternalList = ({ data, type, name, icon }) => {
    const distance = ((this.state.width - 12) / 4 - 56) / 2;
    return (
      <div className="groupDetail" key={`${type}-${getRandomString()}`}>
        <div className="pTop26 flexRow" style={{ paddingLeft: `${distance}px`, paddingRight: `${distance}px` }}>
          {this.forTitle({ data, type, name, icon })}
          <span className="mLeft10 Gray_9e Font17 TxtMiddle">{!_.isEmpty(data) && data.length}</span>
        </div>
        {type === 'externalApps' && _.isEmpty(data) && (
          <div className="Gray_bd Font15 pLeft47 mBottom32 Bold mTop16">{_l('暂无与外部协作者的应用')}</div>
        )}
        <Flex align="center" wrap="wrap" className="appCon">
          {_.map(data, (item, i) => {
            return this.renderItem(item);
          })}
        </Flex>
      </div>
    );
  };
  renderErr(noProject) {
    const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');
    const isWeLink = window.navigator.userAgent.toLowerCase().includes('huawei-anyoffice');
    const isDing = window.navigator.userAgent.toLowerCase().includes('dingtalk');
    const isApp = isWxWork || isWeLink || isDing;
    const currentProject = getCurrentProject(localStorage.getItem('currentProjectId')) || {};
    const cannotCreateApp = isApp ? currentProject.cannotCreateApp : true;

    const projects = _.get(md, ['global', 'Account', 'projects']);
    if (_.isEmpty(projects)) {
      return (
        <div className={cx('noNetworkBox flexColumn', { h100: !noProject })}>
          <div className="noNetworkBoxBG" />
          <div className="Font17 bold mTop40">{_l('申请加入一个组织，开始创建应用')}</div>
          <div className="flexRow mTop28">
            <button
              type="button"
              className="joinNetwork ThemeBGColor3 ThemeHoverBGColor2 mRight20"
              onClick={() => window.open('/enterpriseRegister.htm?type=add', '__blank')}
            >
              {_l('加入组织')}
            </button>
            {/*<button
              type="button"
              className="createNetwork ThemeBGColor3 ThemeBorderColor3 ThemeColor3"
              onClick={() => window.open('/enterpriseRegister.htm?type=create', '__blank')}
            >
              {_l('创建组织')}
            </button>*/}
          </div>
        </div>
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
  renderGuide() {
    const { guideStep } = this.state;
    if (guideStep == 1) {
      return (
        <div className="guideWrapper">
          <div className="guide guide1" />
          <img className="guideImg Absolute" src={arrowLeftImg} />
          <div className="text Absolute Font18 White bold">{_l('感谢你尝试安装！我们精心挑选了两个初始应用，供您体验。')}</div>
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
  renderContent() {
    const { HomeData, isHomeLoading, myAppData = {} } = this.props;
    const {
      markedApps = [],
      markedGroup = [],
      apps = [],
      externalApps = [],
      personalGroups = [],
      projectGroups = [],
      aloneApps = [],
      homeSetting = {},
      recentAppIds = [],
    } = myAppData;
    const recentApps = recentAppIds.slice(0, 8).map(item => _.filter(apps, it => item === it.id)[0]);
    const currentProject = !_.isEmpty(getCurrentProject(localStorage.getItem('currentProjectId')))
      ? getCurrentProject(localStorage.getItem('currentProjectId'))
      : getCurrentProject((md.global.Account.projects[0] || { projectId: 'external' }).projectId);
    const distance = ((this.state.width - 12) / 4 - 56) / 2;

    if (isHomeLoading) {
      return <AppGroupSkeleton />;
    }
    if (currentProject.projectId === 'external') {
      return (
        <div className="content">
          {this.renderExternalList({
            data: externalApps,
            type: 'externalApps',
            name: _l('外部协作'),
            icon: 'h5_external',
          })}
          {!_.isEmpty(aloneApps) && <div className="spaceBottom" />}
          {!_.isEmpty(aloneApps) &&
            this.renderExternalList({ data: aloneApps, type: 'aloneApps', name: _l('个人'), icon: 'people_5' })}
        </div>
      );
    }
    if (
      _.isEmpty(markedApps) &&
      _.isEmpty(markedGroup) &&
      _.isEmpty(apps) &&
      _.isEmpty(externalApps) &&
      _.isEmpty(aloneApps)
    ) {
      return this.renderErr();
    } else if (_.isEmpty(currentProject) && !_.isEmpty(externalApps)) {
      return (
        <div className="content">
          {this.renderErr(true)}
          {!_.isEmpty(externalApps) && <div className="spaceBottom" />}
          {!_.isEmpty(externalApps) &&
            this.renderList({ data: externalApps, type: 'externalApps', name: _l('外部协作'), icon: 'h5_external' })}
        </div>
      );
    } else {
      return (
        <div className="content">
          {homeSetting.displayCommonApp &&
            !_.isEmpty(recentApps) &&
            this.renderList({
              data: recentApps,
              type: 'recentApps',
              name: _l('最近使用'),
              icon: 'access_time_filled',
            })}
          {homeSetting.displayCommonApp && !_.isEmpty(recentApps) && <div className="spaceBottom" />}
          {!_.isEmpty(markedApps) &&
            this.renderList({ data: markedApps, type: 'markedApps', name: _l('星标应用'), icon: 'star' })}
          {!_.isEmpty(markedApps) && <div className="spaceBottom" />}
          {!_.isEmpty(markedGroup) &&
            markedGroup.map(item => {
              if (!item || !item.apps || _.isEmpty(item.apps)) return;
              return (
                <Fragment>
                  {this.renderList({ data: item, type: 'markedGroup', name: item.name, icon: item.iconUrl })}
                  <div className="spaceBottom" />
                </Fragment>
              );
            })}
          {homeSetting.isAllAndProject &&
            !_.isEmpty(projectGroups) &&
            projectGroups.map(it => {
              const { appIds = [] } = it;
              const groupData = _.filter(apps, v => _.includes(appIds, v.id));
              return (
                <Fragment>
                  {this.renderList({ data: groupData, type: 'groupApps', name: it.name, icon: it.iconUrl })}
                  {!_.isEmpty(groupData) && <div className="spaceBottom" />}
                </Fragment>
              );
            })}
          {(!_.isEmpty(markedGroup) || !_.isEmpty(personalGroups) || !_.isEmpty(projectGroups)) && (
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
              <Icon icon="arrow-right-border" className="Gray_9e" />
            </div>
          )}
          {(!_.isEmpty(markedGroup) || !_.isEmpty(personalGroups) || !_.isEmpty(projectGroups)) && (
            <div className="spaceBottom" />
          )}
          {currentProject && this.renderList({ data: apps, type: 'apps', name: _l('全部应用'), icon: 'workbench' })}
          {!_.isEmpty(externalApps) && homeSetting.exDisplay ? <div className="spaceBottom" /> : ''}
          {!_.isEmpty(externalApps) && homeSetting.exDisplay
            ? this.renderList({ data: externalApps, type: 'externalApps', name: _l('外部协作'), icon: 'h5_external' })
            : ''}
        </div>
      );
    }
  }
  render() {
    const { guideStep, searchValue } = this.state;

    return (
      <Fragment>
        <div className="listConBox h100">
          {this.renderProcess()}
          {!searchValue && this.renderContent()}
          {searchValue && this.renderSearchResult()}
          <TabBar action="appHome" />
        </div>
        {guideStep ? this.renderGuide() : null}
      </Fragment>
    );
  }
}

export default connect(state => {
  const { getAppHomeList, isHomeLoading, myAppData } = state.mobile;
  return {
    HomeData: getAppHomeList,
    myAppData,
    isHomeLoading,
  };
})(AppHome);
