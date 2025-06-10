import React, { Component, Fragment } from 'react';
import { ActionSheet } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import { Button, Dialog, FunctionWrap, Icon, LoadDiv, Qr, Radio } from 'ming-ui';
import paymentAjax from 'src/api/payment';
import webCacheAjax from 'src/api/webCache';
import { browserIsMobile } from 'src/utils/common';
import { formatNumberThousand } from 'src/utils/control';
import PayErrorIcon from '../components/PayErrorIcon';
import { getOrderStatusInfo } from '../config';
import jxqfImg from '../images/jxqf.png';
import { formatDate } from '../util';
import './index.less';

const PAY_CHANNEL = [
  { value: 0, label: _l('聚合支付') },
  { value: 2, label: _l('微信支付'), icon: 'wechat_pay' },
  { value: 1, label: _l('支付宝支付'), icon: 'order-alipay' },
];
export default class PrePayOrder extends Component {
  constructor(props) {
    super(props);

    this.state = {
      preOrderInfo: {},
      orderInfo: {},
      loading: false,
      orderId: props.orderId,
      activePayChannel: undefined,
      selectedMerchants: [], // 工作表支付配置中选中的商户列表
    };
    this.conformAction = null;
  }

  componentDidMount() {
    this.props.orderId ? this.getData() : this.handlePrePayOrder();
    if (!browserIsMobile()) return;

    // 监听h5浏览器返回
    window.addEventListener('popstate', this.handleBack, false);
  }

  componentWillUnmount() {
    if (!browserIsMobile()) return;
    window.removeEventListener('popstate', this.handleBack, false);
  }

  handleBack = () => {
    this.props.onCancel();
  };

  // 生成预检订单
  handlePrePayOrder = async () => {
    const { worksheetId, rowId, paymentModule, projectId, appId, payNow } = this.props;
    const isMobile = browserIsMobile();

    this.setState({ loading: true });

    let selectedMerchants = [];
    try {
      selectedMerchants = await paymentAjax.getPaymentSettingSelectedMerchants(
        { worksheetId, projectId, appId },
        { silent: true },
      );
    } catch ({ errorCode, errorMessage }) {
      this.setState({ orderStatus: errorCode ? errorCode : -1, errorMessage, loading: false });
      return;
    }

    if (selectedMerchants.length > 1 || !payNow) {
      // 多商户 || 未开启立即支付
      const promise = paymentAjax.getPrePayOrder({ worksheetId, rowId, paymentModule }, { silent: true });
      promise
        .then(res => {
          const activePayChannel =
            isMobile && selectedMerchants.length
              ? selectedMerchants[0].merchantPaymentChannel
              : selectedMerchants.length === 1
                ? selectedMerchants[0].merchantPaymentChannel
                : undefined;

          if (res.status !== 0) {
            this.setState({
              orderInfo: res,
              orderStatus: res.status,
              loading: false,
              selectedMerchants,
              activePayChannel,
            });
          } else {
            this.setState({
              preOrderInfo: res,
              orderStatus: res.status,
              loading: false,
              selectedMerchants,
              activePayChannel,
            });
          }
        })
        .catch(({ errorCode, errorMessage }) => {
          this.setState({ orderStatus: errorCode ? errorCode : -1, errorMessage, loading: false });
        });
    } else {
      // 仅一个商户&开启立即支付
      this.setState({ selectedMerchants });
      this.handlePay(selectedMerchants);
    }
  };

