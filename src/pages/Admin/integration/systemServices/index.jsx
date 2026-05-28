import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Icon, LoadDiv, Support } from 'ming-ui';
import projectAjax from 'src/api/project';
import smsAjax from 'src/api/sms';
import systemIntegrationAjax from 'src/api/systemIntegration';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import openKuaiMaiDialog from 'src/pages/FormSet/containers/Print/BindKuaiMaiDialog.jsx';
import { navigateTo } from 'src/router/navigateTo';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import Config from '../../config';
import CloudPrint from './cloudPrint';
import KuaiMaiIcon from './image/kuaimai.png';
import TwilioIcon from './image/Twilio.png';
import Twilio from './twilio';
import WeiXin from './weixin';
import PrivateAuthDialog from './weixin/PrivateAuthDialog';
import './index.less';

const TWILIO_HELP_URL = 'https://help.mingdao.com/org/link-twilio-international-sms';

// isPlatform 覆盖 SaaS 与私有部署平台版(server-platform)，普通私有 server 不展示 Twilio。
const showTwilioSystemService = window.platformENV.isPlatform;

const SERVICE_CARDS = [
  {
    key: 'weixin',
    icon: 'wechat',
    iconColor: '#07C160',
    title: _l('微信服务号'),
    description: _l('外部门户可获取用户授权信息,实现扫码登录和发送服务号消息'),
    buttonText: _l('授权'),
    route: '/weixin',
    helpUrl: 'https://help.mingdao.com/org/link-wechat-service-account',
  },
  {
    key: 'twilio',
    icon: 'shortMessage',
    iconImage: TwilioIcon, // 使用图片作为图标
    title: _l('Twilio 国际短信'),
    description: _l('连接Twilio发送国际短信服务'),
    buttonText: _l('连接'),
    route: '/twilio',
    helpUrl: TWILIO_HELP_URL,
  },
  {
    key: 'cloudPrint',
    icon: 'cloud_printing',
    iconImage: KuaiMaiIcon, // 使用图片作为图标
    title: _l('快麦云打印'),
    description: _l('连接第三方云打印服务商，实现远程打印标签/小票'),
    buttonText: _l('连接'),
    route: '/cloudprint',
    helpUrl: 'https://help.mingdao.com/worksheet/kuaimai-printing',
  },
];

class SystemServices extends Component {
  constructor(props) {
    super(props);
    Config.getParams();
    Config.setPageTitle(_l('集成 - 系统服务'));

    this.state = {
      loading: false,
      currentService: null,
      weiXinInfo: [], // 微信服务号
      twilioInfo: null, // Twilio信息
      printList: [], // 云打印列表
      printLoading: true,
    };
  }

  componentDidMount() {
    this.getWeiXinBindInfo();
    this.getPrintList();
    if (showTwilioSystemService) {
      this.getTwilioProvider();
    }
  }

  getWeiXinBindInfo = () => {
    if (!this.props.location.pathname.includes('systemservice')) {
      return;
    }

    projectAjax.getWeiXinBindingInfo({ projectId: Config.projectId }).then(res => {
      this.setState({ weiXinInfo: res || [] });
    });
  };

  getPrintList = () => {
    if (!this.props.location.pathname.includes('systemservice')) {
      return;
    }

    systemIntegrationAjax
      .getSystemIntegrationList({ projectId: Config.projectId, type: 1 })
      .then(res => {
        this.setState({ printList: res || [], printLoading: false });
      })
      .catch(() => {
        this.setState({ printLoading: false });
      });
  };

  handleCardClick = serviceKey => {
    const { weiXinInfo, printList } = this.state;

    if (serviceKey === 'weixin') {
      if (weiXinInfo.length) {
        navigateTo(`/admin/weixin/${Config.projectId}`);
      } else {
        this.handleBindWeiXin();
      }

      return;
    }

    if (serviceKey === 'cloudPrint') {
      const featureType = getFeatureStatus(Config.projectId, VersionProductType.wordPrintTemplate);

      if (featureType === '2') {
        buriedUpgradeVersionDialog(Config.projectId, VersionProductType.wordPrintTemplate);
        return;
      }

      if (printList.length) {
        navigateTo(`/admin/cloudprint/${Config.projectId}`);
      } else {
        openKuaiMaiDialog({
          projectId: Config.projectId,
          onOk: () => {
            this.getPrintList();
          },
        });
      }

      return;
    }

    // 只更新状态，不改变路由
    this.setState({ currentService: serviceKey });
  };

