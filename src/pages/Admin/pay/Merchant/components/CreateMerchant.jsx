import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { PAY_CHANNEL } from '../../config';
import jxqfImg from '../../images/jxqf.png';
import CreateJxqfMerchant from './CreateJxqfMerchant';
import CreateWechatOrAliMerchant from './CreateWechatOrAliMerchant';
import './createMerchant.less';

const Header = styled.div`
  .icon-backspace {
    vertical-align: text-top;
  }
`;

const PayChannelItem = styled.div`
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #ededed;
  margin: 0 120px;
  padding: 20px 24px;
  &:hover {
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
  }
  .channelIcon {
    width: 26px;
    height: 26px;
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
  }
`;

export default class CreateMerchant extends Component {
  constructor(props) {
    super(props);
    this.state = {
      merchantPaymentChannel: _.get(props, 'currentMerchantInfo.merchantPaymentChannel'), // 支付渠道：0->聚合支付 2->微信支付 1->支付宝支付
    };
  }

  render() {
    const { projectId, currentMerchantInfo = {} } = this.props;
    const { merchantPaymentChannel } = this.state;

    if (merchantPaymentChannel === 0) {
      return (
        <CreateJxqfMerchant
          {...this.props}
          merchantPaymentChannel={merchantPaymentChannel}
          onClose={() =>
            !_.isEmpty(currentMerchantInfo)
              ? this.props.changeCreateMerchant(false)
              : this.setState({ merchantPaymentChannel: undefined })
          }
        />
      );
    }

    if (_.includes([1, 2], merchantPaymentChannel)) {
      return (
        <CreateWechatOrAliMerchant
          {...this.props}
          merchantPaymentChannel={merchantPaymentChannel}
          changeCreateMerchant={this.props.changeCreateMerchant}
          onClose={() =>
            !_.isEmpty(currentMerchantInfo)
              ? this.props.changeCreateMerchant(false)
              : this.setState({ merchantPaymentChannel: undefined })
          }
        />
      );
    }

    return (
      <Fragment>
        <div className="orgManagementHeader">
          <Header className="bold Font17">
            <Icon
              icon="backspace"
              className="Font22 ThemeHoverColor3 pointer mRight10"
              onClick={() => {
                this.props.changeCreateMerchant(false);
                window.history.replaceState({}, '', `${location.origin}/admin/merchant/${projectId}`);
              }}
            />
            {_l('创建商户')}
          </Header>
        </div>
        <div className="orgManagementContent">
          <div className="bold Font24 TxtCenter mBottom20">{_l('支付渠道')}</div>
          <div className="Font18 TxtCenter Gray_9e mBottom50">
            {_l('根据业务需求平台提供不同的支付收款渠道，支持创建多个通道的商户')}
          </div>
          {PAY_CHANNEL.filter(item => (md.global.Config.IsLocal ? item.value !== 0 : true)).map(item => {
            return (
              <PayChannelItem
                key={item.value}
                className="mBottom15 Hand"
                onClick={() => {
                  if (merchantPaymentChannel === item.value) return;
                  this.setState({ merchantPaymentChannel: item.value });
                }}
              >
                <div className="flexRow mBottom10">
                  <div
                    className={cx('channelIcon mRight14', {
                      wechatBgColor: item.value === 2,
                      aliBgColor: item.value === 1,
                    })}
                  >
                    {item.value === 0 ? (
                      <img src={jxqfImg} className="w100" />
                    ) : (
                      <Icon icon={item.icon} className={item.value === 2 ? 'Font18' : 'Font24'} />
                    )}
                  </div>
                  <div className="bold Font17">{item.label}</div>
                </div>
                <div className="Font15 Gray_75">{item.desc}</div>
              </PayChannelItem>
            );
          })}
        </div>
      </Fragment>
    );
  }
}