  // 创建订单
  handlePay = merchants => {
    const { worksheetId, rowId, paymentModule, onUpdateSuccess = () => {}, onCancel = () => {} } = this.props;
    const { orderInfo = {}, preOrderInfo = {}, selectedMerchants = [], activePayChannel } = this.state;
    const selectedMerchantNo = (
      _.find(merchants || selectedMerchants, v => v.merchantPaymentChannel === activePayChannel) || {}
    ).merchantNo;

    this.setState({ payLoading: true });

    paymentAjax
      .createOrder({ worksheetId, rowId, paymentModule, merchantNo: selectedMerchantNo })
      .then(res => {
        if (res && res.orderId) {
          if (preOrderInfo.amount <= 0) {
            this.setState(
              { orderInfo: { ...orderInfo, orderId: res.orderId }, loading: true, payLoading: false },
              this.checkPayOrder,
            );
          } else if (browserIsMobile()) {
            this.setState({ payLoading: false });
            // 微信环境下保存当前url用于商家小票返回商家
            if (window.isWeiXin) {
              webCacheAjax.add({
                key: `${res.orderId}`,
                value:
                  paymentModule !== 3 || (paymentModule === 3 && !location.pathname.includes('portal'))
                    ? location.origin
                    : `${location.origin}/portal`,
              });
            }
            onCancel();
            location.href = `${md.global.Config.WebUrl}orderpay/${res.orderId}`;
          } else {
            this.setState({ orderId: res.orderId, payLoading: false }, () => this.getData());
          }
          onUpdateSuccess({ orderId: res.orderId });
        } else {
          this.setState({ orderStatus: res, loading: false, payLoading: false });
        }
      })
      .catch(({ errorCode, errorMessage }) => {
        this.setState({ orderStatus: errorCode ? errorCode : -1, errorMessage, loading: false });
      });
  };

  // 获取订单信息
  getData = async orderId => {
    const { orderStatus } = this.state;
    orderId = orderId ? orderId : this.state.orderId;

    this.setState({ loading: orderStatus === 4 ? false : true });

    const orderInfo = await paymentAjax.getPayOrder({ orderId: orderId });
    orderInfo.msg = orderInfo.status === 8 ? _l('订单已取消') : orderInfo.msg;
    const { status, msg, expireCountdown, amount, expireTime } = orderInfo || {};

    if (status !== 0) {
      this.setState({ orderInfo, orderStatus: status, loading: false, errorMessage: msg });
      return;
    }
    this.setState({ orderInfo, loading: false, orderStatus: status, expireCountdown });
    amount > 0 && this.pollOrderStatus(orderInfo);
    expireTime !== 0 && amount <= 0 && this.handleCountDown(expireCountdown);
  };

  // 无需支付时时效倒计时
  handleCountDown = expireCountdown => {
    if (expireCountdown > 0) {
      this.setState({ expireCountdown }, () => {
        setTimeout(() => this.handleCountDown(expireCountdown - 1), 1000);
      });
    } else {
      this.setState({ orderStatus: 4 });
    }
  };

  // 轮询订单状态
  pollOrderStatus = (orderInfo = {}) => {
    const { onUpdateSuccess = () => {}, payFinished = () => {}, paySuccessReturnUrl, onCancel, notDialog } = this.props;
    const { orderId } = orderInfo;

    paymentAjax.getPayOrderStatus({ orderId }).then(({ status, expireCountdown, msg, amount, description }) => {
      msg = status === 8 ? _l('订单已取消') : msg;

      if (status === 1 && paySuccessReturnUrl) {
        notDialog
          ? window.parent.postMessage({ type: 'navigate', returnUrl: decodeURIComponent(paySuccessReturnUrl) })
          : (location.href = paySuccessReturnUrl);
        return;
      }

      if (_.includes([1, 4], status)) {
        this.getData();
        onUpdateSuccess({ orderStatus: status, onCancel });
        payFinished({ onCancel, isSuccess: status === 1 });
      } else {
        this.setState(
          {
            orderStatus: orderInfo.expireTime !== 0 && expireCountdown < 0 && !msg ? 4 : status,
            expireCountdown,
            orderInfo: !!msg ? { ...orderInfo, status, msg, description } : { ...orderInfo, amount, description },
          },
          () => {
            if (amount === 0 && !msg) {
              this.handleCountDown(expireCountdown);
            }
            if (!!msg || amount === 0) return;

            setTimeout(() => {
              this.pollOrderStatus(orderInfo);
            }, 1000);
          },
        );
      }
    });
  };

