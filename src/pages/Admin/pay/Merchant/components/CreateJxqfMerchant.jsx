// 聚合支付 创建商户
import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Checkbox, Icon, LoadDiv, Qr } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import paymentAjax from 'src/api/payment';
import WeChatServiceAccount from 'src/components/WeChatServiceAccountsDialog';
import { Step, StepsWrap } from 'src/pages/Admin/pay/components/StepsWrap';
import aliQrCode from 'src/pages/Admin/pay/images/aliQrCode.png';
import wechatQrCode from 'src/pages/Admin/pay/images/wechatQrCode.png';
import { STEPS } from '../../config';
import './createMerchant.less';

const DivideLine = styled.div`
  width: 1px;
  border-right: 1px solid var(--color-border-secondary);
  margin: -24px 34px 0 30px;
`;

const IconWrap = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: var(--color-white);
  margin-right: 10px;
  &.wechatBgColor {
    background: var(--color-success);
  }
  &.aliBgColor {
    background: var(--color-primary);
  }
`;

const Erweima = styled.div`
  width: 200px;
  border: 1px solid var(--color-border-secondary);
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
  color: var(--color-text-tertiary);
  margin-bottom: 20px;
  color: var(--color-text-title);
`;

// 聚合支付
export default class CreateJxqfMerchant extends Component {
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
      weChatServiceAccounts: [], // 微信服务号列表
      currentWeChatServiceAccount: { appId: _.get(props, 'currentMerchantInfo.merchantPayConfigInfo.appId') }, // 当前选中的服务号
    };
    this.timeInterval = null;
    this.promise = null;
  }

  componentDidMount() {
    const { merchantStatus } = this.state;
    const { currentMerchantInfo } = this.props;

    if (!_.isEmpty(currentMerchantInfo)) {
      this.getMerchant({ isPoll: merchantStatus === 0 ? true : false });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.createStep !== this.props.createStep) {
      this.setState({ step: nextProps.createStep });
    }
  }

  componentWillUnmount() {
    clearInterval(this.timeInterval);

    this.props.getDataList();
  }

  // 获取商户信息
  getMerchant = ({ isPoll, isOpen } = {}) => {
    const { projectId } = this.props;
    const { merchantId } = this.state;
    this.setState({ loading: true });

    paymentAjax
      .getMerchant({
        projectId,
        merchantId,
      })
      .then(res => {
        this.setState({
          merchant: res,
          loading: false,
          merchantId: res.id,
          aliPayStatus: res.aliPayStatus,
          wechatPayStatus: res.wechatPayStatus,
          merchantStatus: res.status,
          currentWeChatServiceAccount: { appId: _.get(res, 'merchantPayConfigInfo.appId') },
        });
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
    const { projectId, updateCurrentMerchant = () => {} } = this.props;
    const { merchant } = this.state;
    paymentAjax
      .editMerchantStatus({
        projectId,
        merchantNo,
        status,
      })
      .then(res => {
        if (res) {
          updateCurrentMerchant({ ...merchant, status });
        }
      });
  };

  // 轮询获取商户状态
  pollGetMerchantStatus = ({ merchantId, merchantNo } = {}) => {
    const { projectId } = this.props;
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
    const { projectId, merchantPaymentChannel, updateCurrentMerchant = () => {} } = this.props;
    const {
      aliPayStatus,
      wechatPayStatus,
      merchantId,
      merchantStatus,
      merchant = {},
      currentWeChatServiceAccount,
    } = this.state;
    const isNewCreate = _.isEmpty(merchant);

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
          merchantPaymentChannel,
          merchantPayConfigInfo: currentWeChatServiceAccount?.appId
            ? { appId: currentWeChatServiceAccount?.appId }
            : undefined,
        })
        .then(res => {
          if (res.merchantNo) {
            this.setState(
              {
                merchantStatus: 0,
                step: 1,
                merchantId: res.merchantNo,
                merchant: { ...merchant, aliPayStatus: aliPayStatus ? 1 : 0, wechatPayStatus: wechatPayStatus ? 1 : 0 },
              },
              () => this.getMerchant({ isPoll: true }),
            );
          }
        });
    } else {
      const successCallback = () => {
        this.setState(
          {
            step: _.includes([1, 2], merchantStatus) ? 2 : merchantStatus === 3 ? 3 : 1,
            merchant: {
              ...merchant,
              aliPayStatus: aliPayStatus ? 1 : 0,
              wechatPayStatus: wechatPayStatus ? 1 : 0,
              merchantPayConfigInfo: { ...merchant?.merchantPayConfigInfo, ...currentWeChatServiceAccount },
            },
          },
          () => this.state.step === 1 && this.pollGetMerchantStatus({ merchantId, merchantNo: merchant.merchantNo }),
        );
        updateCurrentMerchant({
          ...merchant,
          aliPayStatus: aliPayStatus ? 1 : 0,
          wechatPayStatus: wechatPayStatus ? 1 : 0,
        });
      };

      if (
        merchantId === merchant?.id &&
        aliPayStatus === merchant?.aliPayStatus &&
        wechatPayStatus === merchant?.wechatPayStatus &&
        currentWeChatServiceAccount?.appId === merchant?.merchantPayConfigInfo?.appId
      ) {
        successCallback();
        return;
      }

      paymentAjax
        .editMerchantPayStatus({
          merchantId,
          projectId,
          aliPayStatus: aliPayStatus ? 1 : 0,
          wechatPayStatus: wechatPayStatus ? 1 : 0,
          merchantPayConfigInfo: currentWeChatServiceAccount?.appId
            ? { appId: currentWeChatServiceAccount?.appId }
            : undefined,
        })
        .then(res => {
          if (res) {
            successCallback();
          }
        });
    }
  };

  render() {
    const { projectId, createStep, onClose = () => {} } = this.props;
    const {
      step,
      aliPayStatus,
      wechatPayStatus,
      merchant = {},
      loading,
      merchantId,
      merchantStatus,
      weChatServiceAccounts,
      currentWeChatServiceAccount,
    } = this.state;
    const { publicFormUrl, signUrl } = merchant;
    const description = (_.find(STEPS, (item, index) => step === index) || {}).description;

    return (
      <Fragment>
        <div className="orgManagementHeader">
          <div className="createMerchantHeader bold Font17">
            <Icon icon="backspace" className="Font22 ThemeHoverColor3 pointer mRight10" onClick={onClose} />
            {_l('聚合支付')}
          </div>
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
              }

              if (current === 1) {
                this.pollGetMerchantStatus({ merchantId, merchantNo: merchant.merchantNo });
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
                      '1、启用应用内的支付功能必须要先在组织后台申请商户号并完成签约。商户签约是由第三方支付公司提供。',
                    )}
                  </div>
                  <div>
                    {_l(
                      '2、商户签约是验证收款商户合规性的基本流程，请完成以下四步操作，并依法依规提供真实有效的信息。',
                    )}
                  </div>
                  <div>
                    {_l(
                      '3、已经通过其他支付平台拥有支付宝和微信商户号的企业如果要使用本平台收款依然需要重新完成商户签约。',
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
                    onClick={checked => this.setState({ aliPayStatus: checked ? 0 : 1 })}
                  />
                  <IconWrap className="aliBgColor">
                    <Icon icon="order-alipay" className="Font24" />
                  </IconWrap>
                  <span className="Font15">{_l('支付宝')}</span>
                </div>
                <div className="flexRow alignItemsCenter mBottom10">
                  <Checkbox
                    className="mRight6"
                    disabled={!currentWeChatServiceAccount?.appId || _.isEmpty(weChatServiceAccounts)}
                    checked={wechatPayStatus}
                    onClick={checked => this.setState({ wechatPayStatus: checked ? 0 : 1 })}
                  />
                  <IconWrap className="wechatBgColor">
                    <Icon icon="wechat_pay" className="Font24" />
                  </IconWrap>
                  <span className="Font15">{_l('微信')}</span>
                  <Tooltip title={_l('微信服务号主体必须与创建商户的主体一致')}>
                    <Icon icon="info" className="textTertiary mLeft6 Font16" />
                  </Tooltip>
                </div>
                <div>
                  <WeChatServiceAccount
                    className="mLeft30"
                    projectId={projectId}
                    noRequest={!!weChatServiceAccounts.length}
                    selectedServiceAppId={currentWeChatServiceAccount?.appId}
                    weChatServiceAccounts={weChatServiceAccounts}
                    updateWeChatServiceInfo={({ weChatServiceAccounts, service = {} }) => {
                      this.setState({
                        weChatServiceAccounts,
                        currentWeChatServiceAccount: { ...currentWeChatServiceAccount, appId: service.appId },
                        wechatPayStatus: _.isEmpty(merchant) ? !_.isEmpty(service) : merchant.wechatPayStatus,
                      });
                    }}
                  />
                </div>

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
                    src={`${publicFormUrl}&header=no&bg=no&footer=no&statusExtra=no&submit=left&cover=no`}
                  ></iframe>
                )}
              </Fragment>
            ) : step === 2 ? (
              <Fragment>
                {merchantStatus === 2 ? (
                  <Fragment>
                    <div className="Font17 bold mBottom10 flex">
                      <i className="icon icon-wait mRight8 textTertiary Font20" />
                      {_l('支付渠道配置中，等耐心等待1-2 个工作日')}
                    </div>
                    <div className="Font12 textTertiary pLeft30">
                      {_l('如有疑问请联系您的专属顾问或客服电话：400-665-6655')}
                    </div>
                  </Fragment>
                ) : (
                  <Fragment>
                    <div className="Font17 bold mBottom24">
                      {_l('开通支付')}
                      {signUrl && (
                        <Tooltip
                          type="white"
                          placement="bottom"
                          title={
                            <span className="mTop3 mBottom3">
                              <Qr content={signUrl} width={110} height={110} />
                            </span>
                          }
                        >
                          <span className="Hand whiteWrap">
                            <i className="icon icon-phone mLeft10 Font20 textTertiary" />
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
