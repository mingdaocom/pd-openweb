import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Checkbox } from 'antd';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import orderController from 'src/api/order';
import { getCurrentProject } from 'src/utils/project';
import Config from '../../../config';
import './style.less';

const productList = [50, 100, 500, 1000];

@withRouter
export default class ValueAddService extends Component {
  constructor() {
    super();
    this.state = {
      step: 1,
      isInput: false,
      productPrice: 1000,
      inputValue: _l('自定义'),
      balance: 0,
      needSalesAssistance: true,
      isPay: false,
    };
  }

  //获取余额
  componentDidMount() {
    Config.AdminController.getHidBalance({
      projectId: Config.projectId,
    }).then(balance => {
      this.setState({
        balance: balance ? Number(balance) : 0,
      });
    });
  }

  // 选择金额
  handleChange(productPrice) {
    this.setState({ productPrice, isInput: false, inputValue: _l('自定义') });
  }

  handleInputFocus() {
    const { licenseType } = getCurrentProject(Config.projectId);

    this.setState({
      isInput: true,
      inputValue: Number(this.state.inputValue) ? this.state.inputValue : licenseType === 1 ? 200 : 50,
    });
  }

  handleBack() {
    this.props.history.go(-1);
  }

  //自定义金额
  handleInputChange(e) {
    let tmpPrince = parseInt(e.target.value) || 50;
    if (tmpPrince > 999999) {
      tmpPrince = 999999;
      alert(_l('最多充值金额 999999 信用点'), 3);
    }
    this.setState({
      inputValue: tmpPrince,
    });
  }

  setStep(step) {
    this.setState({ step });
  }

  handleCheckBox(e) {
    this.setState({ needSalesAssistance: e.target.checked });
  }

  handlePay() {
    const _this = this;
    this.setState({ isPay: true });
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
              window.location.href = '/admin/waitingpay/' + Config.projectId + '/' + data.orderId;
            },
          });
        } else {
          _this.setState({ isPay: false });
          alert(_l('操作失败'), 2);
        }
      });
  }

  render() {
    const { step, productPrice, inputValue, isInput, balance, needSalesAssistance, isPay } = this.state;
    const currentPrice = isInput ? inputValue : productPrice;
    return (
      <div className="warpCenter valueAddServerContent">
        <div className="valueAddServerHeader">
          <Icon icon="backspace" className="Hand mRight18 TxtMiddle Font24" onClick={() => this.handleBack()}></Icon>
          <span className="Font17 Bold">{_l('充值信用点')}</span>
        </div>
        <div className="warpOneStep">
          <div className={cx('stepTitle', { color_bd: step !== 1 })}>
            <div className="stepNum">
              <span className="Bold Font12">1</span>
            </div>
            <span>{_l('选择充值信用点')}</span>
          </div>
          <div className={cx('Gray_9 Font13 Normal mTop10', { Hidden: step !== 1 })}>
            {_l('如需特别定制，请联系电话 400-665-6655')}
          </div>
          <div className="stepContent">
            {step === 1 ? (
              <div className="infoEdit">
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
                          inputValue: Number(e.target.value) && Number(e.target.value) >= 50 ? e.target.value : 50,
                        });
                      }}
                    />
                  </li>
                </ul>
                <div>
                  <div className="oneStepLeft">{_l('总计')}</div>
                  <span className="Font20 color_b">￥</span>
                  <span className="Font20 color_b Bold">{currentPrice}</span>
                  <span className="Gray_9 mLeft5">
                    {_l('购买后增值服务账户信用点余额：%0', parseFloat(currentPrice) + parseFloat(balance))}
                  </span>
                </div>
                <div className="pTop30">
                  <button type="button" className="ming Button Button--primary nextBtn" onClick={() => this.setStep(2)}>
                    {_l('下一步')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="infoShow">
                <div className="mTop16 mBottom24 Font13 Gray_9">
                  <span className="mRight8">{_l('总计')}</span>
                  <span>￥{currentPrice}</span>
                </div>
                <button
                  type="button"
                  className="ming Button Button--link ThemeColor3 pAll0 Hover_49"
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
          <div className={cx('stepTitle', { color_bd: step !== 2 })}>
            <div className="stepNum">
              <span className="Bold Font12">2</span>
            </div>
            <span>{_l('生成订单')}</span>
          </div>
          <div className={cx('stepContent', { Hidden: step !== 2 })}>
            <div className="mTop30">
              <span className="Font13 mRight8 Gray_9">{_l('总计：')}</span>
              <span className="Font24 Bold color_b">￥{currentPrice}</span>
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
}