  // 检查订单<=0的订单
  checkPayOrder = () => {
    const { orderInfo = {} } = this.state;
    const { paySuccessReturnUrl, payFinished = () => {}, onCancel } = this.props;
    const { orderId } = orderInfo;

    paymentAjax.checkPayOrder({ orderId }).then(({ payedResult, orderId }) => {
      if (payedResult) {
        payFinished({ onCancel, isSuccess: true });
        if (paySuccessReturnUrl) {
          location.href = paySuccessReturnUrl;
        } else if (browserIsMobile()) {
          location.href = `${md.global.Config.WebUrl}orderpay/${orderId}`;
        } else {
          this.setState({ orderInfo: { ...orderInfo, status: 1 }, orderStatus: 1, loading: false });
        }
      } else {
        this.getData(orderId);
      }
    });
  };

  // 已生成订单
  renderOrderInfo = () => {
    const { title, paymentModule } = this.props;
    const { orderInfo = {}, expireCountdown } = this.state;
    const {
      description,
      amount = 0,
      orderId,
      aliPayStatus,
      wechatPayStatus,
      createTime,
      shortName,
      expireTime,
      status,
      msg,
    } = orderInfo;
    const m = Math.floor((expireCountdown / 60) % 60);
    const s = Math.floor(expireCountdown % 60);
    const timeMsg = m > 0 && s > 0 ? _l('%0分%1秒', m, s) : m > 0 ? _l('%0分', m) : s > 0 ? _l('%0秒', s) : '';

    return (
      <div className="orderPayWrap">
        <div className="Font24 bold mBottom24">{title ? title : amount <= 0 ? _l('确认订单') : _l('扫码支付')}</div>
        {description && <div className="Font15 mBottom16">{_l('支付内容：%0', description)}</div>}
        <div className="Font15 mBottom16">{_l('订单编号：%0', orderId)}</div>
        <div className="Font15 mBottom16">{_l('收款方：%0', shortName)}</div>
        <div className="Font15 mBottom16">{_l('下单时间：%0', formatDate(createTime))}</div>
        <div
          className={cx('orderPayCon flexRow', { 'flexColumn justifyContentCenter alignItemsCenter ': status !== 0 })}
        >
          {status !== 0 ? (
            <Fragment>
              <PayErrorIcon />
              <div className="Red mTop20 Font17">
                {_.includes([50, 70, 73, 74], status) ? _l('未查询到支付内容或付款金额！') : msg}
              </div>
            </Fragment>
          ) : (
            <Fragment>
              <div className="flex pLeft25 amountWrap">
                <div className="Font15 bold">
                  {_l('应付金额：')}
                  <span className="amount Font40 ThemeColor">¥{amount <= 0 ? 0 : formatNumberThousand(amount)}</span>
                </div>
                {paymentModule === 5 ? null : expireTime === 0 ? (
                  <div className="Font15">
                    {amount <= 0 ? _l('订单已生成，请完成确认') : _l('订单已生成，请使用移动设备扫码完成支付')}
                  </div>
                ) : m > 0 || s > 0 ? (
                  <div className="Font15">
                    {amount <= 0
                      ? _l('订单已生成，请于 %0 内完成确认', timeMsg)
                      : _l('订单已生成，请于 %0 内完成支付', timeMsg)}
                  </div>
                ) : null}
              </div>
              {amount <= 0 ? (
                <Button className="okPay mRight24 mTop106" onClick={this.checkPayOrder}>
                  {_l('确认')}
                </Button>
              ) : (
                <div style={{ paddingTop: 22 }}>
                  <div className="qrCode">
                    <Qr content={`${md.global.Config.WebUrl}orderpay/${orderId}`} width={140} height={140} />
                  </div>
                  <div
                    className="flexRow alignItemsCenter justifyContentCenter mBottom10 mTop6"
                    style={{ width: 180, margin: '0 auto' }}
                  >
                    {aliPayStatus === 2 && (
                      <Fragment>
                        <i className="icon-zhifubao aliColor Font28 TxtMiddle" />
                        <span className={cx('mLeft6', { mRight20: wechatPayStatus === 2 })}>{_l('支付宝')}</span>
                      </Fragment>
                    )}
                    {wechatPayStatus === 2 && (
                      <Fragment>
                        <i className="icon-invite-wechat weChatColor Font20 TxtMiddle" />
                        <span className="mLeft6 mRight6">{_l('微信')}</span>
                      </Fragment>
                    )}
                  </div>
                </div>
              )}
            </Fragment>
          )}
        </div>
      </div>
    );
  };

