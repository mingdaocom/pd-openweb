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
import { getRandomString, getProject } from 'src/util';
import styled from 'styled-components';

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
    const currentProject = getProject(localStorage.getItem('currentProjectId'));
    const maturityTime = moment(md.global.Account.createTime)
      .add(7, 'day')
      .format('YYYY-MM-DD');
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
      <div className="appSearchWrapper">
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
    return (
      <div className="myAppItemWrap InlineBlock" key={`${data.id}-${getRandomString()}`}>
        <div
          className="myAppItem mTop24"
          onClick={e => {
            localStorage.removeItem('currentNavWorksheetId');
            safeLocalStorageSetItem('currentGroupInfo', JSON.stringify({}));
            data.onClick ? data.onClick() : window.mobileNavigateTo(`/mobile/app/${data.id}`);
          }}
        >
          <div className="myAppItemDetail TxtCenter Relative" style={{ backgroundColor: data.iconColor }}>
            {data.iconUrl ? (
              <SvgIcon url={data.iconUrl} fill="#fff" size={32} addClassName="mTop12" />
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
  forTitle(data, type) {
    switch (type) {
      case 'markedApps':
        return (
          <span>
            <Icon icon="star" className="Gray_9e TxtMiddle mRight10 Font20" />
            <span className="Gray Font17 Bold TxtMiddle">{_l('星标应用')}</span>
          </span>
        );
      case 'validProject':
        return <span className="Gray Font16 Bold">{data.projectName}</span>;
      case 'apps':
        return (
          <span>
            <Icon icon="workbench" className="mRight10 TxtMiddle Gray_9e Font20" />
            <span className="Gray Font17 Bold TxtMiddle">{_l('全部应用')}</span>
          </span>
        );
      case 'externalApps':
        return (
          <span>
            <Icon icon="h5_external" className=" mRight10 TxtMiddle Gray_9e Font20" />
            <span className="Gray Font17 Bold TxtMiddle">{_l('外部协作')}</span>
          </span>
        );
      case 'expireProject':
        return (
          <div>
            <span className="Gray Font16 Bold TxtMiddle">{data.projectName}</span>
            <div className="appBelongInfo">
              <span>{_l('已到期')}</span>
            </div>
          </div>
        );
      case 'aloneApps':
        return (
          <span>
            <Icon icon="people_5" className=" mRight10 TxtMiddle Gray_9e Font20" />
            <span className="Gray Font17 Bold TxtMiddle">{_l('个人')}</span>
          </span>
        );
      default:
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
  }
  renderList(data, type) {
    const { myAppData = {} } = this.props;
    const { homeSetting } = myAppData;
    const currentProject = getProject(localStorage.getItem('currentProjectId')) || {};
    if (data.length <= 0 && type !== 'apps') {
      return;
    } else {
      let list = type === 'markedGroup' ? data.apps : data;
      list = list.filter(o => !o.webMobileDisplay); //排除webMobileDisplay h5未发布
      const distance = ((this.state.width - 12) / 4 - 56) / 2;
      return (
        <div className="groupDetail" key={`${type}-${getRandomString()}`}>
          <div className="pTop16 flexRow" style={{ paddingLeft: `${distance}px`, paddingRight: `${distance}px` }}>
            {this.forTitle(data, type)}
            <span className="mLeft10 Gray_9e Font17 TxtMiddle">{!_.isEmpty(list) && list.length}</span>
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
  renderExternalList = (data, type) => {
    const distance = ((this.state.width - 12) / 4 - 56) / 2;
    return (
      <div className="groupDetail" key={`${type}-${getRandomString()}`}>
        <div className="pTop26 flexRow" style={{ paddingLeft: `${distance}px`, paddingRight: `${distance}px` }}>
          {this.forTitle(data, type)}
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
    const currentProject = getProject(localStorage.getItem('currentProjectId')) || {};
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
    } = myAppData;
    const currentProject = getProject(localStorage.getItem('currentProjectId')) || { projectId: 'external' };
    const distance = ((this.state.width - 12) / 4 - 56) / 2;
    if (isHomeLoading) {
      return <AppGroupSkeleton />;
    }
    if (currentProject.projectId === 'external') {
      return (
        <div className="content">
          {this.renderExternalList(externalApps, 'externalApps')}
          {!_.isEmpty(aloneApps) && <div className="spaceBottom" />}
          {!_.isEmpty(aloneApps) && this.renderExternalList(aloneApps, 'aloneApps')}
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
    } else if (!currentProject && !_.isEmpty(externalApps)) {
      return (
        <div className="content">
          {this.renderErr(true)}
          {!_.isEmpty(externalApps) && <div className="spaceBottom" />}
          {!_.isEmpty(externalApps) && this.renderList(externalApps, 'externalApps')}
        </div>
      );
    } else {
      return (
        <div className="content">
          {!_.isEmpty(markedApps) && this.renderList(markedApps, 'markedApps')}
          {!_.isEmpty(markedApps) && <div className="spaceBottom" />}
          {!_.isEmpty(markedGroup) &&
            markedGroup.map(item => {
              if (!item || !item.apps || _.isEmpty(item.apps)) return;
              return (
                <Fragment>
                  {this.renderList(item, 'markedGroup')}
                  <div className="spaceBottom" />
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
          {currentProject && this.renderList(apps, 'apps')}
          {!_.isEmpty(externalApps) && homeSetting.exDisplay ? <div className="spaceBottom" /> : ''}
          {!_.isEmpty(externalApps) && homeSetting.exDisplay ? this.renderList(externalApps, 'externalApps') : ''}
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
