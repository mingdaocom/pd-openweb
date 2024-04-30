import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import preall from 'src/common/preall';
import { Button, Icon, Tooltip } from 'ming-ui';
import { Slider } from 'antd';
import PayHeader from '../payHeader';
import EditContractDialog from './EditContractDialog';
import { payDialogFunc } from '../payDialog';
import upgradeController from 'src/api/upgrade';
import orderController from 'src/api/order';
import { versionIntroduction, featureDataList, payMethodList } from './config';
import { getRequest, addToken } from 'src/util';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';

export default class VersionUpgrade extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeVersion: 2,
      selectYear: 1,
      amount: 9900,
      contractInfo: {},
      userCount: 30,
      orderId: null,
      bugMethod: 'alipayPay',
    };
    this.timer = null;
  }
  componentDidMount() {
    this.getUnPaidOrder();
    this.getProjectContractInfo();
    window.addEventListener('scroll', this.handleScroll);
    const { select, goToPost } = getRequest(location.search);
    if (select) {
      this.setState({ activeVersion: Number(select) }, this.getProductPrice);
    } else {
      this.getProductPrice();
    }
    if (goToPost === 'true') {
      this.toPurchase();
    }
  }

  // 获取未支付订单
  getUnPaidOrder = () => {
    const { projectId } = getRequest(location.search);

    orderController
      .getAuthorizeDraftOrder({
        projectId,
      })
      .then(res => {
        if (res && res.orderId) {
          this.setState({ orderId: res.orderId });
        }
      });
  };

  // 获取合同信息
  getProjectContractInfo = () => {
    const { projectId } = getRequest(location.search);
    if (!projectId) return;

    upgradeController
      .getProjectContractInfo({
        projectId,
      })
      .then(res => {
        this, this.setState({ contractInfo: res });
      });
  };

  // 获取产品价格
  getProductPrice = () => {
    const { projectId } = getRequest(location.search);
    const { userCount, selectYear, activeVersion } = this.state;

    orderController
      .getAuthorizeOrderPrice({
        userNum: userCount > 750 ? 0 : userCount,
        years: selectYear,
        versionId: activeVersion,
        projectId,
        unLimited: userCount > 750,
      })
      .then(res => {
        const { totalPrice } = res;
        this.setState({ totalPrice });
      });
  };

  addPayLog = () => {
    const { projectId } = getRequest(location.search);
    const { orderId } = this.state;

    orderController.addThreePartPayOrderLog({
      projectId,
      orderId: orderId,
    });
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      payDialogFunc({ url: '/personal?type=enterprise' });
    }, 1000);
  };

  // 支付已有订单
  addOrderPay = () => {
    const { projectId } = getRequest(location.search);
    const { activeVersion, selectYear, userCount, bugMethod } = this.state;

    orderController
      .addAuthorizeOrder({
        userNum: userCount > 750 ? 0 : userCount,
        unLimited: userCount > 750,
        years: selectYear,
        projectId,
        needSalesAssistance: true,
        versionId: activeVersion,
      })
      .then(res => {
        if (res) {
          if (bugMethod === 'wechartPay') {
            window.open(`/wechatPay/${projectId}/${res.orderId}`, '_blanl');
          } else {
            window.open(
              addToken(
                md.global.Config.AjaxApiUrl + 'pay/alipay?projectId=' + projectId + '&orderNumber=' + res.orderId,
              ),
              '_blank',
            );
          }
        } else {
          alert('订单提交失败', 2);
        }
      });
  };

  // 在线支付
  handlePay = () => {
    const { projectId } = getRequest(location.search);
    const { orderId, bugMethod, contractInfo = {} } = this.state;
    const { address, companyName, email, geographyId, mobilePhone, postcode, recipientName } = contractInfo;
    const isContractInfoIntact =
      address && companyName && email && geographyId && mobilePhone && postcode && recipientName;
    if (!isContractInfoIntact) {
      alert('请完善合同信息', 3);
      return;
    }
    if (!orderId) {
      this.addOrderPay();
    } else if (bugMethod === 'alipayPay') {
      let url = md.global.Config.AjaxApiUrl + 'pay/alipay?projectId=' + projectId + '&orderNumber=' + orderId;
      window.open(addToken(url));
    } else if (bugMethod === 'wechartPay') {
      window.open(`/wechatPay/${projectId}/${orderId}`);
    }

    this.addPayLog();
  };

  // 取消支付
  handleCancelPay = () => {
    const { projectId } = getRequest(location.search);
    const { orderId } = this.state;
    orderController
      .cancelOrder({
        orderId,
        projectId,
      })
      .then(res => {
        if (res) {
          alert('订单取消成功', 1, 2000, function () {
            window.location.reload();
          });
        } else {
          alert('订单取消失败', 2);
        }
      });
  };

  handleScroll = () => {
    if (this.featureWrap && this.topDescription) {
      if (
        $(window).scrollTop() >= this.topDescription.clientHeight + 200 - 60 &&
        $(window).scrollTop() <= this.topDescription.clientHeight + this.featureWrap.clientHeight + 200 - 60
      ) {
        $('.fixedInfo').addClass('fixedInfoFadeIn');
      } else {
        $('.fixedInfo').removeClass('fixedInfoFadeIn');
      }
    }
  };

  renderExistOrder = () => {
    const { projectId } = getRequest(location.search);
    const { totalPrice, bugMethod } = this.state;

    return (
      <div className="payOrder">
        <h3 className="titleUpgrade Black18 Normal">{_l('您正在购买付费产品，请完成支付！')}</h3>
        <div className="mTop20 LineHeight40">
          <span className="Width70 InlineBlock">{_l('支付总计:')}</span>
          <span className="newColor Font20 bold500 mLeft10 ThemeColor">{totalPrice}</span>
          <span className="mLeft10 mRight30">{_l('元(人民币)')} </span>
          <a href={`/upgrade/contract?projectId=${projectId}`} target="_blank" className="LineHeight35 Font14">
            {_l('合同预览')}
          </a>
        </div>
        <div className="flexRow">
          <span className="LineHeight20 Font12 Width70 InlineBlock">{_l('支付方式:')}</span>
          <div className="payMethod mTop0">
            {payMethodList.map(item => {
              return (
                <div
                  className={cx('itemBoxContent', { active: bugMethod === item.type })}
                  key={item.type}
                  onClick={() => this.setState({ bugMethod: item.type })}
                >
                  <span className={`icon-${item.icon} ${item.iconColor} Font24 mRight8`}></span>
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mTop30 TxtCenter">
          <Button size="large" type="primary" className="payMDBtn" onClick={this.handlePay}>
            {_l('立即支付')}
          </Button>
          <Button size="large" type="link" className="cancelOrderBtn" onClick={this.handleCancelPay}>
            {_l('取消订单')}
          </Button>
        </div>
        <div className="LineHeight30 Gray_8 mTop40 Font14">{_l('我们将在收到款项后的15分钟内为您完成服务。')}</div>
        <div className="LineHeight30 Gray_8 Font14 InlineBlock">
          {_l('如果您已完成付款而未成功开通，请拨打免费咨询热线 %0', md.global.Config.ServiceTel)}
        </div>
      </div>
    );
  };

  toPurchase = () => {
    let ele = document.getElementById('purchaseInfoWrap');
    if (ele) {
      ele.scrollIntoView();
    }
  };

  renderFeatureDetail = () => {
    const { activeVersion } = this.state;

    return (
      <div className="featureWrap flexRow" ref={node => (this.featureWrap = node)}>
        <div className="fixedInfo">
          {featureDataList.map(item => {
            return (
              <div className={cx('flex', { 'flexRow alignItemsCenter justifyContentCenter': item.version === 2 })}>
                {item.versionName}
                {item.version === 2 && <span className="introduce">{_l('推荐')}</span>}
              </div>
            );
          })}
        </div>

        {featureDataList.map(v => {
          const { version, versionName } = v;

          return (
            <div
              className={cx('col flex', {
                activeVersion: activeVersion === version,
                featureDescription: version === -1,
              })}
            >
              <div
                className={cx('colContent', { Hand: _.includes([1, 2, 3], version) })}
                onClick={() => {
                  if (_.includes([-1, 0], version)) return;
                  this.setState({ activeVersion: version }, this.getProductPrice);
                }}
              >
                <div className="versionNameTitle">{versionName}</div>
                {v.featureData.map(item => {
                  if (item.subTitle) {
                    return (
                      <div className={`item bold Font14 ${item.className}`}>
                        {v.version === -1 ? item.subTitle : ''}
                      </div>
                    );
                  }

                  let content = item[`value${version}`];

                  if (_.isObject(content)) {
                    content = Object.keys(content).map(i => <div>{content[i]}</div>);
                  }

                  return (
                    <div
                      className={cx(`item ${item.className}`, {
                        [content]: _.includes(['basicPng', 'basicNo'], content),
                        flexColumn: _.isObject(item[`value${version}`]),
                      })}
                      onMouseOver={() => {
                        $(`.${item.className}`).css({
                          backgroundColor: 'rgba(38, 128, 235, 0.05)',
                        });
                      }}
                      onMouseLeave={() => {
                        $(`.${item.className}`).css({
                          backgroundColor: '#fff',
                        });
                      }}
                    >
                      {v.version === -1 ? (
                        <Fragment>
                          <span>{item.name}</span>
                          {!!item.dataTip && (
                            <Tooltip popupPlacement="bottom" text={<span>{item.dataTip}</span>}>
                              <Icon className="icon icon-workflow_help Gray_bd Font16 mLeft3" />
                            </Tooltip>
                          )}
                        </Fragment>
                      ) : _.includes(['basicPng', 'basicNo'], content) ? (
                        ''
                      ) : (
                        content
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="selectIconWrap">
                {_.includes([1, 2, 3], version) ? (
                  <div
                    className={cx('selectIcon Hand', { selected: version === activeVersion })}
                    onClick={() => this.setState({ activeVersion: version }, this.getProductPrice)}
                  ></div>
                ) : (
                  ''
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  render() {
    const { projectId } = getRequest(location.search);
    const {
      selectYear,
      totalPrice,
      userCount,
      bugMethod,
      contractInfo = {},
      orderId,
      editContractVisible,
      activeVersion,
    } = this.state;
    const averageMonthPrice = (totalPrice / 12 / selectYear).toFixed(0);
    const {
      companyName = '',
      geographyId = '',
      address = '',
      postcode = '',
      email = '',
      recipientName = '',
      mobilePhone = '',
    } = contractInfo;
    const isContractInfoIntact =
      companyName && geographyId && address && postcode && email && recipientName && mobilePhone;
    const selectVersionName = _.find(featureDataList, v => v.version === activeVersion).versionName;

    return (
      <div className="versionUpgrade">
        <PayHeader />
        {!!orderId ? (
          this.renderExistOrder()
        ) : (
          <Fragment>
            <div className="priceWrap" ref={node => (this.topDescription = node)}>
              <div className="priceTxt TxtCenter">{_l('价格')}</div>
              <div className="priceDescription TxtCenter">
                {_l('我们力求通过科学的特性组合，让不同需求的用户感到物超所值')}
              </div>
              <div className="versionInfo">
                {versionIntroduction.map(item => {
                  return (
                    <div className="versionInfoItem">
                      <div className="versionName">{item.versionName}</div>
                      <div className="versionDes">*{_l('赠送%0人用户包', item.sendUserPackageNum)}</div>
                      <div className="priceDes">
                        <span className="priceNum">¥{item.yearPrice}</span>/{_l('年')}
                      </div>
                      <div className="average">
                        ￥{item.monthPrice} /{_l('月')}
                      </div>
                      {item.showPurchaseBtn && (
                        <Button className="purchaseBtn Normal" type="ghost" size="large" onClick={this.toPurchase}>
                          {_l('购买')}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {this.renderFeatureDetail()}
            <div className="privateVersion TxtCenter mTop80">
              <div className="title Font32">{_l('应用定制')}</div>
              <div className="mTop24 Font18">{_l('根据贵公司需求量身定制咨询部署顾问')}</div>
              <div className="mTop20">
                {_l('顾问为您按需搭建业务定制应用包。包括销售、营销、生成、研发、运营等业务环节。')}
              </div>
              <div>
                {_l('配置自动化工作流，帮你大幅度降低人力成本。')}
                <a href="https://blog.mingdao.com/category/customer-stories" target="_blank">
                  {_l('查看应用案例')}&gt;
                </a>
              </div>
              <button className="contactUs mTop50 Hand">
                <a
                  href="https://d557778d685be9b5.share.mingdao.net/form/b9cfd9d0f4a84f6798cf0d3235fc4ead?source=%E4%BA%A7%E5%93%81%E5%86%85_%E8%B4%AD%E4%B9%B0%E7%BB%AD%E8%B4%B9"
                  target="_blank"
                >
                  {_l('联系我们')}
                </a>
              </button>
            </div>
            <div className="purchaseInfoWrap flexRow" id="purchaseInfoWrap">
              <div className="versionInfoWrap flex flexColumn pRight30">
                <div className="Gray_75 Font16 LineHeight30">{_l('已选：%0', selectVersionName)}</div>
                <div className="Font14 mRight15 mTop30 mRight15">{_l('使用人数')}</div>
                <div className="slider mTop30 mBottom20">
                  <Slider
                    max={751}
                    min={0}
                    step={5}
                    defaultValue={30}
                    value={userCount}
                    tooltipVisible={true}
                    tipFormatter={value => (userCount <= 750 ? `${value}人` : _l('更多人数'))}
                    onChange={value => {
                      if (value < 30) return;
                      this.setState({ userCount: value });
                    }}
                    onAfterChange={value => {
                      if (value < 30) return;
                      this.setState({ userCount: value }, () => {
                        if (value > 750) return;
                        this.getProductPrice();
                      });
                    }}
                  />
                </div>
                <div className="Font14 mRight15">
                  {_l('购买年限')} <span className="mLeft32">1{_l('年')}</span>
                </div>
                {/* <div className="flexRow mTop16">
                  {Array.from({ length: 3 }).map((item, index) => (
                    <div
                      className={cx('selectYear Hand', { activeYear: selectYear === index + 1 })}
                      onClick={() => this.setState({ selectYear: index + 1 }, this.getProductPrice)}
                    >
                      {_l('%0年', index + 1)}
                    </div>
                  ))}
                </div> */}
                <div className="flex"></div>
                <div className="Font14">{_l('费用总计')}</div>
                {userCount > 750 ? (
                  <a
                    className="hidePrice ming Button Button--primary"
                    target="_blank"
                    href="https://s.mingdao.net/form/fdff452c554747f3aa64484fdfe7a0d4?source=content2819432"
                  >
                    {_l('垂询我们')}
                  </a>
                ) : (
                  <div className="showPrice pBottom20">
                    <div className="ThemeColor mTop10 InlineBlock">
                      <span className="Font28 Bold">￥</span>
                      <span className="LineHeight35 Font44 bold500">{totalPrice}</span>
                    </div>
                    <div className="TxtLeft InlineBlock Gray_9e mLeft10">{_l(' 约%0 /月 ', averageMonthPrice)}</div>
                  </div>
                )}
              </div>
              <div className="payWrap LineHeight36 flex TxtCenter pLeft30s">
                {userCount <= 750 ? (
                  <div className="flexRow Font16 mBottom16">
                    <a href="javascript:void 0;" onClick={() => this.setState({ editContractVisible: true })}>
                      {isContractInfoIntact ? _l('修改合同信息') : _l('完善合同信息')}
                    </a>
                    <a
                      href={`/upgrade/contract?projectId=${projectId}&versionId=${activeVersion}&userCount=${userCount}&selectYear=${selectYear}`}
                      target="_blank"
                      className="Font16 mLeft30"
                    >
                      {_l('合同预览')}
                    </a>
                  </div>
                ) : (
                  ''
                )}
                <div className="companyInfo Font16 TxtLeft">
                  <div className="Gray_9e">{_l('组织信息')}</div>
                  <div>{contractInfo.companyName || _l('组织信息：未填写')}</div>
                  <div>{contractInfo.recipientName || _l('联系人姓名：未填写')}</div>
                  <div>{contractInfo.mobilePhone || _l('联系电话：未填写')}</div>
                </div>
                <div className="LineHeight30 Gray_8 mTop12 Font14 TxtLeft">
                  {_l(
                    ' 如需发票，请拨打400-665-6655联系顾问，为您开具发票；您也可以在完成支付后前往组织管理 - > 账务中心，进行申请。 ',
                  )}
                </div>
                <div className="payMethod">
                  {payMethodList.map(item => {
                    return (
                      <div
                        className={cx('itemBoxContent', { active: bugMethod === item.type })}
                        key={item.type}
                        onClick={() => this.setState({ bugMethod: item.type })}
                      >
                        <span className={`icon-${item.icon} ${item.iconColor} Font24 mRight8`}></span>
                        <span>{item.text}</span>
                      </div>
                    );
                  })}
                </div>
                {userCount <= 750 ? (
                  <Button type="primary" size="large" onClick={this.handlePay}>
                    {_l('在线支付')}
                  </Button>
                ) : (
                  ''
                )}
              </div>
            </div>
          </Fragment>
        )}

        {editContractVisible && (
          <EditContractDialog
            projectId={projectId}
            visible={editContractVisible}
            onCancel={() => this.setState({ editContractVisible: false })}
            updateContractInfo={contractInfo => this.setState({ contractInfo })}
          />
        )}
      </div>
    );
  }
}

const WrappedComp = preall(VersionUpgrade, { allowNotLogin: false });

ReactDOM.render(<WrappedComp />, document.querySelector('#app'));