  // 支付状态
  renderPayStatus = () => {
    const { errorMessage, orderInfo = {} } = this.state;
    const orderStatus = errorMessage || orderInfo.msg ? -1 : this.state.orderStatus;
    const { text, icon, color } = getOrderStatusInfo(orderStatus, errorMessage || orderInfo.msg) || {};

    return (
      <div className="payStatusWrap flexColumn alignItemsCenter justifyContentCenter">
        {orderStatus === 4 ? (
          <i className={`overTimeIcon icon ${icon}`} />
        ) : (
          <div
            className="okIcon"
            style={_.includes([1, 2, 3, 5], orderStatus) ? { background: color } : { color, fontSize: '44px' }}
          >
            <i className={`icon ${icon}`} />
          </div>
        )}
        <div className="Font24 bold mBottom24">{errorMessage || text}</div>

        {orderInfo.orderId && !orderInfo.msg && (
          <Button
            className="okPay"
            onClick={() => {
              window.open(`${md.global.Config.WebUrl}orderpay/${orderInfo.orderId}`);
            }}
          >
            {_l('查看订单')}
          </Button>
        )}
      </div>
    );
  };

  // 放弃支付
  handleConfirmCancelPay = () => {
    const { isPaySuccessAddRecord, cancelPayCallback = () => {}, onCancel = () => {} } = this.props;
    const { orderInfo = {}, orderStatus } = this.state;
    const { status } = orderInfo;
    const isMobile = browserIsMobile();

    if (isPaySuccessAddRecord && (status === 0 || orderStatus == 0)) {
      if (isMobile) {
        this.conformAction = ActionSheet.show({
          popupClassName: 'md-adm-actionSheet',
          actions: [],
          extra: (
            <div className="flexColumn w100">
              <div className="bold Gray Font17 pTop10">{_l('您确定放弃支付？')}</div>
              <div className="Font13 Gray_9e mBottom10">{_l('放弃支付后，当前填写的表单数据不会提交')}</div>
              <div className="valignWrapper flexRow confirm mTop24">
                <Button
                  radius
                  className="flex mRight6 bold Gray_75 flex ellipsis Font13 cancelPayBtn"
                  onClick={() => this.conformAction.close()}
                >
                  {_l('取消')}
                </Button>
                <Button
                  radius
                  className="flex mLeft6 bold flex ellipsis Font13"
                  onClick={() => {
                    this.conformAction.close();
                    cancelPayCallback();
                    onCancel();
                  }}
                >
                  {_l('确定')}
                </Button>
              </div>
            </div>
          ),
        });
      } else {
        Dialog.confirm({
          title: _l('您确定放弃支付？'),
          description: _l('放弃支付后，当前填写的表单数据不会提交'),
          onOk: () => {
            cancelPayCallback();
            onCancel();
          },
        });
      }
    } else {
      onCancel();
    }
  };