  handleEditClick = (e, serviceKey) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发卡片点击
    this.setState({ currentService: serviceKey });
  };

  handleBack = () => {
    // 返回时重置状态，显示卡片列表
    this.setState({ currentService: null });
    Config.setPageTitle(_l('系统服务'));
  };

  getTwilioProvider = () => {
    if (!this.props.location.pathname.includes('systemservice')) {
      return;
    }

    return smsAjax
      .getTwilioProvider({ projectId: Config.projectId }, { silent: true })
      .then(res => this.setState({ twilioInfo: res }));
  };

  // 立即授权微信服务号
  handleBindWeiXin = () => {
    if (this.state.authLoading) return;

    // 私有部署非平台版
    if (window.platformENV.isLocal && !window.platformENV.isPlatform) {
      this.setState({ privateAuthDialogVisible: true });
      return;
    }

    this.setState({ authLoading: true });
    projectAjax
      .bindingWeiXin({ projectId: Config.projectId })
      .then(res => {
        this.setState({ authLoading: false });
        if (res) {
          window.open(res);
        }
      })
      .catch(() => {
        this.setState({ authLoading: false });
      });
  };

  renderServiceCards() {
    const { weiXinInfo, twilioInfo, printList, printLoading } = this.state;
    const featureType = getFeatureStatus(Config.projectId, VersionProductType.wordPrintTemplate);

    return (
      <div className="orgManagementWrap systemServicesContainer">
        <div className="orgManagementHeader">
          <span className="Font17 Bold">{_l('系统服务')}</span>
          <span className="Font14 textTertiary mLeft8">{_l('为系统功能连接第三方服务')}</span>
        </div>
        <div className="systemServicesContent">
          <div className="serviceCardsGrid">
            {SERVICE_CARDS.filter(card => !(card.key === 'twilio' && !showTwilioSystemService)).map(card => {
              // nocoly隐藏快麦云
              if (card.key === 'cloudPrint' && (printLoading || !featureType || window.platformENV.isOverseas)) {
                return null;
              }

              if (card.key === 'weixin' && md.global.SysSettings.hideWeixin) {
                return null;
              }

              const isConnected =
                card.key === 'weixin'
                  ? !!weiXinInfo.length
                  : card.key === 'twilio'
                    ? !!twilioInfo
                    : card.key === 'cloudPrint'
                      ? !!printList.length && printList[0]?.isOpen
                      : false;
              return (
                <div key={card.key} className="serviceCard Hand" onClick={() => this.handleCardClick(card.key)}>
                  <div className="flexRow mBottom16">
                    <div className="flex">
                      <div className="serviceCardIcon" style={{ backgroundColor: card.iconColor || 'transparent' }}>
                        {card.iconImage ? (
                          <img src={card.iconImage} alt={card.title} className="w100" />
                        ) : (
                          <Icon icon={card.icon} className="Font40" />
                        )}
                      </div>
                    </div>
                    <div className="serviceCardHelp" onClick={e => e.stopPropagation()}>
                      <Support href={card.helpUrl} type={1} />
                    </div>
                  </div>
                  <div className="flex mBottom16">
                    <div className="Font15 Bold mBottom4">{card.title}</div>
                    <div className="Font13 textSecondary">{card.description}</div>
                  </div>
                  <div className="flexRow alignItemsCenter justifyContentBetween">
                    {isConnected ? (
                      <>
                        <div className="serviceCardConnected flexRow alignItemsCenter">
                          <i className="icon-check_circle Font16 Green"></i>
                          <span className="mLeft4 Font14 Green">{_l('已连接')}</span>
                        </div>
                        {card.key === 'twilio' && (
                          <span
                            className="serviceCardEdit flexRow alignItemsCenter Font14 textSecondary adminHoverColor Hand"
                            onClick={e => this.handleEditClick(e, card.key)}
                          >
                            {_l('编辑')} <i className="icon-arrow-right-border Font14 mLeft4"></i>
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="serviceCardButton InlineBlock Font14 TxtCenter Hand">{card.buttonText}</div>
                    )}

                    {card.key === 'weixin' && weiXinInfo.length ? (
                      <div className="flexRow alignItemsCenter InlineBlock Font13 Hand">
                        <span className="Green">{_l('已绑定 %0 个', weiXinInfo.length)}</span>
                        <span className="icon-arrow-right-border Font14 mLeft4"></span>
                      </div>
                    ) : null}
                    {card.key === 'cloudPrint' && printList.length && !printList[0]?.isOpen ? (
                      <div className="flexRow alignItemsCenter InlineBlock Font13 Hand">
                        <span className="textTertiary">{_l('服务已关闭')}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  renderPrivateAuthDialog() {
    const { privateAuthDialogVisible } = this.state;

    if (!privateAuthDialogVisible) return null;

    return (
      <PrivateAuthDialog
        visible={privateAuthDialogVisible}
        projectId={Config.projectId}
        onCancel={() => this.setState({ privateAuthDialogVisible: false })}
        getWeiXinBindingInfo={this.getWeiXinBindInfo}
      />
    );
  }

  render() {
    const { loading, currentService, authLoading, printList } = this.state;

    if (loading) {
      return (
        <div className="orgManagementWrap">
          <LoadDiv />
        </div>
      );
    }

    if (this.props.location.pathname.includes('weixin')) {
      return (
        <Fragment>
          <WeiXin
            onBack={() => navigateTo(`/admin/systemservice/${Config.projectId}`)}
            authLoading={authLoading}
            handleBindWeiXin={this.handleBindWeiXin}
          />

          {this.renderPrivateAuthDialog()}
        </Fragment>
      );
    }

    if (this.props.location.pathname.includes('cloudprint')) {
      return <CloudPrint onBack={() => navigateTo(`/admin/systemservice/${Config.projectId}`)} printList={printList} />;
    }

    return (
      <>
        {this.renderServiceCards()}
        {showTwilioSystemService && (
          <Twilio
            visible={currentService === 'twilio'}
            twilioInfo={this.state.twilioInfo}
            onCancel={this.handleBack}
            onSaveSuccess={() => this.getTwilioProvider().then(() => this.handleBack())}
            helpUrl={TWILIO_HELP_URL}
            onRemoveSuccess={() => {
              this.setState({ twilioInfo: null });
              this.handleBack();
            }}
          />
        )}

        {this.renderPrivateAuthDialog()}
      </>
    );
  }
}

export default withRouter(SystemServices);
