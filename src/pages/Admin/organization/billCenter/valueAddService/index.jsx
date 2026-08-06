import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Checkbox } from 'antd';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import agentAjax from 'src/api/agent';
import orderController from 'src/api/order';
import { pathCompletion } from 'src/utils/common';
import { getCurrentProject } from 'src/utils/project';
import Config from '../../../config';
import './style.less';

const productList = [100, 500, 1000, 5000];
const DEFAULT_PRODUCT_PRICE = 5000;
const CUSTOM_PRODUCT_PRICE = 10000;
const MIN_PRODUCT_PRICE = 50;
const MAX_PRODUCT_PRICE = 999999;
const RECHARGE_GIFT_THRESHOLD = 5000;
const RECHARGE_GIFT_POINT = 1000;
const RECHARGE_GIFT_END_TIME = new Date('2026/08/01 00:00:00').getTime();

const getRechargeGiftPoint = price => {
  const amount = Number(price) || 0;
  return Math.floor(amount / RECHARGE_GIFT_THRESHOLD) * RECHARGE_GIFT_POINT;
};

const isRechargeGiftInDate = () => Date.now() < RECHARGE_GIFT_END_TIME;

const isPaidSaasProject = project => {
  const { isOverseas, isLocal } = window.platformENV || {};
  const licenseType = Number(project.licenseType);
  return !isOverseas && !isLocal && licenseType === 1;
};