  render() {
    const { onCancel = () => {}, notDialog, isPaySuccessAddRecord } = this.props;
    const {
      loading,
      preOrderInfo = {},
      orderInfo = {},
      orderStatus,
      errorMessage,
      payLoading,
      activePayChannel,
      selectedMerchants = [],
    } = this.state;
    const { amount, description } = preOrderInfo;
    const isMobile = browserIsMobile();
    const isAli = navigator.userAgent.toLowerCase().indexOf('alipay') !== -1; // 支付宝环境
    const channels = isAli ? [0, 1] : window.isWeiXin ? [0, 2] : [0, 1, 2];

    const payChannels = selectedMerchants
      .filter(v => (isMobile ? _.includes(channels, v.merchantPaymentChannel) : true))
      .map(item => _.find(PAY_CHANNEL, v => v.value === item.merchantPaymentChannel));

    return (
      <Dialog
        dialogClasses={cx({ payNowContainer: notDialog })}
        overlayClosable={false}
        className={isMobile ? 'mobilePayOrderDialog' : 'payOrderDialog'}
        visible
        closable={!isMobile && !notDialog}
        footer={null}
        width={800}
        onCancel={this.handleConfirmCancelPay}
      >
        {loading ? (
          <div className={cx('loadingWrap', { notDialog })}>
            <LoadDiv />
          </div>
        ) : _.includes([1, 2, 3, 4, 5], orderStatus) ? (
          this.renderPayStatus()
        ) : orderInfo.orderId ? (
          this.renderOrderInfo()
        ) : orderStatus || errorMessage ? (
          <div className="preOrderWrap flexColumn alignItemsCenter justifyContentCenter">
            {!isPaySuccessAddRecord && <div className="Font24 bold mBottom30">{_l('表单已提交')}</div>}
            <PayErrorIcon />
            <div className="Red mTop20 Font17">
              {_.includes([50, 70, 73, 74], orderStatus)
                ? _l('未查询到支付内容或付款金额！')
                : orderInfo.msg || errorMessage}
            </div>
            {isMobile && <div className="flex"></div>}
            <Button className={cx('mTop30 okPay', { 'w100 mobileOkPay': isMobile })} onClick={onCancel}>
              {_l('确认')}
            </Button>
          </div>
        ) : (
          <div className="preOrderWrap">
            <div className={cx('bold Font24', { mBottom16: isMobile })}>{description}</div>
            <div className="ThemeColor bold mBottom10 mTop10">
              <span className="Font50 amount">¥ {amount <= 0 ? 0 : formatNumberThousand(amount)}</span>
            </div>

            {payChannels.length > 1 ? (
              <Fragment>
                {isMobile ? (
                  <Fragment>
                    <div className="line"></div>
                    <div className="TxtLeft">{_l('支付方式')}</div>
                    <div className="mobilePayChannel flex">
                      {payChannels.map(item => {
                        return (
                          <div className="mobilePayChannelItem flexCenter">
                            <div
                              className={cx('channelIcon', {
                                wechatBgColor: item.value === 2,
                                aliBgColor: item.value === 1,
                              })}
                            >
                              {item.value === 0 ? (
                                <img src={jxqfImg} className="w100" />
                              ) : (
                                <Icon icon={item.icon} className="Font24" />
                              )}
                            </div>
                            <div className="flex Font15 bold TxtLeft">{item.label}</div>
                            <Radio
                              className="mRight0"
                              checked={activePayChannel === item.value}
                              onClick={checked => this.setState({ activePayChannel: item.value })}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </Fragment>
                ) : (
                  <div className="payChannel valignWrapper justifyContentCenter">
                    {payChannels.map(item => {
                      return (
                        <div
                          className={cx('payChannelItem valignWrapper justifyContentCenter Relative Hand', {
                            activePayChannel: activePayChannel === item.value,
                          })}
                          onClick={() => this.setState({ activePayChannel: item.value }, this.handlePay)}
                        >
                          <div
                            className={cx('channelIcon', {
                              wechatBgColor: item.value === 2,
                              aliBgColor: item.value === 1,
                            })}
                          >
                            {item.value === 0 ? (
                              <img src={jxqfImg} className="w100" />
                            ) : (
                              <Icon icon={item.icon} className="Font24" />
                            )}
                          </div>
                          <div>{item.label}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Fragment>
            ) : isMobile ? (
              <div className="flex"></div>
            ) : (
              ''
            )}
            {(isMobile || payChannels.length) && (
              <div className="flexRow justifyContentCenter">
                {isMobile && (
                  <div
                    className={cx('cancelPay Font14 Hand', { 'flex mRight6': isMobile })}
                    onClick={this.handleConfirmCancelPay}
                  >
                    {_l('放弃支付')}
                  </div>
                )}
                {(payChannels.length <= 1 || isMobile) && (
                  <Button
                    disabled={payLoading}
                    className={cx('okPay', { 'flex mobilePay mLeft6': isMobile })}
                    onClick={() => this.handlePay()}
                  >
                    {payLoading ? (
                      _l('处理中...')
                    ) : isMobile ? (
                      _l('支付')
                    ) : (
                      <Fragment>
                        <i className="icon icon-payment3 mRight5 TxtMiddle Font16" />
                        <span className="TxtMiddle">{_l('立即支付')}</span>
                      </Fragment>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </Dialog>
    );
  }
}

export const handlePrePayOrder = props => FunctionWrap(PrePayOrder, { ...props });
