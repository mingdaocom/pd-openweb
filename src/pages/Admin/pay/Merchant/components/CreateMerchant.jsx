import React, { Component, Fragment } from 'react';
import { Checkbox, Icon, Button, LoadDiv, Qr, Tooltip } from 'ming-ui';
import { Steps } from 'antd';
import projectAjax from 'src/api/project';
import paymentAjax from 'src/api/payment';
import styled from 'styled-components';
import { STEPS } from '../config';
import aliQrCode from 'src/pages/Admin/pay/images/aliQrCode.png';
import wechatQrCode from 'src/pages/Admin/pay/images/wechatQrCode.png';
import cx from 'classnames';
import _ from 'lodash';
import './createMerchant.less';

const Header = styled.div`
  .icon-backspace {
    vertical-align: text-top;
  }
`;

const StepsWrap = styled(Steps)`
  height: 235px;
  width: unset !important;
  .ant-steps-item-title {
    font-weight: 700;
    margin-bottom: 60px;
  }
  .ant-steps-item-process .ant-steps-item-title {
    color: #1890ff !important;
  }
  .ant-steps-item-icon {
    width: 28px;
    height: 28px;
    line-height: 26px;
    border-radius: 28px;
    font-weight: 500;
  }
  .ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-tail::after,
  .ant-steps-item-wait > .ant-steps-item-container > .ant-steps-item-tail::after {
    background-color: #e0e0e0;
  }
  .ant-steps-item > .ant-steps-item-container > .ant-steps-item-tail {
    padding: 31px 0 3px !important;
    left: 14px !important;
  }
  .ant-steps-item-wait .ant-steps-item-icon {
    background-color: #f5f5f5;
    border: 1px solid #f5f5f5;
  }
  .ant-steps-item-finish .ant-steps-item-icon {
    background-color: rgba(33, 150, 243, 0.1);
    border-color: transparent;
  }
  &.isFinished {
    .ant-steps-item:first-child > .ant-steps-item-container > .ant-steps-item-tail::after {
      background-color: #1890ff !important;
    }
    .ant-steps-item.customTail > .ant-steps-item-container > .ant-steps-item-tail::after {
      background-color: #e0e0e0 !important;
    }
  }
`;

const DivideLine = styled.div`
  width: 1px;
  border-right: 1px solid #f0f0f0;
  margin: -24px 34px 0 30px;
`;

const Prompt = styled.div`
  width: 409px;
  line-height: 1;
  padding: 17px 0;
  background: #f8f8f8;
  border-radius: 6px;
  padding-left: 16px;
  margin-left: 30px;
`;

const IconWrap = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #fff;
  margin-right: 10px;
  &.wechatBgColor {
    background: #48b338;
  }
  &.aliBgColor {
    background: #02a9f1;
  }
`;

const Erweima = styled.div`
  width: 200px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-sizing: border-box;
  overflow: hidden;
  img {
    display: inline-block;
    width: 100%;
    height: 100%;
  }
`;

const Description = styled.div`
  background: rgba(33, 150, 243, 0.05);
  border-radius: 5px;
  padding: 8px 10px;
  color: #9e9e9e;
  margin-bottom: 20px;
  color: #151515;
