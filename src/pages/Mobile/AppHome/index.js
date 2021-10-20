import React from 'react';
import { Flex, ActionSheet, Modal } from 'antd-mobile';
import { Icon, Button } from 'ming-ui';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import webCache from 'src/api/webCache';
import TabBar from '../components/TabBar';
import AppStatus from 'src/pages/AppHomepage/MyApp/MyAppGroup/AppStatus';
import { getTodoCount } from 'src/pages/workflow/MyProcess/Entry';
import noAppListImg from './img/noApp.png';
import arrowRightImg from './img/arrowRight.png';
import arrowLeftImg from './img/arrowLeft.png';
import okImg from './img/ok.png';
import text1Img from './img/text1.png';
import text2Img from './img/text2.png';
import './index.less';
import SvgIcon from 'src/components/SvgIcon';
import AppGroupSkeleton from './AppGroupSkeleton';
import { getRandomString } from 'src/util';

function loadLinkStyle(url) {
  const head = document.getElementsByTagName('head')[0];
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = url;
  link.media = 'all';
  head.appendChild(link);
}

const STATUS_TO_TEXT = {
  1: { src: noAppListImg, text: _l('暂无任何应用，请选择从应用库添加应用开始使用') },
};
const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');

class AppHome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: document.documentElement.clientWidth,
      countData: {},
      modal: false,
      guideStep: 0,
    };
  }
  componentDidMount() {
    const maturityTime = moment(md.global.Account.createTime)
      .add(7, 'day')
      .format('YYYY-MM-DD');
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
  }
  componentWillUnmount() {
    $('html').removeClass('appHomeMobile');
    ActionSheet.close();
  }
  componentWillReceiveProps(nextProps) {
    if (_.isEmpty(nextProps.countData)) return;
    if (nextProps.countData.myProcessCount !== this.props.countData.myProcessCount) {
      this.setState({
        countData: nextProps.countData,
      });
    }
  }
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
    const BUTTONS = [hideTemplateLibrary ? null : _l('从应用库添加'), _l('创建自定义应用'), _l('取消')].filter(item => item);

    ActionSheet.showActionSheetWithOptions(
      {
        options: BUTTONS,
        cancelButtonIndex: BUTTONS.length - 1,
      },
      buttonIndex => {
        if (hideTemplateLibrary) {
          buttonIndex = buttonIndex + 1;
        }
        if (buttonIndex === 0) {
          this.props.history.push(`/mobile/appBox`);
        }
        if (buttonIndex === 1) {
          this.setState({
            modal: true,
          });
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
            {waitingExamine ? <span className="waitingExamineSign"></span> : null}
          </div>
          <span className="bold">{_l('流程通知')}</span>
        </div>
        <Modal
          transparent
          className="createInfoModal"
          visible={this.state.modal}
          maskClosable={false}
          onClose={() => {
            this.setState({ modal: false });
          }}
          title={
            <span className="LineHeight22">
              {_l('创建自定义应用请前往%0。', isWxWork ? _l('企业微信PC桌面端') : _l('PC端'))}
            </span>
          }
          footer={[
            {
              text: _l('我知道了'),
              onPress: () => {
                this.setState({ modal: false });
              },
            },
          ]}
        ></Modal>
      </div>
    );
  }
  renderItem(data) {
    return (
      <div className="myAppItemWrap InlineBlock" key={`${data.id}-${getRandomString()}`}>
        <div
          className="myAppItem mTop24"
          onClick={e => {
            data.onClick ? data.onClick() : this.props.history.push(`/mobile/app/${data.id}`);
          }}
        >
          <div className="myAppItemDetail TxtCenter Relative" style={{ backgroundColor: data.iconColor }}>
            {data.iconUrl ? (
              <SvgIcon url={data.iconUrl} fill="#fff" size={32} addClassName="mTop12" />
            ) : (
              <Icon icon={data.icon} className="Font30" />
            )}
            {data.id === 'add' ? null : <AppStatus isGoodsStatus={data.isGoodsStatus} isNew={data.isNew} />}
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
      const list = type === 'validProject' || type === 'expireProject' ? data.projectApps : data;
      const distance = ((this.state.width - 12) / 4 - 56) / 2;
      return (
        <React.Fragment key={`${type}-${getRandomString()}`}>
          <div className="pTop30" style={{ paddingLeft: `${distance}px`, paddingRight: `${distance}px` }}>
            {this.forTitle(data, type)}
          </div>
          <Flex align="center" wrap="wrap" className="appCon">
            {_.map(list, (item, i) => {
              return this.renderItem(item);
            })}
            {type === 'validProject' &&
              !(_.find(md.global.Account.projects, item => item.projectId === data.projectId) || {}).cannotCreateApp &&
              this.renderItem({
                id: 'add',
                iconColor: '#F5F5F5',
                icon: 'plus',
                name: _l('添加应用'),
                onClick: this.showActionSheet,
              })}
          </Flex>
        </React.Fragment>
      );
    }
  }
  renderErr(status) {
    return (
      <div className="flexColumn flex valignWrapper justifyContentCenter">
        <p className="Gray_75 mTop25 TxtCenter Gray Font17 errPageCon">{STATUS_TO_TEXT[status].text}</p>
        <Button className="addApp bold Font17" onClick={this.showActionSheet}>
          {_l('添加应用')}
        </Button>
      </div>
    );
  }
  renderGuide() {
    const { guideStep } = this.state;
    if (guideStep == 1) {
      return (
        <div className="guideWrapper">
          <div className="guide guide1"></div>
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
          <div className="guide guide2"></div>
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
      return this.renderErr(1);
    } else if (
      HomeData[0].markedApps.length <= 0 &&
      HomeData[0].aloneApps.length <= 0 &&
      HomeData[0].externalApps.length <= 0 &&
      HomeData[0].validProject.filter(item => item.projectApps.length > 0).length <= 0 &&
      HomeData[0].expireProject.filter(item => item.projectApps.length > 0).length <= 0
    ) {
      return this.renderErr(1);
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
      <React.Fragment>
        <div className="listConBox h100">
          {this.renderProcess()}
          {this.renderContent()}
          <TabBar action="appHome" />
        </div>
        {guideStep ? this.renderGuide() : null}
      </React.Fragment>
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
