import React, { Fragment } from 'react';
import { Flex, ActionSheet, Modal } from 'antd-mobile';
import { Icon, Button } from 'ming-ui';
import cx from 'classnames';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import webCache from 'src/api/webCache';
import TabBar from '../components/TabBar';
import AppStatus from 'src/pages/AppHomepage/MyApp/MyAppGroup/AppStatus';
import { getTodoCount } from 'src/pages/workflow/MyProcess/Entry';
import arrowRightImg from './img/arrowRight.png';
import arrowLeftImg from './img/arrowLeft.png';
import okImg from './img/ok.png';
import text1Img from './img/text1.png';
import text2Img from './img/text2.png';
import './index.less';
import SvgIcon from 'src/components/SvgIcon';
import AppGroupSkeleton from './AppGroupSkeleton';
import { getRandomString } from 'src/util';
import { ADVANCE_AUTHORITY } from 'src/pages/PageHeader/AppPkgHeader/config';
const {
  app: { addAppItem },
} = window.private;

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
    const maturityTime = moment(md.global.Account.createTime).add(7, 'day').format('YYYY-MM-DD');
    const isAdmin = md.global.Account.projects[0]
      ? md.global.Account.projects[0].createAccountId === md.global.Account.accountId
      : false;
    const isMaturity = moment().isBefore(maturityTime);
    this.props.dispatch(actions.getAppList());
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
          this.props.history.push(`/mobile/appBox`);
        }
        if (buttonIndex === 1) {
          const title = _l('创建自定义应用请前往%0。', isWxWork ? _l('企业微信PC桌面端') : _l('PC端'));
          Modal.alert(title, null, [{ text: _l('我知道了'), onPress: () => {} }]);
        }
      },
    );
  };
  renderProcess() {
    const { countData } = this.state;
    const waitingDispose = countData.waitingDispose > 99 ? '99+' : countData.waitingDispose;
    const waitingExamine = countData.waitingExamine > 99 ? '99+' : countData.waitingExamine;
    return (
      <div className="processWrapper flexRow">
        <div
          className="processItem flex valignWrapper"
          onClick={() => {
            this.props.history.push('/mobile/processMatters');
          }}
        >
          <Icon icon="knowledge_file" className="Font20 mRight5" />
          <span className="bold">{_l('流程事项')}</span>
          {waitingDispose ? <span className="count">{waitingDispose}</span> : null}
        </div>
        <div
          className="processNotice flex valignWrapper"
          onClick={() => {
            this.props.history.push('/mobile/processInform');
          }}
        >
          <div className="Relative">
            <Icon icon="notifications_11" className="Font20 mRight5" />
            {waitingExamine ? <span className="waitingExamineSign" /> : null}
          </div>
          <span className="bold">{_l('流程通知')}</span>
        </div>
      </div>
    );
  }
  renderItem(data) {
    return (
      <div className="myAppItemWrap InlineBlock" key={`${data.id}-${getRandomString()}`}>
        <div
          className="myAppItem mTop24"
          onClick={e => {
            localStorage.removeItem('currentNavWorksheetId');
            data.onClick ? data.onClick() : this.props.history.push(`/mobile/app/${data.id}`);
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
          <div>
            <span className="Gray Font16 Bold TxtTop">{_l('星标应用')}</span>
          </div>
        );
      case 'validProject':
        return <div className="Gray Font16 Bold">{data.projectName}</div>;
      case 'externalApps':
        return (
          <div>
            <span className="Gray Font16 Bold TxtMiddle">{_l('外部协作应用')}</span>
          </div>
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
        return <div className="Gray Font16 Bold">{_l('个人')}</div>;
    }
  }
  renderList(data, type) {
    if (data.length <= 0) {
      return;
    } else {
      let list = type === 'validProject' || type === 'expireProject' ? data.projectApps : data;
      list = list.filter(o => !o.webMobileDisplay); //排除webMobileDisplay h5未发布
      if (list.length <= 0) {
        return '';
      }
      const distance = ((this.state.width - 12) / 4 - 56) / 2;
      return (
        <Fragment key={`${type}-${getRandomString()}`}>
          <div className="pTop30" style={{ paddingLeft: `${distance}px`, paddingRight: `${distance}px` }}>
            {this.forTitle(data, type)}
          </div>
          <Flex align="center" wrap="wrap" className="appCon">
            {_.map(list, (item, i) => {
              return this.renderItem(item);
            })}
            {type === 'validProject' &&
              !addAppItem.addAppIcon &&
              !(_.find(md.global.Account.projects, item => item.projectId === data.projectId) || {}).cannotCreateApp &&
              this.renderItem({
                id: 'add',
                iconColor: '#F5F5F5',
                icon: 'plus',
                name: _l('添加应用'),
                onClick: this.showActionSheet,
              })}
          </Flex>
        </Fragment>
      );
    }
  }
  renderErr() {
    const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');
    const isWeLink = window.navigator.userAgent.toLowerCase().includes('huawei-anyoffice');
    const isDing = window.navigator.userAgent.toLowerCase().includes('dingtalk');
    const isApp = isWxWork || isWeLink || isDing;
    const cannotCreateApp = isApp ? _.get(md.global.Account.projects[0], ['cannotCreateApp']) : true;

    return (
      <div className="flexColumn flex valignWrapper justifyContentCenter">
        <p className="Gray_75 mTop25 TxtCenter Gray Font17 errPageCon">
          {cannotCreateApp ? _l('暂无任何应用') : _l('您暂无权限添加应用，请联系管理员进行添加使用')}
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
          <img className="textImg Absolute" src={text1Img} />
          <img
            className="okImg Absolute"
            src={okImg}
            onClick={() => {
              this.addWebCache();
              this.setState({ guideStep: 2 });
            }}
          />
        </div>
      );
    } else {
      return (
        <div className="guideWrapper">
          <div className="guide guide2" />
          <img className="guide2Img Absolute" src={arrowRightImg} />
          <img className="text2Img Absolute" src={text2Img} />
          <img
            className="ok2Img Absolute"
            src={okImg}
            onClick={() => {
              this.setState({ guideStep: 0 });
            }}
          />
        </div>
      );
    }
  }
  renderContent() {
    const { HomeData, isHomeLoading, hasData } = this.props;

    if (isHomeLoading) {
      return <AppGroupSkeleton />;
    }

    if (
      HomeData[0].markedApps.length <= 0 &&
      HomeData[0].validProject.length <= 0 &&
      HomeData[0].aloneApps.length <= 0 &&
      HomeData[0].externalApps.length <= 0 &&
      HomeData[0].expireProject <= 0
    ) {
      return this.renderErr();
    } else if (
      HomeData[0].markedApps.length <= 0 &&
      HomeData[0].aloneApps.length <= 0 &&
      HomeData[0].externalApps.length <= 0 &&
      HomeData[0].validProject.filter(item => item.projectApps.length > 0).length <= 0 &&
      HomeData[0].expireProject.filter(item => item.projectApps.length > 0).length <= 0
    ) {
      return this.renderErr();
    } else {
      return (
        <div className="content">
          {HomeData[0].markedApps &&
            HomeData[0].markedApps.length > 0 &&
            this.renderList(HomeData[0].markedApps, 'markedApps')}
          {HomeData[0].validProject.map((item, index) => this.renderList(item, 'validProject'))}
          {HomeData[0].aloneApps.length > 0 && this.renderList(HomeData[0].aloneApps, 'aloneApps')}
          {HomeData[0].externalApps.length > 0 && this.renderList(HomeData[0].externalApps, 'externalApps')}
          {HomeData[0].expireProject.map((item, index) => this.renderList(item, 'expireProject'))}
        </div>
      );
    }
  }
  render() {
    const { guideStep } = this.state;

    return (
      <Fragment>
        <div className="listConBox h100">
          {this.renderProcess()}
          {this.renderContent()}
          <TabBar action="appHome" />
        </div>
        {guideStep ? this.renderGuide() : null}
      </Fragment>
    );
  }
}

export default connect(state => {
  const { getAppHomeList, isHomeLoading } = state.mobile;
  return {
    HomeData: getAppHomeList,
    isHomeLoading,
  };
})(AppHome);