`;

const { Step } = Steps;

export default class CreateMerchant extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: props.createStep || 0,
      aliPayStatus: !_.isUndefined(_.get(props, 'currentMerchantInfo.aliPayStatus'))
        ? _.get(props, 'currentMerchantInfo.aliPayStatus')
        : 1,
      wechatPayStatus: !_.isUndefined(_.get(props, 'currentMerchantInfo.wechatPayStatus'))
        ? _.get(props, 'currentMerchantInfo.wechatPayStatus')
        : 1,
      merchantId: (props.currentMerchantInfo || {}).id,
      merchantStatus: (props.currentMerchantInfo || {}).status,
      loading: false,
      merchant: {},
    };
    this.timeInterval = null;
    this.promise = null;
  }

  componentDidMount() {
    const { currentMerchantInfo = {}, createStep } = this.props;
    const { merchantStatus } = this.state;
    if (createStep === 0) {
      this.getWeiXinBindingInfo();
    }
    if (_.includes([0, 1, 2], merchantStatus)) {
      this.getMerchant({ isPoll: merchantStatus === 0 ? true : false });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.createStep !== this.props.createStep) {
      this.setState({ step: nextProps.createStep });
    }
    if (nextProps.currentMerchantInfo !== this.props.currentMerchantInfo) {
      this.setState({
        aliPayStatus: nextProps.currentMerchantInfo.aliPayStatus,
        wechatPayStatus: nextProps.currentMerchantInfo.wechatPayStatus,
        merchantStatus: nextProps.currentMerchantInfo.status,
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.timeInterval);

    this.props.getDataList();
  }

  // 获取微信服务号是否授权
  getWeiXinBindingInfo = () => {
    const { projectId, currentMerchantInfo = {} } = this.props;
    const { merchant = {} } = this.state;

    projectAjax.getWeiXinBindingInfo({ projectId }).then((res = []) => {
      this.setState({
        bindWeixin: !_.isEmpty(res),
        wechatPayStatus:
          _.isEmpty(merchant) && _.isEmpty(currentMerchantInfo) ? !_.isEmpty(res) : merchant.wechatPayStatus,
      });
    });
  };

  // 获取商户信息
  getMerchant = ({ isPoll, isOpen } = {}) => {
    const { projectId, currentMerchantInfo = {} } = this.props;
    const { merchantNo } = currentMerchantInfo;
    const { merchantId } = this.state;
    this.setState({ loading: true });

    paymentAjax
      .getMerchant({
        projectId,
        merchantNo,
        merchantId,
      })
      .then(res => {
        this.setState({ merchant: res, loading: false, merchantId: res.id });
        if (res.status === 3) {
          this.setState({ step: 3 });
          return;
        }
        if (isPoll && res.status === 0) {
          this.pollGetMerchantStatus({ merchantId: res.id, merchantNo: res.merchantNo });
        }
        if (isOpen) {
          this.updateMerchantStatus({ merchantId: res.id, merchantNo: res.merchantNo, status: 2 });
        }
      });
  };

  // 更新商户状态
  updateMerchantStatus = ({ merchantNo, status } = {}) => {
    const { projectId, currentMerchantInfo = {}, updateCurrentMerchant = () => {} } = this.props;
    paymentAjax
      .editMerchantStatus({
        projectId,
        merchantNo,
        status,
      })
      .then(res => {
        if (res) {
          updateCurrentMerchant({ ...currentMerchantInfo, status });
        }
      });
  };

  // 轮询获取商户状态
  pollGetMerchantStatus = ({ merchantId, merchantNo } = {}) => {
    const { projectId, currentMerchantInfo } = this.props;
    const { step } = this.state;

    this.timeInterval = setInterval(() => {
      if (this.promise && this.promise.abort && _.isFunction(this.promise.abort)) {
        this.promise.abort();
      }

      this.promise = paymentAjax
        .getMerchantStatus({
          projectId,
          merchantId,
          merchantNo,
        })
        .then(res => {
          if (res === 1) {
            this.getMerchant();
          }
          if (res) {
            clearInterval(this.timeInterval);
            this.setState({ merchantStatus: res, step: _.includes([1, 2], res) ? 2 : res === 3 ? res : step });
          }
        });
    }, 5000);
  };

  // 创建商户
  createMerchant = () => {
    const { projectId, currentMerchantInfo = {}, updateCurrentMerchant = () => {} } = this.props;
    const { aliPayStatus, wechatPayStatus, merchantId, merchantStatus, merchant = {} } = this.state;
    const isNewCreate = _.isEmpty(currentMerchantInfo);
    if (!aliPayStatus && !wechatPayStatus) {
      alert(_l('请选择支付渠道'), 2);
      return;
    }
    if (isNewCreate) {
      paymentAjax
        .createMerchant({
          projectId,
          aliPayStatus: aliPayStatus ? 1 : 0,
          wechatPayStatus: wechatPayStatus ? 1 : 0,
        })
        .then(res => {
          if (res) {
            this.setState(
              {
                merchantStatus: 0,
                step: 1,
                merchantId: res,
                merchant: { ...merchant, aliPayStatus: aliPayStatus ? 1 : 0, wechatPayStatus: wechatPayStatus ? 1 : 0 },
              },
              () => this.getMerchant({ isPoll: true }),
            );
          }
        });
    } else {
      paymentAjax
        .editMerchantPayStatus({
          merchantId,
          projectId,
          aliPayStatus: aliPayStatus ? 1 : 0,
          wechatPayStatus: wechatPayStatus ? 1 : 0,
        })
        .then(res => {
          if (res) {
            this.setState(
              {
                step: _.includes([1, 2], merchantStatus) ? 2 : merchantStatus === 3 ? 3 : 1,
                merchant: { ...merchant, aliPayStatus: aliPayStatus ? 1 : 0, wechatPayStatus: wechatPayStatus ? 1 : 0 },
              },
              () =>
                this.state.step === 1 &&
                this.pollGetMerchantStatus({ merchantId, merchantNo: currentMerchantInfo.merchantNo }),
            );
            updateCurrentMerchant({
              ...currentMerchantInfo,
              aliPayStatus: aliPayStatus ? 1 : 0,
              wechatPayStatus: wechatPayStatus ? 1 : 0,
            });
          }
        });
    }
  };

  render() {
    const { projectId, currentMerchantInfo = {}, createStep } = this.props;
    const {
      step,
      bindWeixin,
      aliPayStatus,
      wechatPayStatus,
      merchant = {},
      loading,
      merchantId,
      merchantStatus,
    } = this.state;
    const { publicFormUrl, signUrl } = merchant;
    const description = (_.find(STEPS, (item, index) => step === index) || {}).description;

    return (
      <Fragment>
        <div className="orgManagementHeader">
          <Header className="bold Font17">
            <Icon
              icon="backspace"
              className="Font22 ThemeHoverColor3 pointer mRight10"
              onClick={() => {
                clearInterval(this.timeInterval);
                this.props.changeCreateMerchant(false);
                window.history.replaceState({}, '', `${location.origin}/admin/merchant/${projectId}`);
              }}
            />
            {_l('创建商户')}
          </Header>
        </div>
        <div className="orgManagementContent flexRow">
          <StepsWrap
            className={_.includes([0, 1, 2, 3], merchantStatus) ? 'isFinished' : ''}
            direction="vertical"
            current={step}
            onChange={current => {
              this.setState({ step: current });
              if (current === 0) {
                clearInterval(this.timeInterval);
                this.setState({
                  wechatPayStatus:
                    merchantStatus == 3 && _.isEmpty(merchant) ? wechatPayStatus : merchant.wechatPayStatus,
                  aliPayStatus: merchantStatus == 3 && _.isEmpty(merchant) ? aliPayStatus : merchant.aliPayStatus,
                });
                _.isUndefined(bindWeixin) && this.getWeiXinBindingInfo();
              }
              if (current === 1) {
                this.pollGetMerchantStatus({ merchantId, merchantNo: currentMerchantInfo.merchantNo });
              }
            }}
          >
            {STEPS.map((item, index) => {
              return (
                <Step
                  className={cx({
                    customTail:
                      (merchantStatus === 0 && index === 1) || (_.includes([1, 2], merchantStatus) && index === 2),
                  })}
                  key={index}
                  title={item.title}
                  disabled={
                    (merchantStatus === 0 && _.includes([2, 3], index)) ||
                    (_.includes([1, 2], merchantStatus) && _.includes([1, 3], index)) ||
                    (merchantStatus === 3 && _.includes([1, 2], index)) ||
                    (createStep === 0 && !merchantId)
                      ? true
                      : false
                  }
                  status={
                    createStep === 0 && !merchantId && index === 0
                      ? ''
                      : (merchantStatus === 0 && _.includes([0, 1], index)) ||
                        (_.includes([1, 2], merchantStatus) && _.includes([0, 1, 2], index)) ||
                        merchantStatus === 3
                      ? step !== index
                        ? 'finish'
                        : ''
                      : 'wait'
                  }
                ></Step>
              );
            })}
          </StepsWrap>
          <DivideLine />
          <div className="flex">
            <Description>
              {!description ? (
                <Fragment>
                  <div>
                    {_l(
                      '1、启用应用内的支付功能必须要先在组织后台申请商户号并完成签约。商户签约是由第三方支付公司(中投支付)提供。',
                    )}
                  </div>
                  <div>{_l('2、本平台支付手续费率为0.6%(包括支付渠道费率和 HAP 服务费)。')}</div>
                  <div>
                    {_l(
                      '3、商户签约是验证收款商户合规性的基本流程，请完成以下四步操作，并依法依规提供真实有效的信息。',
                    )}
                  </div>
                  <div>
                    {_l(
                      '4、已经通过其他支付平台拥有支付宝和微信商户号的企业如果要使用本平台收款依然需要重新完成商户签约。',
                    )}
                  </div>
                </Fragment>
              ) : (
                description
              )}
            </Description>
            {loading ? (
              <LoadDiv />
            ) : step == 0 ? (
              <Fragment>
                <div className="Font17 bold mBottom24">{_l('选择支付渠道')}</div>
                <div className="flexRow alignItemsCenter mBottom20">
                  <Checkbox
                    className="mRight6"
                    checked={aliPayStatus}
                    onClick={checked => this.setState({ aliPayStatus: !checked })}
                  />
                  <IconWrap className="aliBgColor">
                    <Icon icon="order-alipay" className="Font24" />
                  </IconWrap>
                  <span className="Font15">{_l('支付宝')}</span>
                </div>
                <div className="flexRow alignItemsCenter mBottom10">
                  <Checkbox
                    className="mRight6"
                    disabled={!bindWeixin}
                    checked={wechatPayStatus}
                    onClick={checked => this.setState({ wechatPayStatus: !checked })}
                  />
                  <IconWrap className="wechatBgColor">
                    <Icon icon="wechat_pay" className="Font24" />
                  </IconWrap>
                  <span className="Font15">{_l('微信')}</span>
                  <Tooltip text={_l('微信服务号主体必须与创建商户的主体一致')} tooltipStyle={{ maxWidth: 267 }}>
                    <Icon icon="info" className="Gray_9e mLeft6 Font16" />
                  </Tooltip>
                </div>
                {!_.isUndefined(bindWeixin) && !bindWeixin && (
                  <Prompt className="Gray_9e">
                    {_l('暂未绑定认证的服务号，')}
                    <a href={`/admin/weixin/${projectId}`} className="ThemeColor">
                      {_l('请前往组织后台')}
                    </a>
                    {_l('添加微信服务号')}
                  </Prompt>
                )}
                <Button
                  type="primary"
                  className="mTop20"
                  radius
                  onClick={this.createMerchant}
                  style={{ borderRadius: '3px' }}
                >
                  {_l('下一步')}
                </Button>
              </Fragment>
            ) : step === 1 ? (
              <Fragment>
                <div className="Font17 bold mBottom24">{_l('申请商户号')}</div>
                {publicFormUrl && (
                  <iframe
                    style={{ width: '100%', height: '100%', border: 0, margin: 0, padding: 0 }}
                    src={`${publicFormUrl}&header=no&bg=no&footer=no&statusExtra=no`}
                  ></iframe>
                )}
              </Fragment>
            ) : step === 2 ? (
              <Fragment>
                {merchantStatus === 2 ? (
                  <Fragment>
                    <div className="Font17 bold mBottom10 flex">
                      <i className="icon icon-wait mRight8 Gray_9e Font20" />
                      {_l('支付渠道配置中，等耐心等待1-2 个工作日')}
                    </div>
                    <div className="Font12 Gray_9e pLeft30">
                      {_l('如有疑问请联系您的专属顾问或客服电话：400-665-6655')}
                    </div>
                  </Fragment>
                ) : (
                  <Fragment>
                    <div className="Font17 bold mBottom24">
                      {_l('开通支付')}
                      {signUrl && (
                        <Tooltip
                          tooltipStyle={{ width: 134, height: 134 }}
                          themeColor="white"
                          tooltipClass="merchantQr"
                          popupPlacement="bottom"
                          text={<Qr content={signUrl} width={110} height={110} />}
                        >
                          <span className="Hand whiteWrap">
                            <i className="icon icon-phone mLeft10 Font20 Gray_9d" />
                          </span>
                        </Tooltip>
                      )}
                    </div>
                    <Button className="pLeft24 pRight24" onClick={() => window.open(signUrl)}>
                      {_l('前往中投支付')} <i className="icon icon-arrow_forward mLeft2" />
                    </Button>
                  </Fragment>
                )}
              </Fragment>
            ) : step === 3 ? (
              <Fragment>
                <div className="Font17 bold mBottom16">{_l('支付意愿认证')}</div>
                <div className="flexRow Font15">
                  {wechatPayStatus ? (
                    <div className="mRight60">
                      <div className="mBottom12 flexRow alignItemsCenter">
                        <IconWrap className="wechatBgColor">
                          <Icon icon="wechat_pay" className="Font24" />
                        </IconWrap>
                        <span>{_l('微信')}</span>
                      </div>
                      <Erweima>
                        <img src={wechatQrCode} />
                      </Erweima>
                    </div>
                  ) : (
                    ''
                  )}
                  {aliPayStatus ? (
                    <div>
                      <div className="mBottom12 flexRow alignItemsCenter">
                        <IconWrap className="aliBgColor">
                          <Icon icon="order-alipay" className="Font24" />
                        </IconWrap>
                        <span>{_l('支付宝')}</span>
                      </div>
                      <Erweima>
                        <img src={aliQrCode} />
                      </Erweima>
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              </Fragment>
            ) : (
              ''
            )}
          </div>
        </div>
      </Fragment>
    );
  }
}