let ValueAddService = class ValueAddService extends Component {
  constructor() {
    super();
    this.state = {
      step: 1,
      isInput: false,
      productPrice: DEFAULT_PRODUCT_PRICE,
      inputValue: _l('自定义'),
      balance: 0,
      aiWelfarePointBalance: 0,
      needSalesAssistance: true,
      isPay: false,
    };
  } //获取余额

  componentDidMount() {
    Config.AdminController.getHidBalance({
      projectId: Config.projectId,
    }).then(balance => {
      this.setState({
        balance: balance ? Number(balance) : 0,
      });
    });
    this.getAIWelfarePointBalance();
  } // 选择金额

  getProjectInfo() {
    return getCurrentProject(Config.projectId) || {};
  }

  isRechargeGiftAvailable() {
    return isPaidSaasProject(this.getProjectInfo()) && isRechargeGiftInDate();
  }

  getAIWelfarePointBalance() {
    if (!this.isRechargeGiftAvailable()) return;

    agentAjax
      .getAgentBillingFreeQuota({ projectId: Config.projectId }, { silent: true })
      .then(res => {
        this.setState({
          aiWelfarePointBalance: Number((res && res.data && res.data.remainingCredits) || 0),
        });
      })
      .catch(() => {
        this.setState({ aiWelfarePointBalance: 0 });
      });
  }

  handleChange(productPrice) {
    this.setState({
      productPrice,
      isInput: false,
      inputValue: _l('自定义'),
    });
  }

  handleInputFocus() {
    this.setState({
      isInput: true,
      inputValue: Number(this.state.inputValue) ? this.state.inputValue : CUSTOM_PRODUCT_PRICE,
    });
  }

  handleBack() {
    this.props.history.go(-1);
  } //自定义金额

  handleInputChange(e) {
    let tmpPrince = parseInt(e.target.value) || MIN_PRODUCT_PRICE;

    if (tmpPrince > MAX_PRODUCT_PRICE) {
      tmpPrince = MAX_PRODUCT_PRICE;
      alert(_l('最多充值金额 %0 信用点', MAX_PRODUCT_PRICE), 3);
    }

    this.setState({
      inputValue: tmpPrince,
    });
  }

  setStep(step) {
    this.setState({
      step,
    });
  }

  handleCheckBox(e) {
    this.setState({
      needSalesAssistance: e.target.checked,
    });
  }

  handlePay() {
    const _this = this;

    this.setState({
      isPay: true,
    });
    const { isInput, inputValue, productPrice, needSalesAssistance } = this.state;
    const currentPrice = isInput ? inputValue : productPrice;
    orderController
      .addRechargeOrder({
        projectId: Config.projectId,
        amount: currentPrice,
        needSalesAssistance,
      })
      .then(function (data) {
        if (data) {
          alert({
            msg: _l('订单已创建成功，正在转到付款页...'),
            duration: 500,
            onClose: function () {
              window.location.href = pathCompletion(`/admin/waitingpay/${Config.projectId}/${data.orderId}`);
            },
          });
        } else {
          _this.setState({
            isPay: false,
          });

          alert(_l('操作失败'), 2);
        }
      });
  }

  render() {
    const { step, productPrice, inputValue, isInput, balance, aiWelfarePointBalance, needSalesAssistance, isPay } =
      this.state;
    const currentPrice = isInput ? inputValue : productPrice;
    const showRechargeGift = this.isRechargeGiftAvailable();
    const giftPoint = showRechargeGift ? getRechargeGiftPoint(currentPrice) : 0;
    const aiWelfarePointAfterRecharge = aiWelfarePointBalance + giftPoint;

    return (
      <div className="warpCenter valueAddServerContent">
        <div className="valueAddServerHeader">
          <Icon icon="backspace" className="Hand mRight18 TxtMiddle Font24" onClick={() => this.handleBack()}></Icon>
          <span className="Font17 Bold">{_l('充值信用点')}</span>
        </div>
        <div className="warpOneStep">
          <div
            className={cx('stepTitle', {
              color_bd: step !== 1,
            })}
          >
            <div className="stepNum">
              <span className="Bold Font12">1</span>
            </div>
            <span>{_l('选择充值信用点')}</span>
          </div>
          <div
            className={cx('textTertiary Font13 Normal mTop10', {
              Hidden: step !== 1,
            })}
          >
            {_l('如需特别定制，请联系电话 400-665-6655')}
          </div>
          <div className="stepContent">
            {step === 1 ? (
              <div className="infoEdit">
                {showRechargeGift && (
                  <div className="rechargeGiftActivity">
                    <div className="flexRow alignItemsCenter">
                      <span className="Font14 Bold textPrimary">{_l('充值活动')}</span>
                      <span className="giftActivityTag mLeft10">{_l('限时优惠')}</span>
                    </div>
                    <div className="Font13 textSecondary mTop12">
                      {_l('单次充值满')} <span className="textPrimary Bold">{RECHARGE_GIFT_THRESHOLD}</span>
                      {_l(' 信用点，赠送 ')}
                      <span className="textPrimary Bold">{RECHARGE_GIFT_POINT}</span>
                      {_l(' AI 福利点；多充多送可叠加。')}
                    </div>
                    <div className="Font13 textSecondary mTop8">{_l('活动截止时间：2026 年 7 月 31 日。')}</div>
                  </div>
                )}
                <ul className="viewRow productList">
                  {productList.map((item, index) => {
                    return (
                      <li
                        key={index}
                        onClick={() => this.handleChange(item)}
                        className={cx(productPrice === item && !isInput ? 'selectProduct' : '')}
                      >
                        {item}
                      </li>
                    );
                  })}
                  <li className={cx(isInput ? 'selectProduct' : '')}>
                    <input
                      type="text"
                      className="txtCustomPrice"
                      placeholder={_l('请输入信用点')}
                      value={inputValue}
                      onFocus={this.handleInputFocus.bind(this)}
                      onChange={e => this.handleInputChange(e)}
                      onBlur={e => {
                        this.setState({
                          inputValue:
                            Number(e.target.value) && Number(e.target.value) >= MIN_PRODUCT_PRICE
                              ? e.target.value
                              : MIN_PRODUCT_PRICE,
                        });
                      }}
                    />
                  </li>
                </ul>
                <div>
                  <div className="oneStepLeft">{_l('总计')}</div>
                  <span className="Font20 color_b">￥</span>
                  <span className="Font20 color_b Bold">{currentPrice}</span>
                  <span className="textTertiary mLeft5">
                    {_l('购买后增值服务账户信用点余额：%0', parseFloat(currentPrice) + parseFloat(balance))}
                  </span>
                  {giftPoint > 0 && (
                    <span className="textTertiary mLeft24">{_l('AI 福利点余额：%0', aiWelfarePointAfterRecharge)}</span>
                  )}
                </div>
                <div className="pTop30">
                  <button type="button" className="ming Button Button--primary nextBtn" onClick={() => this.setStep(2)}>
                    {_l('下一步')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="infoShow">
                <div className="mTop16 mBottom24 Font13 textTertiary">
                  <span className="mRight8">{_l('总计')}</span>
                  <span>￥{currentPrice}</span>
                </div>
                <button
                  type="button"
                  className="ming Button Button--link colorPrimary pAll0 hoverColorPrimaryLight"
                  onClick={() => this.setStep(1)}
                >
                  {_l('修改')}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="stepDiviceLine"></div>
        <div className="warpTowStep">
          <div
            className={cx('stepTitle', {
              color_bd: step !== 2,
            })}
          >
            <div className="stepNum">
              <span className="Bold Font12">2</span>
            </div>
            <span>{_l('生成订单')}</span>
          </div>
          <div
            className={cx('stepContent', {
              Hidden: step !== 2,
            })}
          >
            <div className="mTop30">
              <span className="Font13 mRight8 textTertiary">{_l('总计：')}</span>
              <span className="Font24 Bold color_b">￥{currentPrice}</span>
              {giftPoint > 0 && (
                <span className="Font13 textTertiary mLeft24">
                  {_l('AI 福利点余额：%0', aiWelfarePointAfterRecharge)}
                </span>
              )}
            </div>
            <div className="pTop40">
              <button
                type="button"
                disabled={isPay}
                className="ming Button Button--primary nextBtn"
                onClick={() => this.handlePay()}
              >
                {_l('确认下单')}
              </button>
            </div>
            <div className="warpNeedHelp">
              <Checkbox onChange={this.handleCheckBox.bind(this)} checked={needSalesAssistance}>
                {' '}
                {_l('我希望得到销售代表的协助')}{' '}
              </Checkbox>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
ValueAddService = withRouter(ValueAddService);
export default ValueAddService;
